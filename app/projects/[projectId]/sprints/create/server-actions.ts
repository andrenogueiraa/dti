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
    // Buscar última sprint do projeto
    const { success, message } = await canCreateSprint(projectId);

    // Validar se a review foi finalizada
    if (!success) {
      throw new Error(message || "Não é possível criar uma nova sprint.");
    }

    const [docReview] = await tx
      .insert(docs)
      .values({
        type: "SREV",
        date: data.finishDate,
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
        finishDate: data.finishDate,
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

export async function canCreateSprint(projectId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const project = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.id, projectId),
    with: {
      docOpening: {
        columns: { finishedAt: true },
      },
      sprints: {
        orderBy: (sprints, { desc }) => [
          desc(sprints.startDate),
          desc(sprints.id),
        ],
        limit: 1,
        with: {
          docReview: {
            columns: { finishedAt: true },
          },
        },
      },
    },
  });

  if (!project) {
    return {
      success: false,
      message: "Projeto não encontrado.",
    };
  }

  if (!project.docOpening) {
    return {
      success: false,
      message:
        "Não é possível criar uma nova sprint sem um documento de abertura.",
    };
  }

  if (project.docOpening.finishedAt === null) {
    return {
      success: false,
      message:
        "O documento de abertura do projeto ainda não foi finalizado. Finalize-o para poder criar uma sprint.",
    };
  }

  if (project.sprints.length === 0) {
    return { success: true };
  }

  const lastSprint = project.sprints[0];

  if (!lastSprint.docReview) {
    return {
      success: false,
      message:
        "A sprint anterior não possui um documento de revisão (Sprint Review).",
    };
  }

  if (lastSprint.docReview.finishedAt === null) {
    return {
      success: false,
      message:
        "Finalize a Sprint Review da sprint anterior antes de criar uma nova sprint.",
    };
  }

  return { success: true };
}
