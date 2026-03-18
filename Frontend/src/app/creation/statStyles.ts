import type { StatKey } from "./raceAPI";

export const STATS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
export type Stat = (typeof STATS)[number];

export const STAT_KEY_LABEL: Record<StatKey, Stat> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

const STAT_TAG_CLASS: Record<StatKey, { selected: string; unselected: string }> = {
  str: {
    unselected: "border-red-500/30 bg-red-500/15 text-red-200",
    selected: "border-red-200 bg-red-100 text-red-800",
  },
  dex: {
    unselected: "border-green-500/30 bg-green-500/15 text-green-200",
    selected: "border-green-200 bg-green-100 text-green-800",
  },
  con: {
    unselected: "border-amber-700/30 bg-amber-700/15 text-amber-200",
    selected: "border-amber-200 bg-amber-100 text-amber-800",
  },
  int: {
    unselected: "border-blue-500/30 bg-blue-500/15 text-blue-200",
    selected: "border-blue-200 bg-blue-100 text-blue-800",
  },
  wis: {
    unselected: "border-purple-500/30 bg-purple-500/15 text-purple-200",
    selected: "border-purple-200 bg-purple-100 text-purple-800",
  },
  cha: {
    unselected: "border-pink-500/30 bg-pink-500/15 text-pink-200",
    selected: "border-pink-200 bg-pink-100 text-pink-800",
  },
};

export function getStatTagClass(key: StatKey, isSelected: boolean): string {
  return isSelected ? STAT_TAG_CLASS[key].selected : STAT_TAG_CLASS[key].unselected;
}

const STAT_RECOMMEND_CLASS: Record<StatKey, string> = {
  str: "ring-2 ring-red-400/40 bg-red-500/5 border-red-500/40",
  dex: "ring-2 ring-green-400/40 bg-green-500/5 border-green-500/40",
  con: "ring-2 ring-amber-300/40 bg-amber-500/5 border-amber-500/40",
  int: "ring-2 ring-blue-400/40 bg-blue-500/5 border-blue-500/40",
  wis: "ring-2 ring-purple-400/40 bg-purple-500/5 border-purple-500/40",
  cha: "ring-2 ring-pink-400/40 bg-pink-500/5 border-pink-500/40",
};

export function getRecommendedStatBoxClass(key: StatKey): string {
  return STAT_RECOMMEND_CLASS[key];
}

export function statKeyFromAbbrev(stat: string): StatKey | null {
  switch (stat) {
    case "STR":
      return "str";
    case "DEX":
      return "dex";
    case "CON":
      return "con";
    case "INT":
      return "int";
    case "WIS":
      return "wis";
    case "CHA":
      return "cha";
    default:
      return null;
  }
}

