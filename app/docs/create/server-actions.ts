"use server";

import { db } from "@/drizzle";
import { docs } from "@/drizzle/core-schema";
import { CreateDocFormSchema } from "./page";

export async function createDoc(data: CreateDocFormSchema) {
  const [doc] = await db.insert(docs).values(data).returning({ id: docs.id });
  return doc;
}

export async function getDocTypes() {
  const docTypes = await db.query.docTypes.findMany();
  return docTypes;
}
