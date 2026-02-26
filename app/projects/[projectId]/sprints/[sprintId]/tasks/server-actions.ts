"use server";

import { db } from "@/drizzle";
import { tasks } from "@/drizzle/core-schema";
import { user } from "@/drizzle/auth-schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getTasks(sprintId: string) {
  return await db.query.tasks.findMany({
    where: eq(tasks.sprintId, sprintId),
    with: {
      responsibleUser: true,
    },
    orderBy: (tasks, { asc }) => [asc(tasks.order)],
  });
}

export async function updateTask({
  taskId,
  data,
  projectId,
  sprintId,
}: {
  taskId: string;
  data: {
    name: string;
    description: string;
    urgency?: string;
    responsibleUserId?: string;
    tags?: string[];
  };
  projectId: string;
  sprintId: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  await db
    .update(tasks)
    .set({
      ...data,
      updatedAt: new Date(),
      updatedBy: session.user.id,
    })
    .where(eq(tasks.id, taskId));

  revalidatePath(`/projects/${projectId}/sprints/${sprintId}/tasks`);
}

export async function getUsers() {
  return await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user);
}

export async function updateTaskStatus(taskId: string, status: string) {
  await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));
}

export async function updateTaskOrder(taskId: string, order: number) {
  await db.update(tasks).set({ order }).where(eq(tasks.id, taskId));
}

export async function updateTaskStatusAndOrder(
  taskId: string,
  status: string,
  order: number
) {
  try {
    const result = await db
      .update(tasks)
      .set({ status, order })
      .where(eq(tasks.id, taskId))
      .returning();
    return result;
  } catch (error) {
    console.error("Failed to update task status and order:", error);
    throw error;
  }
}

export async function bulkUpdateTaskOrders(
  updates: { id: string; order: number }[]
) {
  try {
    await Promise.all(
      updates.map((update) =>
        db
          .update(tasks)
          .set({ order: update.order })
          .where(eq(tasks.id, update.id))
      )
    );
  } catch (error) {
    console.error("Failed to bulk update task orders:", error);
    throw error;
  }
}

export async function bulkUpdateTaskStatusAndOrders(
  updates: { id: string; order: number; status?: string }[]
) {
  try {
    await Promise.all(
      updates.map((update) =>
        db
          .update(tasks)
          .set({
            order: update.order,
            ...(update.status !== undefined ? { status: update.status } : {}),
          })
          .where(eq(tasks.id, update.id))
      )
    );
  } catch (error) {
    console.error("Failed to bulk update task status and orders:", error);
    throw error;
  }
}
