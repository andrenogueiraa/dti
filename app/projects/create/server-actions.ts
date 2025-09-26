"use server";

import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { CreateProjectFormSchema } from "./page";

export async function getDevTeams() {
  return await db.query.devTeams.findMany();
}

export default async function createProject(data: CreateProjectFormSchema) {
  const [project] = await db
    .insert(projects)
    .values({
      name: data.name,
      description: data.description,
      responsibleTeamId: data.responsibleTeamId,
      startDate: new Date(),
      finishDate: new Date(),
      color: data.color,
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 1,
      updatedBy: 1,
      deletedBy: null,
    })
    .returning({ id: projects.id });

  return project;
}
