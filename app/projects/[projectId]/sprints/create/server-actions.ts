"use server";

import { db } from "@/drizzle";
import { docs, sprints } from "@/drizzle/core-schema";
import { CreateSprintFormSchema } from "./form";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createSprint({
  data,
  projectId,
}: {
  data: CreateSprintFormSchema;
  projectId: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  await db.transaction(async (tx) => {
    const [docReview] = await tx
      .insert(docs)
      .values({
        type: "SREV",
        date: null,
        content:
          "## Tópicos abordados\n- Tópico 1\n- Tópico 2\n\n## Metas para a próxima sprint\n- Meta 1\n- Meta 2\n\n## Participantes\n- Participante 1\n- Participante 2",
        createdBy: userId,
      })
      .returning({ id: docs.id });

    await tx
      .insert(sprints)
      .values({
        ...data,
        startDate: data.startDate,
        finishDate: null,
        projectId,
        createdBy: userId,
        docReviewId: docReview.id,
      })
      .returning({ id: sprints.id });
  });

  revalidateTag(projectId, "default");

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/`);
}
