import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./core-schema";
import * as authSchema from "./auth-schema";

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle({
  client,
  schema: { ...schema, ...authSchema },
  logger: true,
});
