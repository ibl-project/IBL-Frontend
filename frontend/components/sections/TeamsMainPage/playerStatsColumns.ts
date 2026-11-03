import type { PlayerStats } from "@/lib/teamsApi";

export interface StatColumn {
  key: keyof PlayerStats;
  label: string;
  /** Lebar kolom di Figma (px); tabel memakainya sebagai perbandingan (fr). */
  width: number;
}

/** Lebar kolom PLAYER di Figma untuk tiap tabel. */
export const PLAYER_COLUMN_WIDTH = { totals: 322, average: 251 } as const;

export const TOTAL_COLUMNS: StatColumn[] = [
  { key: "game", label: "Game", width: 150 },
  { key: "point", label: "Points", width: 142 },
  { key: "assist", label: "Asis", width: 164 },
  { key: "rebound", label: "Rebound", width: 187 },
];

export const AVERAGE_COLUMNS: StatColumn[] = [
  { key: "ppg", label: "PPG", width: 111 },
  { key: "apg", label: "APG", width: 102 },
  { key: "rpg", label: "RPG", width: 99 },
  { key: "fgPercent", label: "FG%", width: 106 },
  { key: "threePPercent", label: "3P%", width: 104 },
  { key: "twoPPercent", label: "2P%", width: 95 },
  { key: "ftPercent", label: "FT%", width: 98 },
];
