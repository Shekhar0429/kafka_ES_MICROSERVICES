import * as schema from "./schema";
import { DATABASE_URL } from "../config";
import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const DB: NodePgDatabase<typeof schema> = drizzle(pool, { schema });
