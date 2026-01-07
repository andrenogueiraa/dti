"use server";

import { db } from "@/drizzle";

export type TeamMonitoringData = {
  id: string;
  name: string | null;
  imageUrl: string | null;

  // Sprint Anterior (finishDate <= hoje)
  previousSprint: {
    finishDate: Date;
    hasDocReviewFinished: boolean;
  } | null;

  // Próxima Sprint (finishDate > hoje)
  nextSprint: {
    finishDate: Date;
    hasDocReviewFinished: boolean; // Deve ser sempre false, mas pode ter erro
  } | null;

  // Status e alertas
  status: "green" | "yellow" | "red";
  alert: string | null; // Mensagens de alerta
};

function calculateStatus(
  previousSprint: { finishDate: Date; hasDocReviewFinished: boolean } | null,
  nextSprint: { finishDate: Date; hasDocReviewFinished: boolean } | null,
  alert: string | null
): "green" | "yellow" | "red" {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Se tem alerta de erro crítico, é vermelho
  if (alert && alert.includes("finalizada antes de ocorrer")) {
    return "red";
  }

  // Se não tem sprint anterior, é vermelho
  if (!previousSprint) {
    return "red";
  }

  // Se sprint anterior não tem doc review finalizado, é vermelho
  if (!previousSprint.hasDocReviewFinished) {
    return "red";
  }

  // Se tem próxima sprint, está verde
  if (nextSprint && !nextSprint.hasDocReviewFinished) {
    return "green";
  }

  // Se não tem próxima sprint, verificar dias desde a anterior
  if (!nextSprint) {
    const daysSincePrevious = Math.floor(
      (now.getTime() - previousSprint.finishDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Amarelo: passaram 7+ dias desde a sprint anterior
    if (daysSincePrevious >= 7) {
      return "yellow";
    }

    // Verde: ainda está dentro do prazo
    return "green";
  }

  // Default: vermelho
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
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (const team of teams) {
    // Coletar todas as sprints de todos os projetos da equipe
    const allSprints = team.projects.flatMap((project) => project.sprints);

    // Separar sprints por data de término
    const sprintsWithDates = allSprints
      .filter((sprint) => sprint.finishDate !== null)
      .map((sprint) => {
        const finishDate = new Date(sprint.finishDate!);
        finishDate.setHours(0, 0, 0, 0);
        return {
          sprint,
          finishDate,
          hasDocReviewFinished:
            sprint.docReview?.finishedAt !== null &&
            sprint.docReview?.finishedAt !== undefined,
        };
      })
      .sort((a, b) => a.finishDate.getTime() - b.finishDate.getTime());

    // Sprint Anterior: última sprint com finishDate <= hoje
    const previousSprints = sprintsWithDates.filter(
      (s) => s.finishDate <= now
    );
    const previousSprint =
      previousSprints.length > 0
        ? previousSprints[previousSprints.length - 1]
        : null;

    // Próxima Sprint: primeira sprint com finishDate > hoje
    const nextSprints = sprintsWithDates.filter((s) => s.finishDate > now);
    const nextSprint = nextSprints.length > 0 ? nextSprints[0] : null;

    // Validar e gerar alertas
    let alert: string | null = null;

    if (nextSprint) {
      // Próxima sprint não pode ter doc review finalizado
      if (nextSprint.hasDocReviewFinished) {
        alert = "Sprint Review finalizada antes de ocorrer a reunião";
      }
    } else {
      // Não tem próxima sprint
      alert = "Atenção! Criar sprint!";
    }

    // Atualizar data mais antiga de doc review (apenas de sprints anteriores)
    if (previousSprint && previousSprint.hasDocReviewFinished) {
      const finishedDate = previousSprint.finishDate;
      if (!oldestDocReviewDate || finishedDate < oldestDocReviewDate) {
        oldestDocReviewDate = finishedDate;
      }
    }

    // Calcular status
    const status = calculateStatus(
      previousSprint
        ? {
            finishDate: previousSprint.finishDate,
            hasDocReviewFinished: previousSprint.hasDocReviewFinished,
          }
        : null,
      nextSprint
        ? {
            finishDate: nextSprint.finishDate,
            hasDocReviewFinished: nextSprint.hasDocReviewFinished,
          }
        : null,
      alert
    );

    monitoringData.push({
      id: team.id,
      name: team.name,
      imageUrl: team.imageUrl,
      previousSprint: previousSprint
        ? {
            finishDate: previousSprint.finishDate,
            hasDocReviewFinished: previousSprint.hasDocReviewFinished,
          }
        : null,
      nextSprint: nextSprint
        ? {
            finishDate: nextSprint.finishDate,
            hasDocReviewFinished: nextSprint.hasDocReviewFinished,
          }
        : null,
      status,
      alert,
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

