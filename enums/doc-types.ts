export const DOC_TYPES = [
  {
    value: "SREV",
    label: "Sprint Review",
  },
  {
    value: "SRET",
    label: "Sprint Retrospective",
  },
  {
    value: "REQ",
    label: "Requisitos",
  },
  {
    value: "DOC",
    label: "Documentação",
  },
] as const;

export const DOC_TYPE_VALUES = DOC_TYPES.map((s) => s.value);

export type DocType = (typeof DOC_TYPE_VALUES)[number];
