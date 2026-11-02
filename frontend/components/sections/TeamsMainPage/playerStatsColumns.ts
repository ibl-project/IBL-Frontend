import type { PlayerStats } from "@/lib/teamsApi";

export interface StatColumn {
  key: keyof PlayerStats;
  label: string;
}

export const TOTAL_COLUMNS: StatColumn[] = [
  { key: "game", label: "Game" },
  { key: "point", label: "Points" },
  { key: "assist", label: "Asis" },
  { key: "rebound", label: "Rebound" },
];

export const AVERAGE_COLUMNS: StatColumn[] = [
  { key: "ppg", label: "PPG" },
  { key: "apg", label: "APG" },
  { key: "rpg", label: "RPG" },
  { key: "fgPercent", label: "FG%" },
  { key: "threePPercent", label: "3P%" },
  { key: "twoPPercent", label: "2P%" },
  { key: "ftPercent", label: "FT%" },
];
