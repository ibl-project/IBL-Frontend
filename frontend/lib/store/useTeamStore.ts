import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { teamApiService } from "@/lib/services/teamApiService";

/**
 * ============================================================================
 * CATATAN ARSITEKTUR & PENGEMBANGAN:
 * ============================================================================
 * Middleware `persist` (localStorage) di bawah ini digunakan SEMENTARA untuk
 * kebutuhan pengujian (test case), simulasi konsistensi data antar-halaman (Teams & Scoring),
 * serta prototyping di sisi Frontend tanpa ketergantungan server.
 *
 * KETIKA BACKEND & DATABASE SUDAH TERHUBUNG:
 * 1. Hapus middleware `persist` dan storage localStorage ini.
 * 2. Store Zustand ini cukup difungsikan sebagai caching client-state atau cukup fetch data
 *    langsung menggunakan TanStack Query / SWR / Server Components.
 * 3. Aksi save / edit (updateTeam, updatePlayers, dsb) nantinya akan memanggil REST/GraphQL API
 *    (e.g., PUT /api/teams/:id) untuk persistensi langsung ke Database.
 * ============================================================================
 */

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

export interface Player {
  id: number;
  name: string;
  nopung?: string;
  isCaptain?: boolean;
  stats: PlayerStats;
}

export interface TeamStats {
  G: string;
  W: string;
  L: string;
  PM: string;
  PA: string;
  PD: string;
  PTS: string;
}

export interface Team {
  id: string;
  name: string;
  group: string;
  logo: string;
  teamStats: TeamStats;
  players: Player[];
}

interface TeamState {
  teams: Team[];
  isLoadingFromBackend: boolean;
  // Actions
  updateTeam: (teamId: string, updatedData: Partial<Team>) => void;
  updateTeamStats: (teamId: string, stats: TeamStats) => void;
  updatePlayers: (teamId: string, players: Player[]) => void;
  getTeamById: (teamId: string) => Team | undefined;
  getTeamByName: (teamName: string) => Team | undefined;
  syncWithBackend: () => Promise<void>;
  resetToDefault: () => void;
}

const DEFAULT_INDONESIAN_NAMES = [
  "Budi Santoso",
  "Agus Setiawan",
  "Rizky Aditya",
  "Ahmad Fauzi",
  "Dimas Pratama",
  "Reza Rahadian",
  "Dika Saputra",
  "Wahyu Hidayat",
  "Ilham Akbar",
  "Kevin Sanjaya",
  "Bagas Maulana",
  "Putra Andika",
  "Irfan Kurniawan",
  "Hendra Setiawan",
  "Rendi Pangalila",
];

const DEMO_PLAYER_STATS: PlayerStats[] = [
  { game: "5", point: "86", assist: "24", rebound: "18", ppg: "17.2", apg: "4.8", rpg: "3.6", fgPercent: "48.2%", threePPercent: "38.5%", twoPPercent: "52.0%", ftPercent: "84.2%" },
  { game: "5", point: "74", assist: "16", rebound: "35", ppg: "14.8", apg: "3.2", rpg: "7.0", fgPercent: "51.4%", threePPercent: "33.3%", twoPPercent: "56.1%", ftPercent: "77.8%" },
  { game: "5", point: "62", assist: "31", rebound: "12", ppg: "12.4", apg: "6.2", rpg: "2.4", fgPercent: "44.0%", threePPercent: "36.8%", twoPPercent: "47.5%", ftPercent: "88.0%" },
  { game: "5", point: "55", assist: "11", rebound: "42", ppg: "11.0", apg: "2.2", rpg: "8.4", fgPercent: "55.2%", threePPercent: "20.0%", twoPPercent: "58.0%", ftPercent: "68.5%" },
  { game: "5", point: "48", assist: "19", rebound: "20", ppg: "9.6", apg: "3.8", rpg: "4.0", fgPercent: "42.5%", threePPercent: "34.1%", twoPPercent: "46.0%", ftPercent: "81.0%" },
  { game: "4", point: "36", assist: "8", rebound: "15", ppg: "9.0", apg: "2.0", rpg: "3.8", fgPercent: "40.0%", threePPercent: "31.0%", twoPPercent: "44.0%", ftPercent: "75.0%" },
  { game: "4", point: "28", assist: "14", rebound: "9", ppg: "7.0", apg: "3.5", rpg: "2.3", fgPercent: "43.5%", threePPercent: "35.0%", twoPPercent: "46.2%", ftPercent: "70.0%" },
  { game: "4", point: "24", assist: "6", rebound: "18", ppg: "6.0", apg: "1.5", rpg: "4.5", fgPercent: "47.8%", threePPercent: "25.0%", twoPPercent: "50.0%", ftPercent: "66.7%" },
  { game: "3", point: "18", assist: "9", rebound: "7", ppg: "6.0", apg: "3.0", rpg: "2.3", fgPercent: "38.9%", threePPercent: "30.0%", twoPPercent: "42.1%", ftPercent: "80.0%" },
  { game: "3", point: "15", assist: "4", rebound: "12", ppg: "5.0", apg: "1.3", rpg: "4.0", fgPercent: "45.0%", threePPercent: "0.0%", twoPPercent: "48.0%", ftPercent: "60.0%" },
  { game: "3", point: "12", assist: "7", rebound: "5", ppg: "4.0", apg: "2.3", rpg: "1.7", fgPercent: "36.4%", threePPercent: "33.3%", twoPPercent: "38.5%", ftPercent: "75.0%" },
  { game: "2", point: "8", assist: "2", rebound: "6", ppg: "4.0", apg: "1.0", rpg: "3.0", fgPercent: "40.0%", threePPercent: "25.0%", twoPPercent: "44.4%", ftPercent: "50.0%" },
  { game: "2", point: "6", assist: "3", rebound: "4", ppg: "3.0", apg: "1.5", rpg: "2.0", fgPercent: "33.3%", threePPercent: "20.0%", twoPPercent: "37.5%", ftPercent: "66.7%" },
  { game: "1", point: "4", assist: "1", rebound: "2", ppg: "4.0", apg: "1.0", rpg: "2.0", fgPercent: "50.0%", threePPercent: "50.0%", twoPPercent: "50.0%", ftPercent: "0.0%" },
  { game: "1", point: "2", assist: "0", rebound: "3", ppg: "2.0", apg: "0.0", rpg: "3.0", fgPercent: "33.3%", threePPercent: "0.0%", twoPPercent: "33.3%", ftPercent: "50.0%" },
];

