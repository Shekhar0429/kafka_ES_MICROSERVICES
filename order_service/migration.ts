import { Pool } from "pg";
import { DATABASE_URL } from "./src/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function runMigrations() {
  try {
    console.log("Starting migration...");
    const pool = new Pool({
      connectionString: DATABASE_URL,
    });
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("Migration completed successfully.");
    await pool.end();
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

runMigrations();
// To run this script, use the command: ts-node order_service/migration.ts
// Ensure you have ts-node installed and your tsconfig.json is properly set up.
