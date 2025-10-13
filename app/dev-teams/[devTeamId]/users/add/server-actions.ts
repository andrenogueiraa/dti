"use server";

import { db } from "@/drizzle";
import { userDevTeams } from "@/drizzle/core-schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getUsers() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/unauthorized");
  }

  return await db.query.user.findMany({
    orderBy: (user, { asc }) => [asc(user.name)],
  });
}

export async function getRoles() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/unauthorized");
  }

  return await db.query.roles.findMany({
    orderBy: (role, { asc }) => [asc(role.name)],
  });
}

export async function addUserToDevTeam(formData: FormData) {
  const rawFormData = {
    devTeamId: formData.get("devTeamId") as string,
    userId: formData.get("userId") as string,
    roleId: formData.get("roleId") as string,
  };

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/unauthorized");
  }

  const userDevTeam = await db
    .insert(userDevTeams)
    .values({
      devTeamId: rawFormData.devTeamId,
      userId: rawFormData.userId,
      roleId: rawFormData.roleId,
    })
    .returning({ id: userDevTeams.id });

  if (!userDevTeam) {
    throw new Error("Erro ao adicionar usuário à equipe");
  }

  revalidatePath(`/dev-teams/${rawFormData.devTeamId}`);
  redirect(`/dev-teams/${rawFormData.devTeamId}`);
}
