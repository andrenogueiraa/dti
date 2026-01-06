"use server";

import { db } from "@/drizzle";

export async function getFutureProjects() {
  return await db.query.projects.findMany({
    where: (projects, { eq }) => eq(projects.status, "AI"),
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    columns: {
      id: true,
      name: true,
      description: true,
      color: true,
      complexity: true,
      socialImpact: true,
      semarhImpact: true,
      estimatedWeeks: true,
      createdAt: true,
    },
    with: {
      responsibleTeam: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });
}

