import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./core-schema";
import * as authSchema from "./auth-schema";

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === "production",
  },
  schema: { ...schema, ...authSchema },
});

// Export all schemas for easy access
// export * from "./core-schema";
// export * from "./auth-schema";
