"use server";

import { db } from "@/drizzle";
import { docs, images, sprints } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";
import { EditSprintReviewFormSchema } from "./form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return await db
    .update(docs)
    .set({
      ...data,
      updatedAt: new Date(),
      updatedBy: session.user.id,
    })
    .where(eq(docs.id, docId))
    .returning({ id: docs.id });
}

export async function finishSprintReview(docId: string, projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [doc] = await db
    .update(docs)
    .set({
      finishedAt: new Date(),
      updatedAt: new Date(),
      updatedBy: session.user.id,
    })
    .where(eq(docs.id, docId))
    .returning({ id: docs.id });

    revalidatePath(`/projects/${projectId}`);

    return doc;
}

export async function deleteImage(imageId: string) {
  return await db.delete(images).where(eq(images.id, imageId));
}
