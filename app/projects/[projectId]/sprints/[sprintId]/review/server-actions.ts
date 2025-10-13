"use server";

import { db } from "@/drizzle";
import { sprints } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";

export async function getSprintReview(sprintId: string) {
  return await db.query.sprints.findFirst({
    where: eq(sprints.id, sprintId),
    with: {
      docReview: true,
    },
  });
}
