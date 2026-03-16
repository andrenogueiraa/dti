"use server";

import { db } from "@/drizzle";
import { devTeams } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { EditDevTeamFormSchema } from "./client";

export async function getDevTeamForEdit(devTeamId: string) {
  return await db.query.devTeams.findFirst({
    where: eq(devTeams.id, devTeamId),
    columns: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      isActive: true,
    },
  });
}

export async function updateDevTeam(
  devTeamId: string,
  data: EditDevTeamFormSchema
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  await db
    .update(devTeams)
    .set({
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl || null,
      isActive: data.isActive,
      updatedBy: session.user.id,
    })
    .where(eq(devTeams.id, devTeamId));

  revalidatePath("/");
  revalidatePath(`/dev-teams/${devTeamId}`);
}

