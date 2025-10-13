"use server";

import { db } from "@/drizzle";
import { docs, sprints } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";
import { EditSprintReviewFormSchema } from "./form";

export async function getSprintReview(sprintId: string) {
  return await db.query.sprints.findFirst({
    where: eq(sprints.id, sprintId),
    columns: {},
    with: {
      docReview: true,
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
