"use server";

import { db } from "@/drizzle";
import { docs, images, projects } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";
import { EditProjectOpeningFormSchema } from "./form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const PROJECT_OPENING_TEMPLATE = `## Objetivos do Projeto

- Objetivo 1
- Objetivo 2

## Escopo

Descreva o escopo do projeto aqui.

## Equipe Responsável

- Membro 1
- Membro 2

## Cronograma Inicial

- Fase 1: Descrição
- Fase 2: Descrição

## Riscos e Dependências

- Risco 1: Descrição
- Dependência 1: Descrição
`;

export async function getProjectOpening(projectId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: {},
    with: {
      docOpening: {
        with: {
          images: true,
        },
      },
    },
  });

  return project?.docOpening || null;
}

export type ProjectOpeningType = NonNullable<
  Awaited<ReturnType<typeof getProjectOpening>>
>;

export async function createProjectOpening(projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [doc] = await db
    .insert(docs)
    .values({
      type: "POPEN",
      date: new Date(),
      content: PROJECT_OPENING_TEMPLATE,
      createdBy: userId,
    })
    .returning({ id: docs.id });

  await db
    .update(projects)
    .set({
      docOpeningId: doc.id,
      updatedAt: new Date(),
      updatedBy: userId,
    })
    .where(eq(projects.id, projectId));

  return doc;
}

export async function updateProjectOpening({
  docId,
  data,
}: {
  docId: string;
  data: EditProjectOpeningFormSchema;
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

export async function finishProjectOpening(docId: string, projectId: string) {
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
