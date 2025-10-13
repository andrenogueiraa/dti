"use server";
import { db } from "@/drizzle";

export async function getUsers() {
  return await db.query.user.findMany();
}

export type UsersType = Awaited<ReturnType<typeof getUsers>>;

export type User = UsersType[number];
