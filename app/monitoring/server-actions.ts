"use server";

import { db } from "@/drizzle";

// Tipos discriminados para representar todos os estados possíveis de uma equipe
export type TeamState =
  | { type: "no_sprints"; alerts: string[] }
  | { type: "missing_review"; alerts: string[] }
  | { type: "ok"; alerts: string[] };

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
  state: TeamState; // Substitui 'alert' com tipo discriminado
};

/**
 * Classifica o estado de uma equipe baseado nas sprints anterior e próxima.
 * Esta função centraliza toda a lógica de decisão sobre mensagens e estados.
 */
function classifyTeamState(
  previousSprint: { finishDate: Date; hasDocReviewFinished: boolean } | null,
  nextSprint: { finishDate: Date; hasDocReviewFinished: boolean } | null
): TeamState {
  const alerts: string[] = [];

  // Verificar alertas relacionados à próxima sprint
  if (nextSprint) {
    if (nextSprint.hasDocReviewFinished) {
      alerts.push("Sprint Review finalizada antes de ocorrer a reunião");
    }
  } else {
    // Não tem próxima sprint
    alerts.push("Criar próxima sprint");
  }

  // Determinar o tipo de estado baseado na sprint anterior
  if (!previousSprint) {
    // Caso 1, 2, 3: Sem sprint anterior
    return { type: "no_sprints", alerts };
  }

  if (!previousSprint.hasDocReviewFinished) {
    // Caso 7, 8, 9: Sprint anterior existe mas sem review
    alerts.push("Finalizar review anterior");
    return { type: "missing_review", alerts };
  }

  // Caso 4, 5, 6: Sprint anterior com review OK
  return { type: "ok", alerts };
}

function calculateStatus(
  previousSprint: { finishDate: Date; hasDocReviewFinished: boolean } | null,
  nextSprint: { finishDate: Date; hasDocReviewFinished: boolean } | null,
  state: TeamState
): "green" | "yellow" | "red" {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Se tem alerta de erro crítico, é vermelho
  if (state.alerts.some((alert) => alert.includes("finalizada antes de ocorrer"))) {
    return "red";
  }

  // Se não tem sprint anterior, é vermelho
  if (!previousSprint || state.type === "no_sprints") {
    return "red";
  }

  // Se sprint anterior não tem doc review finalizado, é vermelho
  if (!previousSprint.hasDocReviewFinished || state.type === "missing_review") {
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
    const previousSprints = sprintsWithDates.filter((s) => s.finishDate <= now);
    const previousSprint =
      previousSprints.length > 0
        ? previousSprints[previousSprints.length - 1]
        : null;

    // Próxima Sprint: primeira sprint com finishDate > hoje
    const nextSprints = sprintsWithDates.filter((s) => s.finishDate > now);
    const nextSprint = nextSprints.length > 0 ? nextSprints[0] : null;

    // Classificar o estado da equipe (centraliza toda a lógica de alertas)
    const state = classifyTeamState(
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
        : null
    );

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
      state
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
      state,
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
