"use server";

import { db } from "@/drizzle";
import { tasks } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";

export async function getTasks(sprintId: string) {
  return await db.query.tasks.findMany({
    where: eq(tasks.sprintId, sprintId),
    with: {
      responsibleUser: true,
    },
    orderBy: (tasks, { asc }) => [asc(tasks.order)],
  });
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
    // Update all tasks in a transaction-like manner
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
