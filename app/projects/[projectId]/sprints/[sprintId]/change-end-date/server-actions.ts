"use server";

import { db } from "@/drizzle";
import { docs, sprints } from "@/drizzle/core-schema";
import { and, eq } from "drizzle-orm";
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
      docReviewId: true,
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
  reviewId,
}: {
  data: ChangeEndDateFormSchema;
  sprintId: string;
  projectId: string;
  reviewId: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const userId = session.user.id;

  await db.transaction(async (tx) => {
    await tx
      .update(sprints)
      .set({
        finishDate: data.finishDate,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(sprints.id, sprintId));

    await tx
      .update(docs)
      .set({
        date: data.finishDate,
      })
      .where(and(eq(docs.id, reviewId), eq(docs.type, "SREV")));
  });

  revalidatePath(`/projects/${projectId}`);
}
