import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface BoxScoreStats {
  twoPointMade: number;
  twoPointMiss: number;
  threePointMade: number;
  threePointMiss: number;
  assist: number;
  freethrowMade: number;
  freethrowMiss: number;
  reboundOff: number;
  reboundDef: number;
  foul: number;
}

export const createInitialBoxScoreStats = (): BoxScoreStats => ({
  twoPointMade: 0,
  twoPointMiss: 0,
  threePointMade: 0,
  threePointMiss: 0,
  assist: 0,
  freethrowMade: 0,
  freethrowMiss: 0,
  reboundOff: 0,
  reboundDef: 0,
  foul: 0,
});

export interface MatchPlayer {
  id: number;
  name: string;
  nopung: string;
  isCaptain?: boolean;
}

export interface MatchItem {
  id: number;
  mode: "SEARCH" | "BOX_SCORE";
  team1?: string;
  team2?: string;
  color1?: string;
  color2?: string;
  players1?: MatchPlayer[];
  players2?: MatchPlayer[];
  stats1?: { [playerId: number]: BoxScoreStats };
  stats2?: { [playerId: number]: BoxScoreStats };
}

interface MatchStoreState {
  matches: MatchItem[];
  activeMatchId: number | null;
  nextId: number;

  addMatch: () => number;
  removeMatch: (id: number) => void;
  setActiveMatchId: (id: number | null) => void;
  createMatch: (
    id: number,
    team1: string,
    team2: string,
    players1: MatchPlayer[],
    players2: MatchPlayer[]
  ) => void;
  updateMatchStats: (
    id: number,
    teamIdx: 1 | 2,
    playerId: number,
    statKey: keyof BoxScoreStats,
    delta: number
  ) => void;
  setAllMatchStats: (
    id: number,
    stats1: { [playerId: number]: BoxScoreStats },
    stats2: { [playerId: number]: BoxScoreStats }
  ) => void;
  updateMatchColors: (id: number, color1: string, color2: string) => void;
  updateMatchPlayerName: (
    id: number,
    teamIdx: 1 | 2,
    playerId: number,
    name: string
  ) => void;
  resetAllMatches: () => void;
}

export const useMatchStore = create<MatchStoreState>()(
  persist(
    (set, get) => ({
      matches: [],
      activeMatchId: null,
      nextId: 1,

      addMatch: () => {
        const state = get();
        const currentMatches = state.matches;
        // Hitung id berikutnya berdasarkan id tertinggi yang ada
        const maxId = currentMatches.reduce((max, m) => (m.id > max ? m.id : max), 0);
        const newId = maxId + 1;

        const newMatch: MatchItem = {
          id: newId,
          mode: "SEARCH",
        };

        set({
          matches: [...currentMatches, newMatch],
          activeMatchId: newId,
          nextId: newId + 1,
        });

        return newId;
      },

      removeMatch: (id: number) => {
        const state = get();
        const remaining = state.matches.filter((m) => m.id !== id);

        let newActiveId = state.activeMatchId;
        if (state.activeMatchId === id) {
          newActiveId = remaining.length > 0 ? remaining[remaining.length - 1].id : null;
        }

        set({
          matches: remaining,
          activeMatchId: newActiveId,
          nextId: remaining.length === 0 ? 1 : state.nextId,
        });
      },

      setActiveMatchId: (id: number | null) => {
        set({ activeMatchId: id });
      },

      createMatch: (id, team1, team2, players1, players2) => {
        const sortPlayers = (players: MatchPlayer[]) => {
          return [...(players || [])].sort((a, b) => {
            const numA = parseInt(String(a.nopung ?? "").trim(), 10);
            const numB = parseInt(String(b.nopung ?? "").trim(), 10);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            if (!isNaN(numA)) return -1;
            if (!isNaN(numB)) return 1;
            return String(a.nopung ?? "").localeCompare(String(b.nopung ?? ""), undefined, { numeric: true });
          });
        };

        const sortedP1 = sortPlayers(players1);
        const sortedP2 = sortPlayers(players2);

        // Inisialisasi statistik awal untuk semua pemain
        const initialStats1: { [playerId: number]: BoxScoreStats } = {};
        sortedP1.forEach((p) => {
          initialStats1[p.id] = createInitialBoxScoreStats();
        });

        const initialStats2: { [playerId: number]: BoxScoreStats } = {};
        sortedP2.forEach((p) => {
          initialStats2[p.id] = createInitialBoxScoreStats();
        });

        set((state) => ({
          matches: state.matches.map((m) => {
            if (m.id !== id) return m;
            return {
              ...m,
              mode: "BOX_SCORE",
              team1,
              team2,
              color1: m.color1 || "#ffffff",
              color2: m.color2 || "#ffffff",
              players1: sortedP1,
              players2: sortedP2,
              stats1: m.stats1 && Object.keys(m.stats1).length > 0 ? m.stats1 : initialStats1,
              stats2: m.stats2 && Object.keys(m.stats2).length > 0 ? m.stats2 : initialStats2,
            };
          }),
        }));
      },

      updateMatchStats: (id, teamIdx, playerId, statKey, delta) => {
        set((state) => ({
          matches: state.matches.map((m) => {
            if (m.id !== id) return m;

            if (teamIdx === 1) {
              const currentStats1 = m.stats1 || {};
              const playerStat = currentStats1[playerId] || createInitialBoxScoreStats();
              const nextVal = Math.max(0, (playerStat[statKey] || 0) + delta);
              return {
                ...m,
                stats1: {
                  ...currentStats1,
                  [playerId]: {
                    ...playerStat,
                    [statKey]: nextVal,
                  },
                },
              };
            } else {
              const currentStats2 = m.stats2 || {};
              const playerStat = currentStats2[playerId] || createInitialBoxScoreStats();
              const nextVal = Math.max(0, (playerStat[statKey] || 0) + delta);
              return {
                ...m,
                stats2: {
                  ...currentStats2,
                  [playerId]: {
                    ...playerStat,
                    [statKey]: nextVal,
                  },
                },
              };
            }
          }),
        }));
      },

      setAllMatchStats: (id, stats1, stats2) => {
        set((state) => ({
          matches: state.matches.map((m) =>
            m.id === id ? { ...m, stats1, stats2 } : m
          ),
        }));
      },

      updateMatchColors: (id, color1, color2) => {
        set((state) => ({
          matches: state.matches.map((m) =>
            m.id === id ? { ...m, color1, color2 } : m
          ),
        }));
      },

      updateMatchPlayerName: (id, teamIdx, playerId, name) => {
        set((state) => ({
          matches: state.matches.map((m) => {
            if (m.id !== id) return m;
            if (teamIdx === 1) {
              return {
                ...m,
                players1: (m.players1 || []).map((p) =>
                  p.id === playerId ? { ...p, name } : p
                ),
              };
            } else {
              return {
                ...m,
                players2: (m.players2 || []).map((p) =>
                  p.id === playerId ? { ...p, name } : p
                ),
              };
            }
          }),
        }));
      },

      resetAllMatches: () => {
        set({ matches: [], activeMatchId: null, nextId: 1 });
      },
    }),
    {
      name: "ibl-match-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
