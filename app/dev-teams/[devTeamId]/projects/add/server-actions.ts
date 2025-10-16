"use server";

import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { CreateProjectFormSchema } from "./client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function createProject(data: CreateProjectFormSchema) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  await db.insert(projects).values({
    ...data,
    createdBy: session.user.id,
  });

  revalidatePath("/");
  revalidatePath(`/dev-teams/${data.responsibleTeamId}`);
}
