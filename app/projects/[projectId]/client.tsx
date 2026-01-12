"use client";

import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { getProject } from "./server-actions";
import Link from "next/link";
import { formatLocalDate } from "@/lib/date-utils";

export function EndDate({
  project,
  sprintId,
  sprintFinishDate,
  reviewPlannersIds,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getProject>>>;
  sprintId: string;
  sprintFinishDate: Date;
  reviewPlannersIds: string[];
}) {
  const { data: session, error, isPending } = authClient.useSession();

  if (isPending) {
    return <div>Carregando...</div>;
  }

  if (!session) {
    redirect("/login");
  }

  if (error) {
    return <div>Erro ao carregar sessão: {error.message}</div>;
  }

  const userId = session.user.id;

  if (!userId) {
    return <div>Não existe usuário na sessão</div>;
  }

  const responsibleTeam = project.responsibleTeam;

  if (!responsibleTeam) {
    return <div>Não existe equipe responsável pelo projeto</div>;
  }

  let allowedUserIds = responsibleTeam.userDevTeams.map(
    (userDevTeam) => userDevTeam.userId
  );

  const extraAllowedUsers = reviewPlannersIds;
  allowedUserIds = [...new Set([...allowedUserIds, ...extraAllowedUsers])];

  const userIsAllowedToChangeEndDate = allowedUserIds.includes(userId);

  if (userIsAllowedToChangeEndDate) {
    return (
      <Link
        href={`/projects/${project.id}/sprints/${sprintId}/change-end-date`}
      >
        <small>{formatLocalDate(sprintFinishDate, "pt-BR")}</small>
      </Link>
    );
  } else {
    return <small>{formatLocalDate(sprintFinishDate, "pt-BR")}</small>;
  }
}
