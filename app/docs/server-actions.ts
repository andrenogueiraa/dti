"use server";

import { db } from "@/drizzle";

export async function getDocs() {
  return await db.query.docs.findMany();
}

export type DocsType = Awaited<ReturnType<typeof getDocs>>;

export type DocType = DocsType[number];
