"use server";

import { db } from "@/drizzle";
import { userDevTeams } from "@/drizzle/core-schema";
import { AddUserToTeamFormSchema } from "./client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function addUserToTeam(data: AddUserToTeamFormSchema) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  await db.insert(userDevTeams).values({
    ...data,
    createdBy: session.user.id,
  });

  revalidatePath(`/dev-teams/${data.devTeamId}`);
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