const createDefaultStats = (idx: number = 0): PlayerStats => {
  return DEMO_PLAYER_STATS[idx % DEMO_PLAYER_STATS.length];
};

const createDefaultTeamStats = (index: number = 0): TeamStats => {
  const wins = Math.max(1, 5 - (index % 5));
  const losses = 5 - wins;
  const pm = 360 + (wins * 18) - (losses * 6);
  const pa = 350 + (losses * 14) - (wins * 4);
  const pd = pm - pa;
  const pts = wins * 2 + losses;
  return {
    G: "5",
    W: String(wins),
    L: String(losses),
    PM: String(pm),
    PA: String(pa),
    PD: pd > 0 ? `+${pd}` : String(pd),
    PTS: String(pts),
  };
};

const createInitialPlayersForTeam = (): Player[] => {
  return DEFAULT_INDONESIAN_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    nopung: String(index + 1),
    isCaptain: index === 0,
    stats: createDefaultStats(index),
  }));
};

const createInitialTeams = (): Team[] => {
  return Array.from({ length: 18 }, (_, index) => {
    const id = String(index + 1);
    const group = index < 6 ? "Group A" : index < 12 ? "Group B" : "Group C";
    return {
      id,
      name: `HMD ${index + 1}`,
      group,
      logo: "/images/LOGO_1.svg",
      teamStats: createDefaultTeamStats(index),
      players: createInitialPlayersForTeam(),
    };
  });
};

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: createInitialTeams(),
      isLoadingFromBackend: false,

      updateTeam: (teamId: string, updatedData: Partial<Team>) => {
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === teamId ? { ...team, ...updatedData } : team
          ),
        }));
        // Fire-and-forget sync to Fastify backend if online
        teamApiService.updateTeam(teamId, updatedData).catch(() => {});
      },

      updateTeamStats: (teamId: string, stats: TeamStats) => {
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === teamId ? { ...team, teamStats: stats } : team
          ),
        }));
      },

      updatePlayers: (teamId: string, players: Player[]) => {
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === teamId ? { ...team, players } : team
          ),
        }));
      },

      getTeamById: (teamId: string) => {
        return get().teams.find((team) => team.id === teamId);
      },

      getTeamByName: (teamName: string) => {
        return get().teams.find(
          (team) => team.name.toLowerCase() === teamName.toLowerCase()
        );
      },

      syncWithBackend: async () => {
        set({ isLoadingFromBackend: true });
        try {
          const backendTeams = await teamApiService.getTeams();
          if (backendTeams && backendTeams.length > 0) {
            set({ teams: backendTeams });
          }
        } finally {
          set({ isLoadingFromBackend: false });
        }
      },

      resetToDefault: () => {
        set({ teams: createInitialTeams() });
      },
    }),
    {
      name: "ibl_teams_storage_v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
