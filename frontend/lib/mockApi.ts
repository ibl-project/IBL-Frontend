import type { AuthUser } from "@/lib/store/useAuthStore";
import type { Group, Team, TeamPlayer } from "@/lib/teamsApi";
import type {
  MatchListItem,
  MatchSnapshot,
  PlayoffRound,
  QuarterState,
  ScoringBoard,
  ScoringBoardItem,
  TeamSummary,
} from "@/lib/matchesApi";
import type { Playoffs, Standings } from "@/lib/standingsApi";

// ---------------------------------------------------------------------------
// 1. MOCK USER
// ---------------------------------------------------------------------------
export const MOCK_USER: AuthUser = {
  id: "usr_mock_admin_1",
  email: "admin@ibl.its.ac.id",
  name: "Panitia IBL (Dev Mock)",
  role: "admin",
  lastLoginAt: new Date().toISOString(),
  createdAt: "2026-01-01T00:00:00.000Z",
};

// ---------------------------------------------------------------------------
// 2. MOCK GROUPS & TEAMS
// ---------------------------------------------------------------------------
export const MOCK_GROUPS: Group[] = [
  { id: "grp-a", name: "Group A", conference: { id: "conf-west", name: "Western Conference" } },
  { id: "grp-b", name: "Group B", conference: { id: "conf-east", name: "Eastern Conference" } },
];

function createPlayerStats() {
  return {
    game: "4",
    point: "48",
    assist: "16",
    rebound: "20",
    ppg: "12.0",
    apg: "4.0",
    rpg: "5.0",
    fgPercent: "48%",
    threePPercent: "35%",
    twoPPercent: "52%",
    ftPercent: "75%",
  };
}

function makePlayers(teamName: string, rawPlayers: Array<{ name: string; nopung: string; isCaptain: boolean }>): TeamPlayer[] {
  return rawPlayers.map((p, idx) => ({
    id: `ply-${teamName.toLowerCase().replace(/\s+/g, "-")}-${idx + 1}`,
    name: p.name,
    nopung: p.nopung,
    isCaptain: p.isCaptain,
    stats: createPlayerStats(),
  }));
}

