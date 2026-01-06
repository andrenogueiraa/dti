"use server";

import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { CreateFutureProjectFormSchema } from "./client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { devTeams } from "@/drizzle/core-schema";

export default async function createFutureProject(
  data: CreateFutureProjectFormSchema
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  await db.insert(projects).values({
    name: data.name,
    description: data.description,
    color: data.color,
    responsibleTeamId: data.responsibleTeamId ? data.responsibleTeamId : null,
    complexity: data.complexity || null,
    socialImpact: data.socialImpact || null,
    semarhImpact: data.semarhImpact || null,
    estimatedWeeks: data.estimatedWeeks || null,
    createdBy: session.user.id,
  });

  revalidatePath("/");
  revalidatePath("/future-projects");
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

