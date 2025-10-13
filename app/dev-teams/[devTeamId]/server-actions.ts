"use server";

import { db } from "@/drizzle";
import { devTeams } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";

export async function getDevTeam(devTeamId: string) {
  return await db.query.devTeams.findFirst({
    where: eq(devTeams.id, devTeamId),
    with: {
      userDevTeams: {
        with: {
          user: true,
          role: true,
        },
      },
      projects: true,
    },
  });
}
