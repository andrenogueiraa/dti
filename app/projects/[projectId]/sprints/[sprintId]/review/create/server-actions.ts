"use server";

import { db } from "@/drizzle";
import { docs, sprints } from "@/drizzle/core-schema";
import { CreateSprintReviewFormSchema } from "./form";
import { eq } from "drizzle-orm";

export async function createSprintReview({
  data,
  sprintId,
}: {
  data: CreateSprintReviewFormSchema;
  sprintId: string;
}) {
  return await db.transaction(async (tx) => {
    const [doc] = await tx
      .insert(docs)
      .values({ ...data, type: "SREV" })
      .returning({ id: docs.id });

    await tx
      .update(sprints)
      .set({ docReviewId: doc.id })
      .where(eq(sprints.id, sprintId));

    return doc;
  });
}
