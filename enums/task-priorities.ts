export const TASK_PRIORITIES = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
] as const;

export const TASK_PRIORITY_VALUES = TASK_PRIORITIES.map((p) => p.value);

export type TaskPriority = (typeof TASK_PRIORITY_VALUES)[number];
