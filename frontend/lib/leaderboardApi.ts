import { apiFetch } from "@/lib/apiClient";

/**
 * Endpoint publik leaderboard pemain untuk halaman /leaderboard.
 * Kontrak lengkap: repo IBL-apidocs (koleksi Bruno), folder "Klasemen & Leaderboard".
 */

export type LeaderboardSortBy = "total" | "average";

export interface LeaderboardRow {
  rank: number;
  player: { id: string; name: string; nopung: string };
  team: { id: string; name: string; logo: string };
  games: number;
  total: number;
  average: number;
}

export interface Leaderboard {
  season: string;
  sortBy: LeaderboardSortBy;
  points: LeaderboardRow[];
  assists: LeaderboardRow[];
  rebounds: LeaderboardRow[];
}

export function getLeaderboard(limit = 5, sortBy: LeaderboardSortBy = "total"): Promise<Leaderboard> {
  const query = new URLSearchParams({ limit: String(limit), sortBy });
  return apiFetch<Leaderboard>(`/leaderboard?${query}`, { auth: false });
}
