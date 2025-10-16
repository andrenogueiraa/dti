"use server";

import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { CreateProjectFormSchema } from "./client";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function createProject(data: CreateProjectFormSchema) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    redirect("/login");
  }

  const [project] = await db
    .insert(projects)
    .values({
      name: data.name,
      description: data.description,
      color: data.color,
      responsibleTeamId: data.responsibleTeamId,
      startDate: new Date(),
      finishDate: new Date(),
      createdAt: new Date(),
      createdBy: session.user.id,
    })
    .returning({ id: projects.id });

  revalidatePath("/");
  revalidatePath("/dev-teams");
  revalidateTag("dev-teams");

  return project;
}
