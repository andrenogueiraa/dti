"use server";

import { db } from "@/drizzle";
import { sprints } from "@/drizzle/core-schema";
import { CreateSprintFormSchema } from "./form";

export async function createSprint({
  data,
  projectId,
}: {
  data: CreateSprintFormSchema;
  projectId: string;
}) {
  const [sprint] = await db
    .insert(sprints)
    .values({ ...data, projectId })
    .returning({ id: sprints.id });
  return sprint;
}
