"use server";

import { db } from "@/drizzle";
import { devTeams, userDevTeams } from "@/drizzle/core-schema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type CreateDevTeamInput = {
  name: string;
  description: string;
  imageUrl?: string;
  userId?: string;
  roleId?: string;
};

export default async function createDevTeam(data: CreateDevTeamInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [createdDevTeam] = await db
    .insert(devTeams)
    .values({
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      createdBy: session.user.id,
    })
    .returning({ id: devTeams.id });

  if (createdDevTeam && data.userId && data.roleId) {
    await db.insert(userDevTeams).values({
      userId: data.userId,
      roleId: data.roleId,
      devTeamId: createdDevTeam.id,
      createdBy: session.user.id,
    });
  }

  revalidatePath("/");
}

export async function getUsers() {
  return await db.query.user.findMany({
    columns: {
      id: true,
      name: true,
    },
    orderBy: (user, { asc }) => [asc(user.name)],
  });
}

export async function getRoles() {
  return await db.query.roles.findMany({
    columns: {
      id: true,
      name: true,
    },
    orderBy: (roles, { asc }) => [asc(roles.name)],
  });
}


