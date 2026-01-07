export const COMPLEXITY_LEVELS = [
  { value: "MB", label: "Muito baixa" },
  { value: "B", label: "Baixa" },
  { value: "M", label: "Média" },
  { value: "A", label: "Alta" },
  { value: "MA", label: "Altíssima" },
] as const;

export const COMPLEXITY_LEVEL_VALUES = COMPLEXITY_LEVELS.map((l) => l.value);

export type ComplexityLevel = (typeof COMPLEXITY_LEVEL_VALUES)[number];

