"use server";

import { db } from "@/drizzle";

export type TeamMonitoringData = {
  id: string;
  name: string | null;
  imageUrl: string | null;
  lastFinishedDocReviewDate: Date | null;
  activeSprintFinishDate: Date | null;
  daysSinceLastReview: number | null;
  status: "green" | "yellow" | "red";
};

function calculateStatus(
  lastFinishedDocReview: Date | null,
  activeSprintFinishDate: Date | null
): "green" | "yellow" | "red" {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!lastFinishedDocReview) {
    // Se nunca teve doc review finalizado, é vermelho
    return "red";
  }

  const daysSinceLastReview = Math.floor(
    (now.getTime() - lastFinishedDocReview.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (activeSprintFinishDate) {
    // Se existe sprint ativa, calcula dias até ela finalizar
    const daysUntilSprintFinish = Math.floor(
      (activeSprintFinishDate.getTime() - lastFinishedDocReview.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    // Verde: próxima sprint finaliza em menos de 15 dias desde o último review
    if (daysUntilSprintFinish < 15) {
      return "green";
    }
  }

  // Amarelo: passaram 7+ dias do último review E não existe sprint ativa
  if (daysSinceLastReview >= 7 && !activeSprintFinishDate) {
    return "yellow";
  }

  // Vermelho: todos os outros casos
  return "red";
}

export type MonitoringData = {
  teams: TeamMonitoringData[];
  oldestDocReviewDate: Date | null;
  calendarStartDate: Date;
  calendarEndDate: Date;
};

export async function getTeamsMonitoringData(): Promise<MonitoringData> {
  const teams = await db.query.devTeams.findMany({
    where: (devTeams, { eq }) => eq(devTeams.isActive, true),
    orderBy: (devTeams, { asc }) => [asc(devTeams.name)],
    with: {
      projects: {
        where: (projects, { ne }) => ne(projects.status, "CO"), // Apenas projetos não concluídos
        with: {
          sprints: {
            with: {
              docReview: {
                columns: {
                  finishedAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const monitoringData: TeamMonitoringData[] = [];
  let oldestDocReviewDate: Date | null = null;

  for (const team of teams) {
    // Coletar todas as sprints de todos os projetos da equipe
    const allSprints = team.projects.flatMap((project) => project.sprints);

    // Encontrar a data do último doc review finalizado
    let lastFinishedDocReviewDate: Date | null = null;
    for (const sprint of allSprints) {
      if (sprint.docReview?.finishedAt) {
        const finishedDate = new Date(sprint.docReview.finishedAt);
        finishedDate.setHours(0, 0, 0, 0);
        if (
          !lastFinishedDocReviewDate ||
          finishedDate > lastFinishedDocReviewDate
        ) {
          lastFinishedDocReviewDate = finishedDate;
        }
        // Também atualizar a data mais antiga global
        if (!oldestDocReviewDate || finishedDate < oldestDocReviewDate) {
          oldestDocReviewDate = finishedDate;
        }
      }
    }

    // Encontrar sprint ativa mais próxima
    // Sprint ativa = sprint sem doc review finalizado (independente da data de término)
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let activeSprintFinishDate: Date | null = null;
    for (const sprint of allSprints) {
      const isDocReviewFinished =
        sprint.docReview?.finishedAt !== null &&
        sprint.docReview?.finishedAt !== undefined;

      // Se o doc review não está finalizado, é uma sprint ativa
      if (!isDocReviewFinished) {
        if (sprint.finishDate) {
          const finishDate = new Date(sprint.finishDate);
          finishDate.setHours(0, 0, 0, 0);

          // Pega a sprint ativa com a data de término mais próxima
          if (
            !activeSprintFinishDate ||
            finishDate < activeSprintFinishDate
          ) {
            activeSprintFinishDate = finishDate;
          }
        } else {
          // Sprint sem data de término definida, considera ativa
          // Usa uma data futura para indicar que existe sprint ativa
          if (!activeSprintFinishDate) {
            activeSprintFinishDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias no futuro como placeholder
          }
        }
      }
    }

    // Calcular dias desde o último review
    let daysSinceLastReview: number | null = null;
    if (lastFinishedDocReviewDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      lastFinishedDocReviewDate.setHours(0, 0, 0, 0);
      daysSinceLastReview = Math.floor(
        (now.getTime() - lastFinishedDocReviewDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
    }

    const status = calculateStatus(
      lastFinishedDocReviewDate,
      activeSprintFinishDate
    );

    monitoringData.push({
      id: team.id,
      name: team.name,
      imageUrl: team.imageUrl,
      lastFinishedDocReviewDate,
      activeSprintFinishDate,
      daysSinceLastReview,
      status,
    });
  }

  // Calcular datas do calendário
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Data de início: mais antigo doc review OU hoje - 15 dias (o que for mais antigo)
  const fifteenDaysAgo = new Date(today);
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  fifteenDaysAgo.setHours(0, 0, 0, 0);

  const calendarStartDate = oldestDocReviewDate
    ? oldestDocReviewDate < fifteenDaysAgo
      ? oldestDocReviewDate
      : fifteenDaysAgo
    : fifteenDaysAgo;

  // Data de fim: hoje + 15 dias
  const calendarEndDate = new Date(today);
  calendarEndDate.setDate(calendarEndDate.getDate() + 15);
  calendarEndDate.setHours(0, 0, 0, 0);

  return {
    teams: monitoringData,
    oldestDocReviewDate,
    calendarStartDate,
    calendarEndDate,
  };
}