const INITIAL_TEAMS: Team[] = [
  {
    id: "team-hmtc",
    name: "HMTC",
    group: "Group A",
    groupId: "grp-a",
    conference: "Western Conference",
    logo: "/images/LOGO_1.svg",
    season: "2K26",
    teamStats: { G: "4", W: "4", L: "0", PM: "340", PA: "280", PD: "+60", PTS: "8" },
    players: makePlayers("HMTC", [
      { name: "Andakara Prastawa", nopung: "7", isCaptain: true },
      { name: "Agassi Goantara", nopung: "1", isCaptain: false },
      { name: "Reza Guntara", nopung: "13", isCaptain: false },
      { name: "Vincent Kosasih", nopung: "22", isCaptain: false },
      { name: "Hendrick Yonga", nopung: "3", isCaptain: false },
      { name: "Brandon Jawato", nopung: "0", isCaptain: false },
      { name: "Jerome Anthony", nopung: "21", isCaptain: false },
      { name: "Aldy Izzatur", nopung: "2", isCaptain: false },
      { name: "K.J. McDaniels", nopung: "32", isCaptain: false },
      { name: "Justin Brownlee", nopung: "31", isCaptain: false },
      { name: "Muhamad Arighi", nopung: "11", isCaptain: false },
      { name: "Abiyyu Ramadhan", nopung: "15", isCaptain: false },
    ]),
  },
  {
    id: "team-himasisfo",
    name: "HIMASISFO",
    group: "Group A",
    groupId: "grp-a",
    conference: "Western Conference",
    logo: "/images/LOGO_1.svg",
    season: "2K26",
    teamStats: { G: "4", W: "3", L: "1", PM: "315", PA: "290", PD: "+25", PTS: "7" },
    players: makePlayers("HIMASISFO", [
      { name: "Arki Dikania Wisnu", nopung: "33", isCaptain: true },
      { name: "Juan Laurent Kokodiputra", nopung: "4", isCaptain: false },
      { name: "Hardianus Ruslak", nopung: "8", isCaptain: false },
      { name: "Laurentius Steven Oei", nopung: "23", isCaptain: false },
      { name: "Antoni Erga", nopung: "11", isCaptain: false },
      { name: "Sandy Ibrahim", nopung: "12", isCaptain: false },
      { name: "Widyanta Putra Teja", nopung: "71", isCaptain: false },
      { name: "Ali Bagir", nopung: "14", isCaptain: false },
      { name: "Dame Diagne", nopung: "18", isCaptain: false },
      { name: "Avan Seputra", nopung: "2", isCaptain: false },
      { name: "Karl Patrick Utiarahman", nopung: "24", isCaptain: false },
      { name: "Julian Chalias", nopung: "3", isCaptain: false },
    ]),
  },
  {
    id: "team-hmm",
    name: "HMM",
    group: "Group A",
    groupId: "grp-a",
    conference: "Western Conference",
    logo: "/images/LOGO_1.svg",
    season: "2K26",
    teamStats: { G: "4", W: "2", L: "2", PM: "295", PA: "295", PD: "0", PTS: "6" },
    players: makePlayers("HMM", [
      { name: "Yudha Saputera", nopung: "8", isCaptain: true },
      { name: "Abraham Damar Grahita", nopung: "4", isCaptain: false },
      { name: "Indra Muhammad", nopung: "10", isCaptain: false },
      { name: "Hans Abraham", nopung: "13", isCaptain: false },
      { name: "Pandu Wiguna", nopung: "34", isCaptain: false },
      { name: "Fernando Manansang", nopung: "21", isCaptain: false },
      { name: "Kelvin Sanjaya", nopung: "17", isCaptain: false },
      { name: "Fhirdan Guntara", nopung: "12", isCaptain: false },
      { name: "Sulthan Fauzan", nopung: "1", isCaptain: false },
      { name: "Rizal Falconi", nopung: "77", isCaptain: false },
    ]),
  },
  {
    id: "team-hme",
    name: "HME",
    group: "Group A",
    groupId: "grp-a",
    conference: "Western Conference",
    logo: "/images/LOGO_1.svg",
    season: "2K26",
    teamStats: { G: "4", W: "1", L: "3", PM: "270", PA: "310", PD: "-40", PTS: "5" },
    players: makePlayers("HME", [
      { name: "Kaleb Ramot Gemilang", nopung: "13", isCaptain: true },
      { name: "Hardianus", nopung: "8", isCaptain: false },
      { name: "Dio Tirta", nopung: "2", isCaptain: false },
      { name: "Bryan Fernando", nopung: "5", isCaptain: false },
      { name: "Kevin Moses", nopung: "23", isCaptain: false },
      { name: "Firman Dwi Nugroho", nopung: "16", isCaptain: false },
      { name: "Patrick Nikolas", nopung: "1", isCaptain: false },
      { name: "Lester Prosper", nopung: "0", isCaptain: false },
    ]),
  },
  {
    id: "team-hms",
    name: "HMS",
    group: "Group A",
    groupId: "grp-a",
    conference: "Western Conference",
    logo: "/images/LOGO_1.svg",
    season: "2K26",
    teamStats: { G: "4", W: "0", L: "4", PM: "250", PA: "330", PD: "-80", PTS: "4" },
    players: makePlayers("HMS", [
      { name: "Januar Kuntara", nopung: "6", isCaptain: true },
      { name: "Althof Satrio", nopung: "10", isCaptain: false },
      { name: "Oki Wira Sanjaya", nopung: "13", isCaptain: false },
      { name: "Argus Sanyudy", nopung: "17", isCaptain: false },
      { name: "Fatur Dwi", nopung: "21", isCaptain: false },
      { name: "Ida Bagus Ananta", nopung: "3", isCaptain: false },
    ]),
  },
  {
    id: "team-hmti",
    name: "HMTI",
    group: "Group B",
    groupId: "grp-b",
    conference: "Eastern Conference",
    logo: "/images/LOGO_1.svg",
    season: "2K26",
    teamStats: { G: "4", W: "4", L: "0", PM: "360", PA: "270", PD: "+90", PTS: "8" },
    players: makePlayers("HMTI", [
      { name: "Kentrell Barkley", nopung: "24", isCaptain: true },
      { name: "Nuke Tri Saputra", nopung: "3", isCaptain: false },
      { name: "Kevin Nugroho", nopung: "10", isCaptain: false },
      { name: "Andre Rorimpandey", nopung: "7", isCaptain: false },
      { name: "Samuel Devin", nopung: "11", isCaptain: false },
      { name: "Tifan Eka Pradita", nopung: "1", isCaptain: false },
    ]),
  },
  {
    id: "team-himatika",
    name: "HIMATIKA",
    group: "Group B",
    groupId: "grp-b",
    conference: "Eastern Conference",
    logo: "/images/LOGO_1.svg",
    season: "2K26",
    teamStats: { G: "4", W: "3", L: "1", PM: "310", PA: "290", PD: "+20", PTS: "7" },
    players: makePlayers("HIMATIKA", [
      { name: "Ponsianus Nyoman Indrawan", nopung: "13", isCaptain: true },
      { name: "Surliyadin", nopung: "11", isCaptain: false },
      { name: "Abraham Wenas", nopung: "2", isCaptain: false },
      { name: "Lutfi Kosasih", nopung: "9", isCaptain: false },
      { name: "Putu Pande", nopung: "1", isCaptain: false },
    ]),
  },
  {
    id: "team-himasta",
    name: "HIMASTA",
    group: "Group B",
    groupId: "grp-b",
    conference: "Eastern Conference",
    logo: "/images/LOGO_1.svg",
    season: "2K26",
    teamStats: { G: "4", W: "2", L: "2", PM: "280", PA: "285", PD: "-5", PTS: "6" },
    players: makePlayers("HIMASTA", [
      { name: "Ikram Fadhil", nopung: "9", isCaptain: true },
      { name: "Restu Dwi Purnomo", nopung: "12", isCaptain: false },
      { name: "Ali Mustofa", nopung: "10", isCaptain: false },
      { name: "Avin Kurniawan", nopung: "7", isCaptain: false },
    ]),
  },
  {
    id: "team-himatekk",
    name: "HIMATEKK",
    group: "Group B",
    groupId: "grp-b",
    conference: "Eastern Conference",
    logo: "/images/LOGO_1.svg",
    season: "2K26",
    teamStats: { G: "4", W: "1", L: "3", PM: "275", PA: "315", PD: "-40", PTS: "5" },
    players: makePlayers("HIMATEKK", [
      { name: "Michael Qualls", nopung: "2", isCaptain: true },
      { name: "Jamarr Johnson", nopung: "1", isCaptain: false },
      { name: "Agam Subastian", nopung: "5", isCaptain: false },
      { name: "Hans Wong", nopung: "11", isCaptain: false },
    ]),
  },
  {
    id: "team-himafi",
    name: "HIMAFI",
    group: "Group B",
    groupId: "grp-b",
    conference: "Eastern Conference",
    logo: "/images/LOGO_1.svg",
    season: "2K26",
    teamStats: { G: "4", W: "0", L: "4", PM: "240", PA: "310", PD: "-70", PTS: "4" },
    players: makePlayers("HIMAFI", [
      { name: "Teddy Apriyana", nopung: "10", isCaptain: true },
      { name: "Danny Ray", nopung: "7", isCaptain: false },
      { name: "Rizky Effendi", nopung: "1", isCaptain: false },
      { name: "Richard Ross", nopung: "23", isCaptain: false },
    ]),
  },
];

