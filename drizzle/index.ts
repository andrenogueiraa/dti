import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./core-schema";
import * as authSchema from "./auth-schema";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set");
}

export const db = drizzle({
  connection: {
    connectionString: process.env.POSTGRES_URL,
  },
  schema: { ...schema, ...authSchema },
});
