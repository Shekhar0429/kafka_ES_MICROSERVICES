const { Pool } = require("pg");
require("dotenv").config();

class DatabaseManager {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Add connection pool configuration for better performance
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error if connection takes longer than 2 seconds
    });

    this.setupEventHandlers();
    this.initializeDatabase();
  }

  setupEventHandlers() {
    this.pool.on("connect", (client) => {
      console.log("New client connected to database");
    });

    this.pool.on("error", (err, client) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });

    this.pool.on("remove", (client) => {
      console.log("Client removed from pool");
    });
  }

  async initializeDatabase() {
    try {
      await this.createTables();
      console.log("Database initialization completed successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error.message);
      throw error;
    }
  }

  async createTables() {
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Add an index on email for better query performance
    const createEmailIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    // Add an index on username for better query performance
    const createUsernameIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `;

    try {
      await this.pool.query(createUsersTableQuery);
      await this.pool.query(createEmailIndexQuery);
      await this.pool.query(createUsernameIndexQuery);
      console.log("Users table and indexes created successfully");
    } catch (error) {
      console.error("Error creating users table:", error.message);
      throw error;
    }
  }

  // Enhanced query method with better error handling and logging
  async query(text, params = []) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log slow queries (queries taking more than 100ms)
      if (duration > 100) {
        console.warn(`Slow query detected (${duration}ms):`, text);
      }
      
      return result;
    } catch (error) {
      console.error("Database query error:", {
        query: text,
        params,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  // Method to get a client from the pool for transactions
  async getClient() {
    try {
      return await this.pool.connect();
    } catch (error) {
      console.error("Error getting client from pool:", error.message);
      throw error;
    }
  }

  // Transaction helper method
  async transaction(callback) {
    const client = await this.getClient();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Transaction failed:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const result = await this.pool.query("SELECT NOW()");
      return {
        status: "healthy",
        timestamp: result.rows[0].now,
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  }

  // Graceful shutdown method
  async close() {
    try {
      await this.pool.end();
      console.log("Database pool has ended");
    } catch (error) {
      console.error("Error closing database pool:", error.message);
      throw error;
    }
  }
}

// Create singleton instance
const db = new DatabaseManager();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully");
  await db.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully");
  await db.close();
  process.exit(0);
});

// Export the database instance and its methods
module.exports = {
  query: (text, params) => db.query(text, params),
  getClient: () => db.getClient(),
  transaction: (callback) => db.transaction(callback),
  healthCheck: () => db.healthCheck(),
  close: () => db.close(),
  pool: db.pool, // Export pool for advanced use cases
};