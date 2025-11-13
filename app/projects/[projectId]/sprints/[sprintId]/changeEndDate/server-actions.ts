"use server";

import { db } from "@/drizzle";
import { sprints } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";
import { ChangeEndDateFormSchema } from "./form";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { unauthorized } from "next/navigation";

export async function getSprint(sprintId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const userId = session.user.id;

  const sprint = await db.query.sprints.findFirst({
    where: eq(sprints.id, sprintId),
    columns: {
      id: true,
      finishDate: true,
    },
    with: {
      project: {
        columns: {},
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
      },
    },
  });

  const allowedUserIds =
    sprint?.project?.responsibleTeam?.userDevTeams.map(
      (userDevTeam) => userDevTeam.userId
    ) ?? [];

  if (!allowedUserIds.includes(userId)) {
    unauthorized();
  }

  return sprint;
}

export async function changeEndDate({
  data,
  sprintId,
  projectId,
}: {
  data: ChangeEndDateFormSchema;
  sprintId: string;
  projectId: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  await db
    .update(sprints)
    .set({
      finishDate: data.finishDate,
      updatedAt: new Date(),
      updatedBy: userId,
    })
    .where(eq(sprints.id, sprintId));

  revalidatePath(`/projects/${projectId}`);
}
