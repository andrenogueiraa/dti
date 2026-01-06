"use server";

import { db } from "@/drizzle";

export async function getAllProjects() {
  return await db.query.projects.findMany({
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    columns: {
      id: true,
      name: true,
      description: true,
      color: true,
      status: true,
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
      sprints: {
        columns: {
          id: true,
          progress: true,
        },
        orderBy: (sprints, { asc }) => [asc(sprints.createdAt)],
      },
    },
  });
}
