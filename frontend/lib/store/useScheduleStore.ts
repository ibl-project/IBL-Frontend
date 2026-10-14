import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface QuarterScores {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  total: string;
}

export interface MatchSummaryTeam {
  fieldGoals: string; // e.g. "12/30 (40%)" or "0/0 (0%)"
  twoPoints: string;  // e.g. "8/18 (44%)"
  threePoints: string;// e.g. "4/12 (33%)"
  freeThrows: string; // e.g. "6/8 (75%)"
  rebounds: string;   // e.g. "14/22" (Offensive / Defensive)
  assists: string;    // e.g. "15"
}

export interface DetailedFile {
  name: string;
  size: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface ScheduleItem {
  id: string;
  team1: string;
  team2: string;
  team1Logo: string;
  team2Logo: string;
  venue: string;
  date: string; // e.g. "02 Sep 2026"
  rawDate: string; // e.g. "2026-09-02"
  time: string; // e.g. "11:00 WIB"
  scores: {
    team1: QuarterScores;
    team2: QuarterScores;
  };
  summary: {
    team1: MatchSummaryTeam;
    team2: MatchSummaryTeam;
  };
  detailedResultFile: DetailedFile | null;
}

interface ScheduleState {
  schedules: ScheduleItem[];
  selectedScheduleId: string | null;
  
