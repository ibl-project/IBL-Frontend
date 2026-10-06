import { ApiError, apiFetch } from "@/lib/apiClient";

/**
 * Endpoint tim, roster, grup, dan logo di backend.
 * Kontrak lengkap: IBL-Backend/docs/API.md bagian "Tim".
 */

export interface TeamStats {
  G: string;
  W: string;
  L: string;
  PM: string;
  PA: string;
  PD: string;
  PTS: string;
}

export interface PlayerStats {
  game: string;
  point: string;
  assist: string;
  rebound: string;
  ppg: string;
  apg: string;
  rpg: string;
  fgPercent: string;
  threePPercent: string;
  twoPPercent: string;
  ftPercent: string;
}

export interface TeamPlayer {
  id: string;
  name: string;
  nopung: string;
  isCaptain: boolean;
  stats: PlayerStats;
}

export interface Team {
  id: string;
  name: string;
  group: string | null;
  groupId: string | null;
  conference: string | null;
  /** "/images/LOGO_1.svg" atau "/api/teams/<id>/logo?v=..."; tampilkan lewat assetUrl(). */
  logo: string;
  season: string;
  teamStats: TeamStats;
  players: TeamPlayer[];
}

export interface Group {
  id: string;
  name: string;
  conference: { id: string; name: string };
}

export interface RosterEntry {
  id?: string;
  name: string;
  jerseyNumber: string;
  isCaptain: boolean;
}

export interface ImportTeamInput {
  name: string;
  group?: string;
  players: RosterEntry[];
}

export const DEFAULT_TEAM_LOGO = "/images/LOGO_1.svg";
export const JERSEY_PATTERN = /^(0|00|[1-9][0-9]?)$/;
export const MAX_ROSTER = 30;

export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const LOGO_ACCEPT = LOGO_TYPES.join(",");
export const LOGO_MAX_BYTES = 5 * 1024 * 1024;

/** Pesan error yang aman ditampilkan ke panitia, plus detail validasi pertama. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Terjadi kesalahan. Coba lagi.";
  // Hanya detail validasi (teks per field) yang ditempel; detail lain, mis.
  // nama pemegang sesi scoring, sudah ada di pesannya.
  if (error.code !== "BAD_REQUEST") return error.message;
  const detail = error.details ? Object.values(error.details)[0] : undefined;
  return typeof detail === "string" && detail ? `${error.message} (${detail})` : error.message;
}

/** Cek tipe & ukuran sebelum upload; backend tetap memeriksa ulang isinya. */
export function validateLogoFile(file: File): string | null {
  if (!LOGO_TYPES.includes(file.type)) return "Format logo harus PNG, JPG, atau WebP.";
  if (file.size > LOGO_MAX_BYTES) return "Ukuran logo maksimal 5 MB.";
  return null;
}

export const listTeams = () => apiFetch<Team[]>("/teams", { auth: false });

export const getTeam = (idOrName: string) =>
  apiFetch<Team>(`/teams/${encodeURIComponent(idOrName)}`, { auth: false });

export const listGroups = () => apiFetch<Group[]>("/groups", { auth: false });

export const createTeam = (input: { name: string; group?: string; players: RosterEntry[] }) =>
  apiFetch<{ team: { id: string; name: string } }>("/teams", { method: "POST", body: input });

export const updateTeam = (teamId: string, input: { name?: string; group?: string }) =>
  apiFetch<Team>(`/teams/${teamId}`, { method: "PATCH", body: input });

/** Simpan seluruh roster: pemain yang tidak dikirim dihapus backend. */
export const saveRoster = (teamId: string, players: RosterEntry[]) =>
  apiFetch<Team>(`/teams/${teamId}/roster`, { method: "PUT", body: { players } });

export const deleteTeam = (teamId: string) =>
  apiFetch<{ message: string }>(`/teams/${teamId}`, { method: "DELETE" });

export const importTeams = (teams: ImportTeamInput[], overwrite: boolean) =>
  apiFetch<{ createdTeams: number; updatedTeams: number; createdPlayers: number }>("/teams/import", {
    method: "POST",
    body: { teams, overwrite },
  });

export const uploadTeamLogo = (teamId: string, file: File) =>
  apiFetch<{ logo: string; width: number; height: number; byteSize: number }>(`/teams/${teamId}/logo`, {
    method: "PUT",
    body: file,
  });

export const deleteTeamLogo = (teamId: string) =>
  apiFetch<{ logo: string }>(`/teams/${teamId}/logo`, { method: "DELETE" });
