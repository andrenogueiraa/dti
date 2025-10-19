"use server";

import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";

export async function getProject(projectId: string) {
  return await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: {
      id: true,
      name: true,
      description: true,
      color: true,
    },
    with: {
      images: true,
      pdfs: true,
      sprints: {
        columns: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          finishDate: true,
          progress: true,
        },
        orderBy: (sprints, { asc }) => [asc(sprints.startDate)],
        with: {
          docReview: {
            columns: {
              id: true,
            },
          },
          docRetrospective: {
            columns: {
              id: true,
            },
          },
        },
      },
    },
  });
}
