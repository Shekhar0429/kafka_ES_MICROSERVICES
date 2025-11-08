import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import * as config from "./src/config/index";

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    url: config.DATABASE_URL as string,
  },
});