// Helper to access and persist teams in browser
function getMockTeams(): Team[] {
  if (typeof window === "undefined") return INITIAL_TEAMS;
  const stored = localStorage.getItem("ibl_mock_teams");
  if (!stored) {
    localStorage.setItem("ibl_mock_teams", JSON.stringify(INITIAL_TEAMS));
    return INITIAL_TEAMS;
  }
  try {
    const parsed = JSON.parse(stored) as Team[];
    if (parsed.some((t) => t.name.includes("Pelita") || t.name.includes("Prawira") || t.name.includes("Bandung") || t.name.includes("Jakarta"))) {
      localStorage.setItem("ibl_mock_teams", JSON.stringify(INITIAL_TEAMS));
      return INITIAL_TEAMS;
    }
    return parsed;
  } catch {
    return INITIAL_TEAMS;
  }
}

function saveMockTeams(teams: Team[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ibl_mock_teams", JSON.stringify(teams));
  }
}

// ---------------------------------------------------------------------------
// 3. MOCK MATCHES & SCORING
// ---------------------------------------------------------------------------
function createDefaultSummary(pts: number): TeamSummary {
  return {
    points: pts,
    fieldGoalsMade: Math.floor(pts / 2),
    fieldGoalsAttempted: Math.floor(pts / 1.2),
    fieldGoalPercentage: 45,
    twoPointMade: Math.floor(pts / 3),
    twoPointAttempted: Math.floor(pts / 2),
    twoPointPercentage: 50,
    threePointMade: Math.floor(pts / 6),
    threePointAttempted: Math.floor(pts / 3),
    threePointPercentage: 33,
    freeThrowsMade: Math.floor(pts / 8),
    freeThrowsAttempted: Math.floor(pts / 6),
    freeThrowPercentage: 70,
    reboundOff: 10,
    reboundDef: 24,
    rebounds: 34,
    assist: 18,
    foul: 12,
  };
}

