import { db } from "@/drizzle";

export async function getDocs() {
  return await db.query.docs.findMany({
    with: {
      type: true,
    },
  });
}

export type DocsType = Awaited<ReturnType<typeof getDocs>>;

export type DocType = DocsType[number];
