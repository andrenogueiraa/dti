import { db } from "@/drizzle";

export async function getItems() {
  return await db.query.docs.findMany();
}

export type ItemsType = Awaited<ReturnType<typeof getItems>>;

export type ItemType = ItemsType[number];
