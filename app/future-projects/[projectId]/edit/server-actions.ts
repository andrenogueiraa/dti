"use server";

import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";
import { EditFutureProjectFormSchema } from "./client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFutureProject } from "../../server-actions";

export async function updateFutureProject(
  projectId: string,
  data: EditFutureProjectFormSchema
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  await db
    .update(projects)
    .set({
      name: data.name,
      description: data.description,
      color: data.color,
      responsibleTeamId: data.responsibleTeamId ? data.responsibleTeamId : null,
      complexity: data.complexity || null,
      socialImpact: data.socialImpact || null,
      semarhImpact: data.semarhImpact || null,
      estimatedWeeks: data.estimatedWeeks || null,
    })
    .where(eq(projects.id, projectId));

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/future-projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function getFutureProjectForEdit(projectId: string) {
  return await getFutureProject(projectId);
}

export async function getAllDevTeams() {
  return await db.query.devTeams.findMany({
    orderBy: (devTeams, { asc }) => [asc(devTeams.name)],
    columns: {
      id: true,
      name: true,
    },
  });
}
