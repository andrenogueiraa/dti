"use server";

import { db } from "@/drizzle";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getDevTeams() {
  return await db.query.devTeams.findMany({
    orderBy: (devTeams, { asc }) => [asc(devTeams.name)],
    with: {
      projects: {
        where: (projects, { ne }) => ne(projects.status, "CO"),
        orderBy: (projects, { asc }) => [asc(projects.id)],
        with: {
          sprints: {
            orderBy: (sprints, { asc }) => [asc(sprints.createdAt)],
          },
        },
      },
    },
  });
}

export async function revalidateDevTeams() {
  revalidatePath("/");
  redirect("/");
}

export async function getProjectsWithNoTeam() {
  return await db.query.projects.findMany({
    where: (projects, { isNull }) => isNull(projects.responsibleTeamId),
    with: {
      sprints: {
        orderBy: (sprints, { asc }) => [asc(sprints.createdAt)],
      },
    },
  });
}
