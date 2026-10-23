import { ApiError, apiFetch } from "@/lib/apiClient";
import type { MatchListItem, MatchTeamSide, PlayoffRound } from "@/lib/matchesApi";

/**
 * Endpoint publik klasemen dan bracket playoff untuk halaman /groups-standings.
 * Kontrak lengkap: repo IBL-apidocs (koleksi Bruno), folder "Klasemen & Leaderboard"
 * dan "Playoff".
 */

// ---------------------------------------------------------------------------
// Klasemen
// ---------------------------------------------------------------------------

/** Satu baris klasemen. PM = poin dicetak (points made), bukan +/-. */
export interface StandingRow {
  rank: number;
  team: { id: string; name: string; logo: string };
  group: { id: string; name: string } | null;
  G: number;
  W: number;
  L: number;
  PM: number;
  PA: number;
  PD: number;
  PTS: number;
}

export interface StandingsGroup {
  id: string;
  name: string;
  standings: StandingRow[];
}

export interface StandingsConference {
  id: string;
  name: string;
  groups: StandingsGroup[];
  /** Ranking gabungan semua tim di conference, sudah diurutkan backend. */
  standings: StandingRow[];
}

export interface Standings {
  season: string;
  conferences: StandingsConference[];
}

export function getStandings(): Promise<Standings> {
  return apiFetch<Standings>("/standings", { auth: false });
}

// ---------------------------------------------------------------------------
// Bracket playoff
// ---------------------------------------------------------------------------

export type BracketSide = "LEFT" | "RIGHT" | "CENTER";

export interface PlayoffTeamSide extends MatchTeamSide {
  /** Peringkat tim di klasemen conference-nya; null kalau tim belum ditentukan. */
  seed: number | null;
}

export interface PlayoffMatch extends Omit<MatchListItem, "team1" | "team2"> {
  team1: PlayoffTeamSide;
  team2: PlayoffTeamSide;
}

export interface PlayoffSlot {
  position: number;
  /** LEFT = Conference 1, RIGHT = Conference 2, CENTER = Final & Juara 3. */
  side: BracketSide;
  match: PlayoffMatch | null;
}

export interface Playoffs {
  season: string;
  rounds: Array<{ round: PlayoffRound; label: string; slots: PlayoffSlot[] }>;
}

/** null kalau backend belum punya endpoint /playoffs (404), supaya halaman menampilkan "belum tersedia". */
export async function getPlayoffs(): Promise<Playoffs | null> {
  try {
    return await apiFetch<Playoffs>("/playoffs", { auth: false });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Bentuk data komponen PlayoffBracket
// ---------------------------------------------------------------------------

export interface PlayoffMatchTeam {
  name: string;
  seed?: number;
  score?: number;
  winner?: boolean;
}

export interface PlayoffDuel {
  id: string;
  teamA: PlayoffMatchTeam;
  teamB: PlayoffMatchTeam;
}

export interface PlayoffTournamentData {
  left: { r16: PlayoffDuel[]; qf: PlayoffDuel[]; sf: PlayoffDuel };
  right: { r16: PlayoffDuel[]; qf: PlayoffDuel[]; sf: PlayoffDuel };
  final: PlayoffDuel;
  thirdPlace: PlayoffDuel;
}

function toTeam(match: PlayoffMatch | null, side: PlayoffTeamSide | undefined): PlayoffMatchTeam {
  if (!match || !side) return { name: "TBD" };
  return {
    name: side.name ?? side.placeholder ?? "TBD",
    seed: side.seed ?? undefined,
    // Skor 0–0 jadwal yang belum dimulai tidak ditampilkan.
    score: match.status === "SCHEDULED" ? undefined : side.score,
    winner: side.id !== null && match.winnerTeamId === side.id,
  };
}

function toDuel(round: PlayoffRound, slot: PlayoffSlot): PlayoffDuel {
  return {
    id: slot.match?.id ?? `${round}-${slot.position}`,
    teamA: toTeam(slot.match, slot.match?.team1),
    teamB: toTeam(slot.match, slot.match?.team2),
  };
}

/**
 * Respons GET /playoffs menjadi bentuk PlayoffBracket. Sisi kiri/kanan dari
 * `side` setiap slot; slot yang belum dijadwalkan tampil sebagai "TBD".
 */
export function toBracket(playoffs: Playoffs): PlayoffTournamentData {
  const duels = (round: PlayoffRound, side: BracketSide) => {
    const found = playoffs.rounds.find((item) => item.round === round);
    return (found?.slots ?? [])
      .filter((slot) => slot.side === side)
      .map((slot) => toDuel(round, slot));
  };
  const single = (round: PlayoffRound, side: BracketSide): PlayoffDuel =>
    duels(round, side)[0] ?? { id: `${round}-${side}`, teamA: { name: "TBD" }, teamB: { name: "TBD" } };

  return {
    left: { r16: duels("ROUND_OF_16", "LEFT"), qf: duels("QUARTERFINAL", "LEFT"), sf: single("SEMIFINAL", "LEFT") },
    right: { r16: duels("ROUND_OF_16", "RIGHT"), qf: duels("QUARTERFINAL", "RIGHT"), sf: single("SEMIFINAL", "RIGHT") },
    final: single("FINAL", "CENTER"),
    thirdPlace: single("THIRD_PLACE", "CENTER"),
  };
}
