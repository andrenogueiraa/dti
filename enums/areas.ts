export const AREA_VALUES = [
  "licenciamento",
  "florestal",
  "recursos_hidricos",
  "comunicacao",
  "ti",
  "mudancas_climaticas",
  "fiscalizacao",
  "manutencao_informatica",
  "sei",
  "biodiversidade",
  "geo",
  "recursos_humanos",
  "financeiro",
  "banco_mundial_bid_fida",
  "siga",
  "unidades_conservacao",
] as const;

export const AREAS = [
  { value: "licenciamento", label: "Licenciamento" },
  { value: "florestal", label: "Florestal" },
  { value: "recursos_hidricos", label: "Recursos Hídricos" },
  { value: "comunicacao", label: "Comunicação" },
  { value: "ti", label: "TI" },
  { value: "mudancas_climaticas", label: "Mudanças Climáticas" },
  { value: "fiscalizacao", label: "Fiscalização" },
  { value: "manutencao_informatica", label: "Manutenção Informática" },
  { value: "sei", label: "SEI" },
  { value: "biodiversidade", label: "Biodiversidade" },
  { value: "geo", label: "Geo" },
  { value: "recursos_humanos", label: "Recursos Humanos" },
  { value: "financeiro", label: "Financeiro" },
  {
    value: "banco_mundial_bid_fida",
    label: "Banco Mundial / BID / FIDA",
  },
  { value: "siga", label: "SIGA" },
  { value: "unidades_conservacao", label: "Unidades de Conservação" },
] as const;

export type AreaValue = (typeof AREA_VALUES)[number];

