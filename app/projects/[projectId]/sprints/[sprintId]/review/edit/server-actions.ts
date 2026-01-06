"use server";

import { db } from "@/drizzle";
import { docs, images, sprints } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";
import { EditSprintReviewFormSchema } from "./form";

export async function getSprintReview(sprintId: string) {
  return await db.query.sprints.findFirst({
    where: eq(sprints.id, sprintId),
    columns: {},
    with: {
      docReview: {
        with: {
          images: true,
        },
      },
    },
  });
}

export type SprintReviewType = NonNullable<
  Awaited<ReturnType<typeof getSprintReview>>
>["docReview"];

export async function updateSprintReview({
  docId,
  data,
}: {
  docId: string;
  data: EditSprintReviewFormSchema;
}) {
  return await db
    .update(docs)
    .set({
      ...data,
    })
    .where(eq(docs.id, docId))
    .returning({ id: docs.id });
}

export async function finishSprintReview(docId: string) {
  return await db
    .update(docs)
    .set({ finishedAt: new Date() })
    .where(eq(docs.id, docId))
    .returning({ id: docs.id });
}

export async function deleteImage(imageId: string) {
  return await db.delete(images).where(eq(images.id, imageId));
}
