"use server";

import { db } from "@/drizzle";
import { tasks } from "@/drizzle/core-schema";
import { user } from "@/drizzle/auth-schema";
import { CreateTaskFormSchema } from "./form";
import { revalidatePath } from "next/cache";

export async function createTask({
  data,
  sprintId,
  projectId,
}: {
  data: CreateTaskFormSchema;
  sprintId: string;
  projectId: string;
}) {
  const [task] = await db
    .insert(tasks)
    .values({ ...data, sprintId })
    .returning({ id: tasks.id });

  revalidatePath(`/projects/${projectId}/sprints/${sprintId}/tasks`);

  return task;
}

export async function getUsers() {
  return await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user);
}
