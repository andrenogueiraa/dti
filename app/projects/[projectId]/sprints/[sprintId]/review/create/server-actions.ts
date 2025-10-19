"use server";

import { db } from "@/drizzle";
import { docs, images, sprints } from "@/drizzle/core-schema";
import { CreateSprintReviewFormSchema } from "./form";
import { eq, inArray } from "drizzle-orm";

export async function createSprintReview({
  data,
  sprintId,
  imageIds = [],
}: {
  data: CreateSprintReviewFormSchema;
  sprintId: string;
  imageIds?: string[];
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

    if (imageIds.length > 0) {
      await tx
        .update(images)
        .set({
          docId: doc.id,
        })
        .where(inArray(images.id, imageIds));
    }

    return doc;
  });
}
