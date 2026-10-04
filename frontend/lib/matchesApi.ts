import { ApiError, apiFetch } from "@/lib/apiClient";

/**
 * Endpoint jadwal (Schedule Result), PDF hasil, dan sesi scoring di backend.
 * Kontrak lengkap: IBL-Backend/docs/API.md bagian "Pertandingan" & "Scoring".
 */

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED";
export type MatchStage = "GROUP" | "PLAYOFF" | "EXHIBITION";

export const PLAYOFF_ROUNDS = ["ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL", "THIRD_PLACE", "FINAL"] as const;
export type PlayoffRound = (typeof PLAYOFF_ROUNDS)[number];

export const PLAYOFF_ROUND_LABEL: Record<PlayoffRound, string> = {
  ROUND_OF_16: "16 Besar",
  QUARTERFINAL: "Perempat Final",
  SEMIFINAL: "Semifinal",
  THIRD_PLACE: "Perebutan Juara 3",
  FINAL: "Final",
};

export const STAT_KEYS = [
  "twoPointMade",
  "twoPointMiss",
  "threePointMade",
  "threePointMiss",
  "assist",
  "freethrowMade",
  "freethrowMiss",
  "reboundOff",
  "reboundDef",
  "foul",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];
export type StatCounts = Record<StatKey, number>;

export interface ResultFile {
  name: string;
  byteSize: number;
  url: string;
  uploadedAt: string;
}

export interface MatchTeamSide {
  id: string | null;
  name: string | null;
  logo: string | null;
  placeholder: string | null;
  color: string;
  score: number;
}

export interface MatchListItem {
  id: string;
  season: string;
  matchNumber: number | null;
  stage: MatchStage;
  group: { id: string; name: string } | null;
  playoffRound: PlayoffRound | null;
  bracketPosition: number | null;
  status: MatchStatus;
  locked: boolean;
  scheduledAt: string | null;
  venue: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  resultFile: ResultFile | null;
  team1: MatchTeamSide;
  team2: MatchTeamSide;
  winnerTeamId: string | null;
}

export interface PlayerLine extends StatCounts {
  id: string;
  name: string;
  nopung: string;
  isCaptain: boolean;
  points: number;
}

export interface TeamSummary {
  points: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalPercentage: number;
  twoPointMade: number;
  twoPointAttempted: number;
  twoPointPercentage: number;
  threePointMade: number;
  threePointAttempted: number;
  threePointPercentage: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  freeThrowPercentage: number;
  reboundOff: number;
  reboundDef: number;
  rebounds: number;
  assist: number;
  foul: number;
}

export interface MatchSide extends MatchTeamSide {
  summary: TeamSummary;
  players: PlayerLine[];
}

/** Keadaan lengkap satu match (GET /matches/:id, event SSE `snapshot`). */
export interface MatchSnapshot {
  id: string;
  season: string;
  matchNumber: number | null;
  stage: MatchStage;
  group: { id: string; name: string } | null;
  playoffRound: PlayoffRound | null;
  status: MatchStatus;
  locked: boolean;
  lockedAt: string | null;
  scheduledAt: string | null;
  venue: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  resultFile: ResultFile | null;
  team1: MatchSide;
  team2: MatchSide;
}

export interface Person {
  id: string;
  name: string;
}

export interface ScoringBoardItem extends MatchListItem {
  scoring: {
    /** Akun yang sedang memegang sesi scoring (null kalau tidak ada / sudah habis). */
    holder: Person | null;
    isMine: boolean;
    leaseExpiresAt: string | null;
    lockedAt: string | null;
    lockedBy: Person | null;
  };
}

export interface ScoringBoard {
  /** Tab "Match N": match yang sudah dimulai, urut nomor. */
  opened: ScoringBoardItem[];
  /** Jadwal yang belum dimulai, untuk tombol Choose. */
  available: ScoringBoardItem[];
  session: { ttlSeconds: number; heartbeatSeconds: number };
}

export interface ScheduleInput {
  team1Id: string;
  team2Id: string;
  /** ISO dengan zona waktu, mis. "2026-09-02T11:00:00+07:00". */
  scheduledAt: string;
  venue: string;
}

/** Jenis hanya dipilih saat membuat jadwal; Edit tidak bisa mengubahnya. */
export interface CreateScheduleInput extends ScheduleInput {
  stage: "GROUP" | "PLAYOFF";
  playoffRound?: PlayoffRound;
}

