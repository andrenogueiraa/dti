export const COLORS = [
  {
    value: "red",
    label: "Vermelho",
    className: "bg-red-100 dark:bg-red-900",
  },
  {
    value: "orange",
    label: "Laranja",
    className: "bg-orange-100 dark:bg-orange-900",
  },
  {
    value: "amber",
    label: "Âmbar",
    className: "bg-amber-100 dark:bg-amber-900",
  },
  {
    value: "yellow",
    label: "Amarelo",
    className: "bg-yellow-100 dark:bg-yellow-900",
  },
  {
    value: "lime",
    label: "Lima",
    className: "bg-lime-100 dark:bg-lime-900",
  },
  {
    value: "green",
    label: "Verde",
    className: "bg-green-100 dark:bg-green-900",
  },
  {
    value: "emerald",
    label: "Esmeralda",
    className: "bg-emerald-100 dark:bg-emerald-900",
  },
  {
    value: "teal",
    label: "Verde-azulado",
    className: "bg-teal-100 dark:bg-teal-900",
  },
  {
    value: "cyan",
    label: "Ciano",
    className: "bg-cyan-100 dark:bg-cyan-900",
  },
  {
    value: "sky",
    label: "Azul-céu",
    className: "bg-sky-100 dark:bg-sky-900",
  },
  {
    value: "blue",
    label: "Azul",
    className: "bg-blue-100 dark:bg-blue-900",
  },
  {
    value: "indigo",
    label: "Índigo",
    className: "bg-indigo-100 dark:bg-indigo-900",
  },
  {
    value: "violet",
    label: "Violeta",
    className: "bg-violet-100 dark:bg-violet-900",
  },
  {
    value: "purple",
    label: "Roxo",
    className: "bg-purple-100 dark:bg-purple-900",
  },
  {
    value: "fuchsia",
    label: "Fúcsia",
    className: "bg-fuchsia-100 dark:bg-fuchsia-900",
  },
  {
    value: "pink",
    label: "Pink",
    className: "bg-pink-100 dark:bg-pink-900",
  },
  {
    value: "rose",
    label: "Rosa",
    className: "bg-rose-100 dark:bg-rose-900",
  },

  // TONS NEUTROS
  {
    value: "neutral",
    label: "Neutro",
    className: "bg-neutral-100 dark:bg-neutral-900",
  },
  {
    value: "stone",
    label: "Pedra",
    className: "bg-stone-100 dark:bg-stone-900",
  },
  {
    value: "zinc",
    label: "Zinco",
    className: "bg-zinc-100 dark:bg-zinc-900",
  },
  {
    value: "slate",
    label: "Ardósia",
    className: "bg-slate-100 dark:bg-slate-900",
  },
  {
    value: "gray",
    label: "Cinza",
    className: "bg-gray-100 dark:bg-gray-900",
  },
] as const;

export const COLOR_VALUES = COLORS.map((s) => s.value);

export function getColorClassName(color: string) {
  const colorObject = COLORS.find((c) => c.value === color);
  if (!colorObject) {
    return "";
  }
  return colorObject.className;
}

export type Color = (typeof COLOR_VALUES)[number];
