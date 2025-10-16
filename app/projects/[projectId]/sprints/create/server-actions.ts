"use server";

import { db } from "@/drizzle";
import { sprints } from "@/drizzle/core-schema";
import { CreateSprintFormSchema } from "./form";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createSprint({
  data,
  projectId,
}: {
  data: CreateSprintFormSchema;
  projectId: string;
}) {
  await db.insert(sprints).values({ ...data, projectId });

  revalidateTag(projectId);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/`);
}
