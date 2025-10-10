"use server";

import { db } from "@/drizzle";
import { tasks } from "@/drizzle/core-schema";
import { user } from "@/drizzle/auth-schema";
import { CreateTaskFormSchema } from "./form";

export async function createTask({
  data,
  sprintId,
}: {
  data: CreateTaskFormSchema;
  sprintId: string;
}) {
  const [task] = await db
    .insert(tasks)
    .values({ ...data, sprintId })
    .returning({ id: tasks.id });
  return task;
}

export async function getUsers() {
  return await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user);
}
