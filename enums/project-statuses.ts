export const PROJECT_STATUSES = [
  {
    value: "AI",
    label: "Aguardando Início",
  },
  {
    value: "EA",
    label: "Em andamento",
  },
  {
    value: "CO",
    label: "Concluído",
  },
  {
    value: "SU",
    label: "Suspenso",
  },
  {
    value: "CA",
    label: "Cancelado",
  },
] as const;

export const PROJECT_STATUS_VALUES = PROJECT_STATUSES.map((s) => s.value);

export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number];
