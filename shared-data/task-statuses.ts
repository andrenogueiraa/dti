export const TASK_STATUSES = [
  {
    value: "NI",
    label: "Não iniciada",
  },
  {
    value: "EP",
    label: "Em progresso",
  },
  {
    value: "ER",
    label: "Em revisão",
  },
  {
    value: "C",
    label: "Concluída",
  },
] as const;

export const TASK_STATUS_VALUES = TASK_STATUSES.map((s) => s.value);

export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];
