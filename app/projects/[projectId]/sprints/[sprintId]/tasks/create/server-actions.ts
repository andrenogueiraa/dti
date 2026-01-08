"use server";

import { db } from "@/drizzle";
import { tasks } from "@/drizzle/core-schema";
import { user } from "@/drizzle/auth-schema";
import { CreateTaskFormSchema } from "./form";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createTask({
  data,
  sprintId,
  projectId,
}: {
  data: CreateTaskFormSchema;
  sprintId: string;
  projectId: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [task] = await db
    .insert(tasks)
    .values({ ...data, sprintId, createdBy: session.user.id })
    .returning({ id: tasks.id });

  revalidatePath(`/projects/${projectId}/sprints/${sprintId}/tasks`);

  return task;
}

export async function getUsers() {
  return await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user);
}
