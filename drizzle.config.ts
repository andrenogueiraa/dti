import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: ["./drizzle/core-schema.ts", "./drizzle/auth-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  extensionsFilters: ["postgis"],
  verbose: true,
  casing: "snake_case",
});