const INITIAL_MATCHES: MatchListItem[] = [
  {
    id: "match-101",
    season: "2K26",
    matchNumber: 1,
    stage: "GROUP",
    group: { id: "grp-a", name: "Group A" },
    playoffRound: null,
    bracketPosition: null,
    status: "FINISHED",
    locked: true,
    scheduledAt: "2026-09-01T15:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: "2026-09-01T15:05:00+07:00",
    finishedAt: "2026-09-01T16:50:00+07:00",
    resultFile: null,
    team1: {
      id: "team-hmtc",
      name: "HMTC",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#F4631E",
      score: 82,
    },
    team2: {
      id: "team-himasisfo",
      name: "HIMASISFO",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#1E3A8A",
      score: 76,
    },
    winnerTeamId: "team-hmtc",
  },
  {
    id: "match-102",
    season: "2K26",
    matchNumber: 2,
    stage: "GROUP",
    group: { id: "grp-a", name: "Group A" },
    playoffRound: null,
    bracketPosition: null,
    status: "LIVE",
    locked: false,
    scheduledAt: "2026-09-02T16:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: "2026-09-02T16:05:00+07:00",
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-hmm",
      name: "HMM",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#0F766E",
      score: 45,
    },
    team2: {
      id: "team-hme",
      name: "HME",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#B45309",
      score: 42,
    },
    winnerTeamId: null,
  },
  {
    id: "match-103",
    season: "2K26",
    matchNumber: 3,
    stage: "GROUP",
    group: { id: "grp-b", name: "Group B" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-03T14:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-hmti",
      name: "HMTI",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#991B1B",
      score: 0,
    },
    team2: {
      id: "team-himatika",
      name: "HIMATIKA",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#166534",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-104",
    season: "2K26",
    matchNumber: 4,
    stage: "GROUP",
    group: { id: "grp-b", name: "Group B" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-03T16:30:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-himasta",
      name: "HIMASTA",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#4338CA",
      score: 0,
    },
    team2: {
      id: "team-himatekk",
      name: "HIMATEKK",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#854D0E",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-105",
    season: "2K26",
    matchNumber: 5,
    stage: "GROUP",
    group: { id: "grp-b", name: "Group B" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-04T15:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-himafi",
      name: "HIMAFI",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#0284C7",
      score: 0,
    },
    team2: {
      id: "team-hmti",
      name: "HMTI",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#991B1B",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-106",
    season: "2K26",
    matchNumber: 6,
    stage: "GROUP",
    group: { id: "grp-a", name: "Group A" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-04T18:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-hms",
      name: "HMS",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#7C3AED",
      score: 0,
    },
    team2: {
      id: "team-hmtc",
      name: "HMTC",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#F4631E",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-107",
    season: "2K26",
    matchNumber: 7,
    stage: "GROUP",
    group: { id: "grp-a", name: "Group A" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-05T14:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-himasisfo",
      name: "HIMASISFO",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#1E3A8A",
      score: 0,
    },
    team2: {
      id: "team-hmm",
      name: "HMM",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#0F766E",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-108",
    season: "2K26",
    matchNumber: 8,
    stage: "GROUP",
    group: { id: "grp-b", name: "Group B" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-05T16:30:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-himatika",
      name: "HIMATIKA",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#166534",
      score: 0,
    },
    team2: {
      id: "team-himasta",
      name: "HIMASTA",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#4338CA",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-109",
    season: "2K26",
    matchNumber: 9,
    stage: "GROUP",
    group: { id: "grp-a", name: "Group A" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-05T19:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-hme",
      name: "HME",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#B45309",
      score: 0,
    },
    team2: {
      id: "team-hms",
      name: "HMS",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#7C3AED",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-110",
    season: "2K26",
    matchNumber: 10,
    stage: "GROUP",
    group: { id: "grp-b", name: "Group B" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-06T14:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-himatekk",
      name: "HIMATEKK",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#854D0E",
      score: 0,
    },
    team2: {
      id: "team-himafi",
      name: "HIMAFI",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#0284C7",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-111",
    season: "2K26",
    matchNumber: 11,
    stage: "GROUP",
    group: { id: "grp-a", name: "Group A" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-06T17:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-hmtc",
      name: "HMTC",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#F4631E",
      score: 0,
    },
    team2: {
      id: "team-hme",
      name: "HME",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#B45309",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-112",
    season: "2K26",
    matchNumber: 12,
    stage: "GROUP",
    group: { id: "grp-a", name: "Group A" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-07T15:30:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-himasisfo",
      name: "HIMASISFO",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#1E3A8A",
      score: 0,
    },
    team2: {
      id: "team-hms",
      name: "HMS",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#7C3AED",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-113",
    season: "2K26",
    matchNumber: 13,
    stage: "GROUP",
    group: { id: "grp-b", name: "Group B" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-08T15:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-hmti",
      name: "HMTI",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#991B1B",
      score: 0,
    },
    team2: {
      id: "team-himatekk",
      name: "HIMATEKK",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#854D0E",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-114",
    season: "2K26",
    matchNumber: 14,
    stage: "GROUP",
    group: { id: "grp-a", name: "Group A" },
    playoffRound: null,
    bracketPosition: null,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-08T18:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-hmm",
      name: "HMM",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#0F766E",
      score: 0,
    },
    team2: {
      id: "team-hmtc",
      name: "HMTC",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#F4631E",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-115",
    season: "2K26",
    matchNumber: 15,
    stage: "PLAYOFF",
    group: null,
    playoffRound: "SEMIFINAL",
    bracketPosition: 1,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-09T16:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-hmtc",
      name: "HMTC",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#F4631E",
      score: 0,
    },
    team2: {
      id: "team-hmm",
      name: "HMM",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#0F766E",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-116",
    season: "2K26",
    matchNumber: 16,
    stage: "PLAYOFF",
    group: null,
    playoffRound: "SEMIFINAL",
    bracketPosition: 2,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-10T16:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-hmti",
      name: "HMTI",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#991B1B",
      score: 0,
    },
    team2: {
      id: "team-himatika",
      name: "HIMATIKA",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#166534",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-117",
    season: "2K26",
    matchNumber: 17,
    stage: "PLAYOFF",
    group: null,
    playoffRound: "THIRD_PLACE",
    bracketPosition: 1,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-11T15:00:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-hmm",
      name: "HMM",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#0F766E",
      score: 0,
    },
    team2: {
      id: "team-himatika",
      name: "HIMATIKA",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#166534",
      score: 0,
    },
    winnerTeamId: null,
  },
  {
    id: "match-118",
    season: "2K26",
    matchNumber: 18,
    stage: "PLAYOFF",
    group: null,
    playoffRound: "FINAL",
    bracketPosition: 1,
    status: "SCHEDULED",
    locked: false,
    scheduledAt: "2026-09-11T18:30:00+07:00",
    venue: "GOR Pertamina ITS",
    startedAt: null,
    finishedAt: null,
    resultFile: null,
    team1: {
      id: "team-hmtc",
      name: "HMTC",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#F4631E",
      score: 0,
    },
    team2: {
      id: "team-hmti",
      name: "HMTI",
      logo: "/images/LOGO_1.svg",
      placeholder: null,
      color: "#991B1B",
      score: 0,
    },
    winnerTeamId: null,
  },
];

function getMockMatches(): MatchListItem[] {
  if (typeof window === "undefined") return INITIAL_MATCHES;
  const stored = localStorage.getItem("ibl_mock_matches");
  if (!stored) {
    localStorage.setItem("ibl_mock_matches", JSON.stringify(INITIAL_MATCHES));
    return INITIAL_MATCHES;
  }
  try {
    const parsed = JSON.parse(stored) as MatchListItem[];
    if (
      parsed.length < INITIAL_MATCHES.length ||
      parsed.some((m) => m.team1.name?.includes("Pelita") || m.team2.name?.includes("Prawira") || m.team1.name?.includes("Bandung") || m.team1.name?.includes("Jakarta"))
    ) {
      localStorage.setItem("ibl_mock_matches", JSON.stringify(INITIAL_MATCHES));
      return INITIAL_MATCHES;
    }
    return parsed;
  } catch {
    return INITIAL_MATCHES;
  }
}

function saveMockMatches(matches: MatchListItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ibl_mock_matches", JSON.stringify(matches));
  }
}

function makeMockSnapshot(match: MatchListItem): MatchSnapshot {
  const teams = getMockTeams();
  const t1 = teams.find((t) => t.id === match.team1.id) || teams[0];
  const t2 = teams.find((t) => t.id === match.team2.id) || teams[1];

  const isStarted = match.status !== "SCHEDULED";

  const quarters: QuarterState[] = isStarted
    ? [
        { quarter: 1, locked: true, lockedAt: "2026-09-01T15:25:00+07:00" },
        { quarter: 2, locked: true, lockedAt: "2026-09-01T15:50:00+07:00" },
        { quarter: 3, locked: match.status === "FINISHED", lockedAt: match.status === "FINISHED" ? "2026-09-01T16:15:00+07:00" : null },
        { quarter: 4, locked: match.status === "FINISHED", lockedAt: match.status === "FINISHED" ? "2026-09-01T16:45:00+07:00" : null },
      ]
    : [];

  const mapPlayerLine = (p: TeamPlayer, scoreFactor: number) => ({
    id: p.id,
    name: p.name,
    nopung: p.nopung,
    isCaptain: p.isCaptain,
    points: isStarted ? Math.round(Number(p.stats.ppg) * scoreFactor) : 0,
    twoPointMade: isStarted ? 3 : 0,
    twoPointMiss: isStarted ? 2 : 0,
    threePointMade: isStarted ? 1 : 0,
    threePointMiss: isStarted ? 2 : 0,
    assist: isStarted ? 3 : 0,
    freethrowMade: isStarted ? 2 : 0,
    freethrowMiss: isStarted ? 1 : 0,
    reboundOff: isStarted ? 1 : 0,
    reboundDef: isStarted ? 3 : 0,
    foul: isStarted ? 2 : 0,
  });

  return {
    id: match.id,
    season: match.season,
    matchNumber: match.matchNumber,
    stage: match.stage,
    group: match.group,
    playoffRound: match.playoffRound,
    status: match.status,
    currentQuarter: isStarted ? (match.status === "FINISHED" ? null : 3) : null,
    quarters,
    locked: match.locked,
    lockedAt: match.status === "FINISHED" ? "2026-09-01T16:50:00+07:00" : null,
    scheduledAt: match.scheduledAt,
    venue: match.venue,
    startedAt: match.startedAt,
    finishedAt: match.finishedAt,
    resultFile: match.resultFile,
    team1: {
      ...match.team1,
      quarterScores: isStarted ? [22, 18, 20, 22] : [0, 0, 0, 0],
      summary: createDefaultSummary(isStarted ? (match.team1.score || 82) : 0),
      players: t1.players.map((p) => mapPlayerLine(p, 1)),
    },
    team2: {
      ...match.team2,
      quarterScores: isStarted ? [19, 21, 16, 20] : [0, 0, 0, 0],
      summary: createDefaultSummary(isStarted ? (match.team2.score || 76) : 0),
      players: t2.players.map((p) => mapPlayerLine(p, 0.9)),
    },
  };
}

// ---------------------------------------------------------------------------
// 4. MOCK SCORING BOARD
// ---------------------------------------------------------------------------
function getMockScoringBoard(): ScoringBoard {
  const matches = getMockMatches();
  const toScoringItem = (m: MatchListItem): ScoringBoardItem => ({
    ...m,
    scoring: {
      holder: m.status === "LIVE" ? { id: MOCK_USER.id, name: MOCK_USER.name } : null,
      isMine: m.status === "LIVE",
      leaseExpiresAt: m.status === "LIVE" ? new Date(Date.now() + 600000).toISOString() : null,
      lockedAt: m.status === "FINISHED" ? "2026-09-01T16:50:00+07:00" : null,
      lockedBy: m.status === "FINISHED" ? { id: MOCK_USER.id, name: MOCK_USER.name } : null,
      currentQuarter: m.status === "FINISHED" ? null : m.status === "LIVE" ? 3 : 1,
      quarters: [
        { quarter: 1, locked: true, lockedAt: "2026-09-01T15:25:00+07:00", lockedBy: { id: MOCK_USER.id, name: MOCK_USER.name } },
        { quarter: 2, locked: true, lockedAt: "2026-09-01T15:50:00+07:00", lockedBy: { id: MOCK_USER.id, name: MOCK_USER.name } },
        { quarter: 3, locked: m.status === "FINISHED", lockedAt: null, lockedBy: null },
        { quarter: 4, locked: m.status === "FINISHED", lockedAt: null, lockedBy: null },
      ],
    },
  });

  return {
    opened: matches.filter((m) => m.status === "LIVE" || m.status === "FINISHED").map(toScoringItem),
    available: matches.filter((m) => m.status === "SCHEDULED").map(toScoringItem),
    session: { ttlSeconds: 300, heartbeatSeconds: 15 },
  };
}

// ---------------------------------------------------------------------------
// 5. MOCK STANDINGS & PLAYOFFS
// ---------------------------------------------------------------------------
export function getMockStandings(): Standings {
  const teams = getMockTeams();
  const groupATeams = teams.filter((t) => t.groupId === "grp-a");
  const groupBTeams = teams.filter((t) => t.groupId === "grp-b");

  const toRow = (t: Team, rank: number) => ({
    rank,
    team: { id: t.id, name: t.name, logo: t.logo },
    group: { id: t.groupId ?? "grp-a", name: t.group ?? "Group A" },
    G: Number(t.teamStats.G) || 4,
    W: Number(t.teamStats.W) || 2,
    L: Number(t.teamStats.L) || 2,
    PM: Number(t.teamStats.PM) || 300,
    PA: Number(t.teamStats.PA) || 300,
    PD: Number(t.teamStats.PD) || 0,
    PTS: Number(t.teamStats.PTS) || 6,
  });

  return {
    season: "2K26",
    conferences: [
      {
        id: "conf-west",
        name: "Western Conference",
        groups: [{ id: "grp-a", name: "Group A", standings: groupATeams.map((t, idx) => toRow(t, idx + 1)) }],
        standings: groupATeams.map((t, idx) => toRow(t, idx + 1)),
      },
      {
        id: "conf-east",
        name: "Eastern Conference",
        groups: [{ id: "grp-b", name: "Group B", standings: groupBTeams.map((t, idx) => toRow(t, idx + 1)) }],
        standings: groupBTeams.map((t, idx) => toRow(t, idx + 1)),
      },
    ],
  };
}

export function getMockPlayoffs(): Playoffs {
  const teams = getMockTeams();
  return {
    season: "2K26",
    rounds: [
      {
        round: "SEMIFINAL",
        label: "Semifinal",
        slots: [
          {
            position: 1,
            side: "LEFT",
            match: {
              id: "sf-match-1",
              season: "2K26",
              matchNumber: 10,
              stage: "PLAYOFF",
              group: null,
              playoffRound: "SEMIFINAL",
              bracketPosition: 1,
              status: "FINISHED",
              locked: true,
              scheduledAt: "2026-09-08T15:00:00+07:00",
              venue: "GOR Pertamina ITS",
              startedAt: "2026-09-08T15:00:00+07:00",
              finishedAt: "2026-09-08T16:45:00+07:00",
              resultFile: null,
              winnerTeamId: teams[0]?.id ?? null,
              team1: {
                id: teams[0]?.id ?? null,
                name: teams[0]?.name ?? "HMTC",
                logo: teams[0]?.logo ?? null,
                placeholder: null,
                color: "#F4631E",
                score: 85,
                seed: 1,
              },
              team2: {
                id: teams[2]?.id ?? null,
                name: teams[2]?.name ?? "HMM",
                logo: teams[2]?.logo ?? null,
                placeholder: null,
                color: "#0F766E",
                score: 78,
                seed: 2,
              },
            },
          },
          {
            position: 2,
            side: "RIGHT",
            match: {
              id: "sf-match-2",
              season: "2K26",
              matchNumber: 11,
              stage: "PLAYOFF",
              group: null,
              playoffRound: "SEMIFINAL",
              bracketPosition: 2,
              status: "FINISHED",
              locked: true,
              scheduledAt: "2026-09-08T17:00:00+07:00",
              venue: "GOR Pertamina ITS",
              startedAt: "2026-09-08T17:00:00+07:00",
              finishedAt: "2026-09-08T18:45:00+07:00",
              resultFile: null,
              winnerTeamId: teams[5]?.id ?? null,
              team1: {
                id: teams[5]?.id ?? null,
                name: teams[5]?.name ?? "HMTI",
                logo: teams[5]?.logo ?? null,
                placeholder: null,
                color: "#991B1B",
                score: 89,
                seed: 1,
              },
              team2: {
                id: teams[6]?.id ?? null,
                name: teams[6]?.name ?? "HIMATIKA",
                logo: teams[6]?.logo ?? null,
                placeholder: null,
                color: "#166534",
                score: 81,
                seed: 2,
              },
            },
          },
        ],
      },
      {
        round: "FINAL",
        label: "Final",
        slots: [
          {
            position: 1,
            side: "CENTER",
            match: {
              id: "final-match-1",
              season: "2K26",
              matchNumber: 12,
              stage: "PLAYOFF",
              playoffRound: "FINAL",
              bracketPosition: 1,
              group: null,
              status: "SCHEDULED",
              locked: false,
              scheduledAt: "2026-09-10T19:00:00+07:00",
              venue: "GOR Pertamina ITS",
              startedAt: null,
              finishedAt: null,
              resultFile: null,
              winnerTeamId: null,
              team1: {
                id: teams[0]?.id ?? null,
                name: teams[0]?.name ?? "HMTC",
                logo: teams[0]?.logo ?? null,
                placeholder: null,
                color: "#F4631E",
                score: 0,
                seed: 1,
              },
              team2: {
                id: teams[5]?.id ?? null,
                name: teams[5]?.name ?? "HMTI",
                logo: teams[5]?.logo ?? null,
                placeholder: null,
                color: "#991B1B",
                score: 0,
                seed: 1,
              },
            },
          },
        ],
      },
      {
        round: "THIRD_PLACE",
        label: "Perebutan Juara 3",
        slots: [
          {
            position: 1,
            side: "CENTER",
            match: {
              id: "third-match-1",
              season: "2K26",
              matchNumber: 13,
              stage: "PLAYOFF",
              playoffRound: "THIRD_PLACE",
              bracketPosition: 1,
              group: null,
              status: "SCHEDULED",
              locked: false,
              scheduledAt: "2026-09-10T16:00:00+07:00",
              venue: "GOR Pertamina ITS",
              startedAt: null,
              finishedAt: null,
              resultFile: null,
              winnerTeamId: null,
              team1: {
                id: teams[2]?.id ?? null,
                name: teams[2]?.name ?? "HMM",
                logo: teams[2]?.logo ?? null,
                placeholder: null,
                color: "#0F766E",
                score: 0,
                seed: 2,
              },
              team2: {
                id: teams[6]?.id ?? null,
                name: teams[6]?.name ?? "HIMATIKA",
                logo: teams[6]?.logo ?? null,
                placeholder: null,
                color: "#166534",
                score: 0,
                seed: 2,
              },
            },
          },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 6. MAIN MOCK ROUTE DISPATCHER
// ---------------------------------------------------------------------------
export async function handleMockApi<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const cleanPath = path.split("?")[0];

  // Auth endpoints
  if (cleanPath === "/auth/login" || cleanPath === "/auth/refresh") {
    return {
      user: MOCK_USER,
      accessToken: "mock-jwt-token-ibl-2k26",
      expiresIn: 3600,
    } as unknown as T;
  }

  if (cleanPath === "/auth/logout") {
    return null as unknown as T;
  }

  // Groups
  if (cleanPath === "/groups" && method === "GET") {
    return MOCK_GROUPS as unknown as T;
  }

  // Standings & Playoffs
  if (cleanPath === "/standings" && method === "GET") {
    return getMockStandings() as unknown as T;
  }

  if (cleanPath === "/playoffs" && method === "GET") {
    return getMockPlayoffs() as unknown as T;
  }

  // Scoring Board
  if (cleanPath === "/scoring/matches" && method === "GET") {
    return getMockScoringBoard() as unknown as T;
  }

  // Matches endpoints
  if (cleanPath === "/matches" && method === "GET") {
    return getMockMatches() as unknown as T;
  }

  if (cleanPath.startsWith("/matches/") && method === "GET") {
    const id = cleanPath.replace("/matches/", "");
    const matches = getMockMatches();
    const match = matches.find((m) => m.id === id) || matches[0];
    return makeMockSnapshot(match) as unknown as T;
  }

  if (cleanPath.startsWith("/matches/") && cleanPath.endsWith("/scoring/session")) {
    if (method === "PUT") {
      return {
        holder: { id: MOCK_USER.id, name: MOCK_USER.name },
        leaseExpiresAt: new Date(Date.now() + 600000).toISOString(),
        ttlSeconds: 300,
        heartbeatSeconds: 15,
      } as unknown as T;
    }
    if (method === "DELETE") {
      return { released: true } as unknown as T;
    }
  }

  if (cleanPath.startsWith("/matches/") && cleanPath.endsWith("/actions") && method === "POST") {
    return {
      actionId: "mock-act-" + Date.now(),
      team1Score: 48,
      team2Score: 44,
      playerPoints: 12,
    } as unknown as T;
  }

  if (cleanPath.startsWith("/matches/") && cleanPath.endsWith("/lock") && method === "POST") {
    return {
      quarter: 3,
      locked: true,
      currentQuarter: 4,
      isFinal: false,
      matchFinished: false,
      quarters: [
        { quarter: 1, locked: true, lockedAt: "2026-09-01T15:25:00+07:00" },
        { quarter: 2, locked: true, lockedAt: "2026-09-01T15:50:00+07:00" },
        { quarter: 3, locked: true, lockedAt: new Date().toISOString() },
        { quarter: 4, locked: false, lockedAt: null },
      ],
    } as unknown as T;
  }

  // Teams endpoints
  if (cleanPath === "/teams" && method === "GET") {
    return getMockTeams() as unknown as T;
  }

  if (cleanPath === "/teams" && method === "POST") {
    const body = options.body as { name: string; group?: string; players?: Array<{ name: string; nopung: string; isCaptain?: boolean }> };
    const teams = getMockTeams();
    const newId = `team-${Date.now()}`;
    const newTeam: Team = {
      id: newId,
      name: body?.name || "Tim Baru",
      group: body?.group || "Group A",
      groupId: body?.group === "Group B" ? "grp-b" : "grp-a",
      conference: body?.group === "Group B" ? "Eastern Conference" : "Western Conference",
      logo: "/images/LOGO_1.svg",
      season: "2K26",
      teamStats: { G: "0", W: "0", L: "0", PM: "0", PA: "0", PD: "0", PTS: "0" },
      players: (body?.players || []).map((p, idx) => ({
        id: `ply-${newId}-${idx + 1}`,
        name: p.name,
        nopung: p.nopung,
        isCaptain: !!p.isCaptain,
        stats: createPlayerStats(),
      })),
    };
    teams.push(newTeam);
    saveMockTeams(teams);
    return { team: { id: newTeam.id, name: newTeam.name } } as unknown as T;
  }

  if (cleanPath === "/teams/import" && method === "POST") {
    const body = options.body as { teams: Array<{ name: string; group?: string; players: Array<{ name: string; jerseyNumber: string; isCaptain?: boolean }> }> };
    const existing = getMockTeams();
    const importedTeams = body.teams || [];
    let createdCount = 0;
    for (const item of importedTeams) {
      const newId = `team-${Date.now()}-${createdCount}`;
      existing.push({
        id: newId,
        name: item.name,
        group: item.group || "Group A",
        groupId: item.group === "Group B" ? "grp-b" : "grp-a",
        conference: item.group === "Group B" ? "Eastern Conference" : "Western Conference",
        logo: "/images/LOGO_1.svg",
        season: "2K26",
        teamStats: { G: "0", W: "0", L: "0", PM: "0", PA: "0", PD: "0", PTS: "0" },
        players: (item.players || []).map((p, idx) => ({
          id: `ply-${newId}-${idx + 1}`,
          name: p.name,
          nopung: p.jerseyNumber,
          isCaptain: !!p.isCaptain,
          stats: createPlayerStats(),
        })),
      });
      createdCount++;
    }
    saveMockTeams(existing);
    return { createdTeams: createdCount, updatedTeams: 0, createdPlayers: createdCount * 12 } as unknown as T;
  }

  // Single team by ID or name
  if (cleanPath.startsWith("/teams/")) {
    const param = decodeURIComponent(cleanPath.replace("/teams/", "").split("/")[0]);
    const teams = getMockTeams();
    const found = teams.find((t) => t.id === param || t.name.toLowerCase() === param.toLowerCase()) || teams[0];

    if (cleanPath.endsWith("/roster") && method === "PUT") {
      const body = options.body as { players: Array<{ id?: string; name: string; jerseyNumber: string; isCaptain: boolean }> };
      found.players = body.players.map((p, idx) => ({
        id: p.id || `ply-${found.id}-${idx + 1}`,
        name: p.name,
        nopung: p.jerseyNumber,
        isCaptain: p.isCaptain,
        stats: createPlayerStats(),
      }));
      saveMockTeams(teams);
      return found as unknown as T;
    }

    if (cleanPath.endsWith("/logo") && method === "PUT") {
      found.logo = "/images/LOGO_1.svg";
      saveMockTeams(teams);
      return { logo: found.logo, width: 200, height: 200, byteSize: 10240 } as unknown as T;
    }

    if (method === "PATCH") {
      const body = options.body as { name?: string; group?: string };
      if (body.name) found.name = body.name;
      if (body.group) {
        found.group = body.group;
        found.groupId = body.group === "Group B" ? "grp-b" : "grp-a";
        found.conference = body.group === "Group B" ? "Eastern Conference" : "Western Conference";
      }
      saveMockTeams(teams);
      return found as unknown as T;
    }

    if (method === "DELETE") {
      const filtered = teams.filter((t) => t.id !== found.id);
      saveMockTeams(filtered);
      return { message: "Tim berhasil dihapus (Mock)" } as unknown as T;
    }

    return found as unknown as T;
  }

  // Fallback generic response
  return {} as T;
}