  // Actions
  addSchedule: (scheduleData: {
    team1: string;
    team2: string;
    venue?: string;
    rawDate: string;
    time: string;
    team1Logo?: string;
    team2Logo?: string;
  }) => ScheduleItem;
  updateSchedule: (id: string, updatedData: Partial<ScheduleItem>) => void;
  deleteSchedule: (id: string) => void;
  setSelectedScheduleId: (id: string | null) => void;
  getScheduleById: (id: string) => ScheduleItem | undefined;
  resetToDefault: () => void;
}

const DEFAULT_SCHEDULES: ScheduleItem[] = [
  {
    id: "sch-1",
    team1: "HMD 1",
    team2: "HMD 2",
    team1Logo: "/images/LOGO_1.svg",
    team2Logo: "/images/LOGO_1.svg",
    venue: "Lapangan Basket Fasor ITS",
    date: "02 Sep 2026",
    rawDate: "2026-09-02",
    time: "11:00 WIB",
    scores: {
      team1: { q1: "18", q2: "22", q3: "15", q4: "20", total: "75" },
      team2: { q1: "16", q2: "19", q3: "21", q4: "14", total: "70" },
    },
    summary: {
      team1: {
        fieldGoals: "28/65 (43%)",
        twoPoints: "22/45 (48%)",
        threePoints: "6/20 (30%)",
        freeThrows: "13/18 (72%)",
        rebounds: "12/28",
        assists: "18",
      },
      team2: {
        fieldGoals: "26/62 (41%)",
        twoPoints: "21/44 (47%)",
        threePoints: "5/18 (27%)",
        freeThrows: "13/16 (81%)",
        rebounds: "10/25",
        assists: "14",
      },
    },
    detailedResultFile: {
      name: "dataaa.pdf",
      size: "5.3MB",
      uploadedAt: "02 Sep 2026 13:45",
    },
  },
  {
    id: "sch-2",
    team1: "HMD 1",
    team2: "HMD 2",
    team1Logo: "/images/LOGO_1.svg",
    team2Logo: "/images/LOGO_1.svg",
    venue: "Lapangan Basket Fasor ITS",
    date: "02 Sep 2026",
    rawDate: "2026-09-02",
    time: "11:00 WIB",
    scores: {
      team1: { q1: "-", q2: "-", q3: "-", q4: "-", total: "-" },
      team2: { q1: "-", q2: "-", q3: "-", q4: "-", total: "-" },
    },
    summary: {
      team1: {
        fieldGoals: "0/0 (0%)",
        twoPoints: "0/0 (0%)",
        threePoints: "0/0 (0%)",
        freeThrows: "0/0 (0%)",
        rebounds: "0/0",
        assists: "0",
      },
      team2: {
        fieldGoals: "0/0 (0%)",
        twoPoints: "0/0 (0%)",
        threePoints: "0/0 (0%)",
        freeThrows: "0/0 (0%)",
        rebounds: "0/0",
        assists: "0",
      },
    },
    detailedResultFile: null,
  },
  {
    id: "sch-3",
    team1: "HMD 1",
    team2: "HMD 2",
    team1Logo: "/images/LOGO_1.svg",
    team2Logo: "/images/LOGO_1.svg",
    venue: "Lapangan Basket Fasor ITS",
    date: "02 Sep 2026",
    rawDate: "2026-09-02",
    time: "11:00 WIB",
    scores: {
      team1: { q1: "-", q2: "-", q3: "-", q4: "-", total: "-" },
      team2: { q1: "-", q2: "-", q3: "-", q4: "-", total: "-" },
    },
    summary: {
      team1: {
        fieldGoals: "0/0 (0%)",
        twoPoints: "0/0 (0%)",
        threePoints: "0/0 (0%)",
        freeThrows: "0/0 (0%)",
        rebounds: "0/0",
        assists: "0",
      },
      team2: {
        fieldGoals: "0/0 (0%)",
        twoPoints: "0/0 (0%)",
        threePoints: "0/0 (0%)",
        freeThrows: "0/0 (0%)",
        rebounds: "0/0",
        assists: "0",
      },
    },
    detailedResultFile: null,
  },
  {
    id: "sch-4",
    team1: "HMD 1",
    team2: "HMD 2",
    team1Logo: "/images/LOGO_1.svg",
    team2Logo: "/images/LOGO_1.svg",
    venue: "Lapangan Basket Fasor ITS",
    date: "02 Sep 2026",
    rawDate: "2026-09-02",
    time: "11:00 WIB",
    scores: {
      team1: { q1: "-", q2: "-", q3: "-", q4: "-", total: "-" },
      team2: { q1: "-", q2: "-", q3: "-", q4: "-", total: "-" },
    },
    summary: {
      team1: {
        fieldGoals: "0/0 (0%)",
        twoPoints: "0/0 (0%)",
        threePoints: "0/0 (0%)",
        freeThrows: "0/0 (0%)",
        rebounds: "0/0",
        assists: "0",
      },
      team2: {
        fieldGoals: "0/0 (0%)",
        twoPoints: "0/0 (0%)",
        threePoints: "0/0 (0%)",
        freeThrows: "0/0 (0%)",
        rebounds: "0/0",
        assists: "0",
      },
    },
    detailedResultFile: null,
  },
];

export const formatDisplayDate = (rawDate: string): string => {
  if (!rawDate) return "";
  try {
    const parts = rawDate.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2].padStart(2, "0");
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return `${day} ${months[monthIdx] || ""} ${year}`;
    }
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      const day = String(d.getDate()).padStart(2, "0");
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    }
  } catch {
    // fallback
  }
  return rawDate;
};

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: DEFAULT_SCHEDULES,
      selectedScheduleId: null,

      addSchedule: ({
        team1,
        team2,
        venue = "Lapangan Basket Fasor ITS",
        rawDate,
        time,
        team1Logo = "/images/LOGO_1.svg",
        team2Logo = "/images/LOGO_1.svg",
      }) => {
        const id = `sch-${Date.now()}`;
        const formattedDate = formatDisplayDate(rawDate);

        const newSchedule: ScheduleItem = {
          id,
          team1,
          team2,
          team1Logo,
          team2Logo,
          venue,
          date: formattedDate,
          rawDate,
          time: time.includes("WIB") ? time : `${time} WIB`,
          scores: {
            team1: { q1: "-", q2: "-", q3: "-", q4: "-", total: "-" },
            team2: { q1: "-", q2: "-", q3: "-", q4: "-", total: "-" },
          },
          summary: {
            team1: {
              fieldGoals: "0/0 (0%)",
              twoPoints: "0/0 (0%)",
              threePoints: "0/0 (0%)",
              freeThrows: "0/0 (0%)",
              rebounds: "0/0",
              assists: "0",
            },
            team2: {
              fieldGoals: "0/0 (0%)",
              twoPoints: "0/0 (0%)",
              threePoints: "0/0 (0%)",
              freeThrows: "0/0 (0%)",
              rebounds: "0/0",
              assists: "0",
            },
          },
          detailedResultFile: null,
        };

        set((state) => ({
          schedules: [newSchedule, ...state.schedules],
        }));

        return newSchedule;
      },

      updateSchedule: (id, updatedData) => {
        set((state) => ({
          schedules: state.schedules.map((sch) => {
            if (sch.id !== id) return sch;
            const updated = { ...sch, ...updatedData };
            if (updatedData.rawDate) {
              updated.date = formatDisplayDate(updatedData.rawDate);
            }
            return updated;
          }),
        }));
      },

      deleteSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.filter((sch) => sch.id !== id),
          selectedScheduleId:
            state.selectedScheduleId === id ? null : state.selectedScheduleId,
        }));
      },

      setSelectedScheduleId: (id) => {
        set({ selectedScheduleId: id });
      },

      getScheduleById: (id) => {
        return get().schedules.find((sch) => sch.id === id);
      },

      resetToDefault: () => {
        set({
          schedules: DEFAULT_SCHEDULES,
          selectedScheduleId: null,
        });
      },
    }),
    {
      name: "ibl_schedule_storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
