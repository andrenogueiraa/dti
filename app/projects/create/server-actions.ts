"use server";

import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { CreateProjectFormSchema } from "./page";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getDevTeams() {
  return await db.query.devTeams.findMany();
}

export default async function createProject(data: CreateProjectFormSchema) {
  const [project] = await db
    .insert(projects)
    .values({
      name: data.name,
      description: data.description,
      color: data.color,
      responsibleTeamId:
        data.responsibleTeamId !== "" ? data.responsibleTeamId : null,
      startDate: new Date(),
      finishDate: new Date(),
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 1,
      updatedBy: 1,
      deletedBy: null,
    })
    .returning({ id: projects.id });

  revalidatePath("/dev-teams");
  revalidateTag("dev-teams");

  return project;
}
