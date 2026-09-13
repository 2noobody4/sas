// ============================================================
// TAILWIND REGISTRY — Tokens design résolubles dynamiquement
// Version V3 — Compatible React 16
// ============================================================

export type TailwindTokenGroup =
  | "couleurs"
  | "arrondis"
  | "ombres"
  | "espaces"
  | "taillesPolice"
  | "epaisseursPolice"
  | "polices"
  | "bordures"
  | "zIndex"
  | "transitions";

export type TailwindTokenValue = string | number;

// -----------------------------------------------------------
// TOKENS PAR GROUPE
// -----------------------------------------------------------

const couleurs: Record<string, string> = {
  primary: "#1E3A5F",
  secondary: "#F4F6F8",
  accent: "#E8A33D",
  danger: "#E03131",
  success: "#2F9E44",
  warning: "#F76707",
  info: "#1971C2",
  white: "#FFFFFF",
  black: "#12181F",
  gray50: "#F8F9FA",
  gray100: "#F1F3F5",
  gray200: "#E2E6EA",
  gray300: "#CED4DA",
  gray400: "#ADB5BD",
  gray500: "#868E96",
  gray600: "#5B6672",
  gray700: "#495057",
  gray800: "#343A40",
  gray900: "#212529",
  transparent: "transparent",
};

const arrondis: Record<string, number> = {
  none: 0,
  sm: 4,
  base: 8,
  md: 10,
  lg: 14,
  xl: 18,
  "2xl": 24,
  full: 9999,
};

const ombres: Record<string, string> = {
  none: "none",
  sm: "0 1px 2px rgba(18,24,31,0.06)",
  base: "0 1px 2px rgba(18,24,31,0.06)",
  md: "0 4px 12px rgba(18,24,31,0.10)",
  lg: "0 12px 32px rgba(18,24,31,0.14)",
  xl: "0 20px 48px rgba(18,24,31,0.18)",
  inner: "inset 0 2px 4px rgba(18,24,31,0.06)",
};

const espaces: Record<string, number> = {
  "0": 0,
  xs: 4,
  sm: 8,
  base: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
};

const taillesPolice: Record<string, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
};

const epaisseursPolice: Record<string, number> = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

const polices: Record<string, string> = {
  sans: "'Inter', sans-serif",
  titre: "'Sora', sans-serif",
  chiffres: "'IBM Plex Mono', monospace",
  serif: "'Merriweather', serif",
};

const bordures: Record<string, string> = {
  none: "none",
  thin: "1px solid",
  base: "1px solid",
  thick: "2px solid",
  thicker: "4px solid",
};

const zIndex: Record<string, number | string> = {
  auto: "auto",
  "0": 0,
  "10": 10,
  "20": 20,
  "30": 30,
  "40": 40,
  "50": 50,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

const transitions: Record<string, string> = {
  none: "none",
  fast: "all 0.15s ease",
  base: "all 0.25s ease",
  slow: "all 0.4s ease",
  slower: "all 0.6s ease",
  bounce: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
};

// -----------------------------------------------------------
// REGISTRE CENTRAL
// -----------------------------------------------------------

const REGISTRY: Record<TailwindTokenGroup, Record<string, TailwindTokenValue>> = {
  couleurs,
  arrondis,
  ombres,
  espaces,
  taillesPolice,
  epaisseursPolice,
  polices,
  bordures,
  zIndex,
  transitions,
};

// -----------------------------------------------------------
// HELPERS DE RÉSOLUTION
// -----------------------------------------------------------

export function resolve(group: TailwindTokenGroup, name: string): TailwindTokenValue {
  const groupMap = REGISTRY[group];
  if (!groupMap) {
    console.warn(`[TailwindRegistry] Groupe inconnu: "${group}"`);
    return name;
  }
  const value = groupMap[name];
  if (value === undefined) {
    console.warn(`[TailwindRegistry] Token inconnu: "${group}.${name}"`);
    return name;
  }
  return value;
}

export function resolveValue(value: string | number): string | number {
  if (typeof value !== "string" || !value.includes(".")) return value;
  const [group, name] = value.split(".") as [TailwindTokenGroup, string];
  return resolve(group, name);
}

export function resolveStyle(style: Record<string, string | number>): Record<string, string | number> {
  const resolved: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(style)) {
    resolved[key] = resolveValue(value);
  }
  return resolved;
}

// -----------------------------------------------------------
// MÉTADONNÉES POUR L'UI — Listable & Sélectionnable
// -----------------------------------------------------------

export interface TailwindTokenItem {
  id: string;
  group: TailwindTokenGroup;
  name: string;
  label: string;
  value: TailwindTokenValue;
  description?: string;
  previewType: "color" | "number" | "shadow" | "text" | "border";
}

function toLabel(str: string): string {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export const TAILWIND_TOKEN_LIST: TailwindTokenItem[] = (
  Object.entries(REGISTRY) as [TailwindTokenGroup, Record<string, TailwindTokenValue>][]
).flatMap(([group, items]) =>
  Object.entries(items).map(([name, value]) => ({
    id: `${group}.${name}`,
    group,
    name,
    label: toLabel(name),
    value,
    previewType: (group === "couleurs" || group === "bordures")
      ? "color"
      : group === "ombres"
      ? "shadow"
      : group === "taillesPolice" || group === "epaisseursPolice"
      ? "text"
      : "number",
  }))
);

export function getTokensByGroup(group: TailwindTokenGroup): TailwindTokenItem[] {
  return TAILWIND_TOKEN_LIST.filter((t) => t.group === group);
}

export function searchTokens(query: string): TailwindTokenItem[] {
  const q = query.toLowerCase();
  return TAILWIND_TOKEN_LIST.filter(
    (t) => t.id.toLowerCase().includes(q) || t.label.toLowerCase().includes(q)
  );
}

export default REGISTRY;
