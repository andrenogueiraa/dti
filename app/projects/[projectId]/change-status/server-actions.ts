"use server";

import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";
import { ChangeStatusFormSchema } from "./client";
import { revalidateDevTeams } from "@/app/server-actions";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

export async function changeProjectStatus({
  data,
  projectId,
}: {
  data: ChangeStatusFormSchema;
  projectId: string;
}) {
  await db
    .update(projects)
    .set({ status: data.status })
    .where(eq(projects.id, projectId));

  revalidateDevTeams();
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/future-projects");
}

export async function getProjectStatus(projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const userId = session.user.id;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: {
      status: true,
    },
    with: {
      responsibleTeam: {
        columns: {
          id: true,
        },
        with: {
          userDevTeams: {
            columns: {
              userId: true,
            },
          },
        },
      },
    },
  });

  const allowedUserIds =
    project?.responsibleTeam?.userDevTeams.map(
      (userDevTeam) => userDevTeam.userId
    ) ?? [];

  if (!allowedUserIds.includes(userId)) {
    unauthorized();
  }

  return project;
}
