import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set");
}

export default defineConfig({
  out: "./drizzle",
  schema: ["./drizzle/core-schema.ts", "./drizzle/auth-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
  // extensionsFilters: ["postgis"],
  verbose: true,
  casing: "snake_case",
});
