import { db } from "@/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  admin,
  jwt,
  openAPI,
  organization,
  phoneNumber,
  username,
} from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    nextCookies(),
    openAPI(),

    admin({
      adminUserIds: [process.env.ADMIN_USER_ID as string],
    }),
    jwt(),
    organization({
      teams: { enabled: true },
    }),
    phoneNumber(),
    username(),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 10 * 60,
    },
  },
});