/** Label jenis pertandingan di kartu & detail: "Group B", "16 Besar", "Final", dst. */
export function stageLabel(match: Pick<MatchListItem, "stage" | "group" | "playoffRound">): string {
  if (match.stage === "PLAYOFF") return match.playoffRound ? PLAYOFF_ROUND_LABEL[match.playoffRound] : "Playoff";
  if (match.stage === "EXHIBITION") return "Exhibition";
  return match.group?.name ?? "Fase grup";
}

export interface LineupEntry {
  playerId: string;
  jerseyNumber: string;
  isCaptain: boolean;
}

export interface ActionResult {
  team1Score: number;
  team2Score: number;
  player: PlayerLine;
  duplicate?: boolean;
}

export const RESULT_FILE_MAX_BYTES = 10 * 1024 * 1024;

/** Kode error sesi scoring dari backend (lihat utils/scoringSession.ts). */
export function isSessionError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError &&
    ["SCORING_IN_USE", "SCORING_SESSION_REQUIRED", "MATCH_LOCKED"].includes(error.code)
  );
}

/** Cek sebelum upload; backend tetap memeriksa isi file. */
export function validateResultFile(file: File): string | null {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf) return "File harus berformat PDF.";
  if (file.size > RESULT_FILE_MAX_BYTES) return "Ukuran PDF maksimal 10 MB.";
  return null;
}

// --- Jadwal ------------------------------------------------------------------

/** `date` = "YYYY-MM-DD" (WIB) untuk filter tanggal. */
export const listMatches = (date?: string) =>
  apiFetch<MatchListItem[]>(`/matches${date ? `?date=${date}` : ""}`, { auth: false });

export const getMatch = (id: string) => apiFetch<MatchSnapshot>(`/matches/${id}`, { auth: false });

export const createSchedule = (input: CreateScheduleInput) =>
  apiFetch<MatchListItem>("/matches", { method: "POST", body: input });

export const updateSchedule = (id: string, input: Partial<ScheduleInput>) =>
  apiFetch<MatchListItem>(`/matches/${id}`, { method: "PATCH", body: input });

export const deleteSchedule = (id: string) =>
  apiFetch<{ message: string }>(`/matches/${id}`, { method: "DELETE" });

export const uploadResultFile = (id: string, file: File) =>
  apiFetch<ResultFile>(`/matches/${id}/result-file?name=${encodeURIComponent(file.name)}`, {
    method: "PUT",
    // Beberapa sistem memberi PDF tipe kosong; backend hanya menerima application/pdf.
    body: new Blob([file], { type: "application/pdf" }),
  });

export const deleteResultFile = (id: string) =>
  apiFetch<{ resultFile: null }>(`/matches/${id}/result-file`, { method: "DELETE" });

// --- Scoring -----------------------------------------------------------------

export const getScoringBoard = () => apiFetch<ScoringBoard>("/scoring/matches");

export const claimSession = (id: string) =>
  apiFetch<{ holder: Person; leaseExpiresAt: string; ttlSeconds: number; heartbeatSeconds: number }>(
    `/matches/${id}/scoring/session`,
    { method: "PUT" },
  );

export const releaseSession = (id: string, keepalive = false) =>
  apiFetch<{ released: boolean }>(`/matches/${id}/scoring/session`, { method: "DELETE", keepalive });

export const saveLineup = (id: string, lineup: { team1: LineupEntry[]; team2: LineupEntry[] }) =>
  apiFetch<MatchSnapshot>(`/matches/${id}/lineup`, { method: "PUT", body: lineup });

export const startMatch = (id: string) =>
  apiFetch<{ matchNumber: number }>(`/matches/${id}/start`, { method: "POST" });

export const recordAction = (
  id: string,
  action: { actionId: string; playerId: string; teamId: string; actionType: StatKey; delta: 1 | -1 },
) => apiFetch<ActionResult>(`/matches/${id}/actions`, { method: "POST", body: action });

export const updateColors = (id: string, colors: { team1Color?: string; team2Color?: string }) =>
  apiFetch<{ team1Color: string; team2Color: string }>(`/matches/${id}/colors`, {
    method: "PATCH",
    body: colors,
  });

export const lockMatch = (id: string) =>
  apiFetch<{ locked: true; winnerTeamId: string | null }>(`/matches/${id}/lock`, { method: "POST" });

export const unlockMatch = (id: string) =>
  apiFetch<{ locked: false }>(`/matches/${id}/unlock`, { method: "POST" });
