// ponytail: mock data — swap ke apiFetch saat endpoint standings & bracket ready di backend

export interface TeamStat {
  name: string;
  gp: number;  // Games Played
  w: number;   // Wins
  l: number;   // Losses
  pm: number;  // +/- (plus minus poin)
  pa: number;  // Points Against
  pd: number;  // Point Difference
  pts: number; // Points (2*W + L)
}

export interface Group {
  name: string; // "Group A", "Group B", ...
  teams: TeamStat[];
}

export interface Conference {
  label: string;  // "Conference I", "Conference II"
  groups: Group[];
  /** Conference II: overall standing — semua tim dalam 1 tabel */
  isOverall?: boolean;
}

export interface BracketMatch {
  id: string;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
}

export interface BracketRound {
  label: string;
  matches: BracketMatch[];
}

// ---------------------------------------------------------------------------
// Conference data
// ---------------------------------------------------------------------------

const makeTeam = (name: string, gp: number, w: number, l: number, pa: number, pd: number): TeamStat => ({
  name,
  gp,
  w,
  l,
  pm: w - l,
  pa,
  pd,
  pts: w * 2 + l,
});

export const CONFERENCES: Conference[] = [
  {
    label: "Conference 1",
    groups: [
      {
        name: "GROUP A",
        teams: [
          makeTeam("ITS Basket A", 3, 3, 0, 210, 45),
          makeTeam("Politeknik Surabaya", 3, 2, 1, 195, 20),
          makeTeam("UNAIR Reds", 3, 1, 2, 180, -15),
          makeTeam("UBAYA Warriors", 3, 0, 3, 155, -50),
        ],
      },
      {
        name: "GROUP B",
        teams: [
          makeTeam("UPN Veteran", 3, 3, 0, 225, 60),
          makeTeam("Petra Stars", 3, 2, 1, 198, 22),
          makeTeam("UK Widya Mandala", 3, 1, 2, 175, -18),
          makeTeam("STIA Surabaya", 3, 0, 3, 148, -64),
        ],
      },
      {
        name: "GROUP C",
        teams: [
          makeTeam("ITS Basket B", 3, 3, 0, 218, 55),
          makeTeam("UNESA Eagles", 3, 2, 1, 200, 28),
          makeTeam("ITATS Falcons", 3, 1, 2, 178, -20),
          makeTeam("STIESIA Bucks", 3, 0, 3, 150, -63),
        ],
      },
      {
        name: "GROUP D",
        teams: [
          makeTeam("ITS Basket C", 3, 3, 0, 230, 65),
          makeTeam("UM Surabaya", 3, 2, 1, 205, 30),
          makeTeam("UNTAG Bears", 3, 1, 2, 182, -25),
          makeTeam("STIE Perbanas", 3, 0, 3, 145, -70),
        ],
      },
    ],
  },
  {
    label: "Conference 2",
    groups: [
      {
        name: "GROUP A",
        teams: [
          makeTeam("UBAYA Phoenix", 3, 3, 0, 220, 50),
          makeTeam("UNESA Knights", 3, 2, 1, 205, 25),
          makeTeam("UPN Thunder", 3, 1, 2, 185, -10),
          makeTeam("ITS Basket D", 3, 0, 3, 160, -45),
        ],
      },
      {
        name: "GROUP B",
        teams: [
          makeTeam("Petra Lions", 3, 3, 0, 235, 70),
          makeTeam("UNAIR Hawks", 3, 2, 1, 200, 30),
          makeTeam("ITATS Tigers", 3, 1, 2, 170, -25),
          makeTeam("STIESIA Wolves", 3, 0, 3, 140, -75),
        ],
      },
      {
        name: "GROUP C",
        teams: [
          makeTeam("Politeknik B", 3, 3, 0, 215, 48),
          makeTeam("UM Surabaya B", 3, 2, 1, 195, 20),
          makeTeam("UKWM Sharks", 3, 1, 2, 172, -22),
          makeTeam("STIA Surabaya B", 3, 0, 3, 145, -66),
        ],
      },
      {
        name: "GROUP D",
        teams: [
          makeTeam("UNTAG Vipers", 3, 3, 0, 228, 62),
          makeTeam("STIE Perbanas B", 3, 2, 1, 198, 22),
          makeTeam("ITS Basket E", 3, 1, 2, 180, -20),
          makeTeam("UNAIR Cobalt", 3, 0, 3, 150, -64),
        ],
      },
    ],
  },
];

// Helper to get 16-team overall standings sorted by pts, pd, pa
export function getStandings(conference: Conference): TeamStat[] {
  const allTeams: TeamStat[] = [];
  conference.groups.forEach((g) => {
    allTeams.push(...g.teams);
  });
  return allTeams.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.pd !== a.pd) return b.pd - a.pd;
    return b.pa - a.pa;
  });
}

export interface PlayoffMatchTeam {
  name: string;
  seed: number;
  score?: number;
  winner?: boolean;
}

export interface PlayoffDuel {
  id: string;
  teamA: PlayoffMatchTeam;
  teamB: PlayoffMatchTeam;
}

export interface PlayoffTournamentData {
  left: {
    r16: PlayoffDuel[];
    qf: PlayoffDuel[];
    sf: PlayoffDuel;
  };
  right: {
    r16: PlayoffDuel[];
    qf: PlayoffDuel[];
    sf: PlayoffDuel;
  };
  final: PlayoffDuel;
  thirdPlace: PlayoffDuel;
}

export const PLAYOFF_TOURNAMENT_DATA: PlayoffTournamentData = {
  left: {
    r16: [
      {
        id: "L-R16-1",
        teamA: { name: "ITS Basket A", seed: 1, score: 82, winner: true },
        teamB: { name: "UBAYA Warriors", seed: 8, score: 61 },
      },
      {
        id: "L-R16-2",
        teamA: { name: "Politeknik Sby", seed: 4, score: 75, winner: true },
        teamB: { name: "UNAIR Reds", seed: 5, score: 68 },
      },
      {
        id: "L-R16-3",
        teamA: { name: "UPN Veteran", seed: 2, score: 88, winner: true },
        teamB: { name: "UK Widya Mandala", seed: 7, score: 65 },
      },
      {
        id: "L-R16-4",
        teamA: { name: "Petra Stars", seed: 3, score: 74, winner: true },
        teamB: { name: "STIA Surabaya", seed: 6, score: 60 },
      },
    ],
    qf: [
      {
        id: "L-QF-1",
        teamA: { name: "ITS Basket A", seed: 1, score: 78, winner: true },
        teamB: { name: "Politeknik Sby", seed: 4, score: 70 },
      },
      {
        id: "L-QF-2",
        teamA: { name: "UPN Veteran", seed: 2, score: 81, winner: true },
        teamB: { name: "Petra Stars", seed: 3, score: 75 },
      },
    ],
    sf: {
      id: "L-SF-1",
      teamA: { name: "ITS Basket A", seed: 1, score: 84, winner: true },
      teamB: { name: "UPN Veteran", seed: 2, score: 79 },
    },
  },
  right: {
    r16: [
      {
        id: "R-R16-1",
        teamA: { name: "UBAYA Phoenix", seed: 1, score: 85, winner: true },
        teamB: { name: "STIESIA Wolves", seed: 8, score: 58 },
      },
      {
        id: "R-R16-2",
        teamA: { name: "UNESA Knights", seed: 4, score: 72, winner: true },
        teamB: { name: "ITATS Tigers", seed: 5, score: 66 },
      },
      {
        id: "R-R16-3",
        teamA: { name: "Petra Lions", seed: 2, score: 86, winner: true },
        teamB: { name: "ITS Basket D", seed: 7, score: 62 },
      },
      {
        id: "R-R16-4",
        teamA: { name: "UNAIR Hawks", seed: 3, score: 77, winner: true },
        teamB: { name: "UPN Thunder", seed: 6, score: 70 },
      },
    ],
    qf: [
      {
        id: "R-QF-1",
        teamA: { name: "UBAYA Phoenix", seed: 1, score: 80, winner: true },
        teamB: { name: "UNESA Knights", seed: 4, score: 73 },
      },
      {
        id: "R-QF-2",
        teamA: { name: "Petra Lions", seed: 2, score: 83, winner: true },
        teamB: { name: "UNAIR Hawks", seed: 3, score: 76 },
      },
    ],
    sf: {
      id: "R-SF-1",
      teamA: { name: "UBAYA Phoenix", seed: 1, score: 86, winner: true },
      teamB: { name: "Petra Lions", seed: 2, score: 82 },
    },
  },
  final: {
    id: "FINAL",
    teamA: { name: "ITS Basket A", seed: 1, score: 88, winner: true },
    teamB: { name: "UBAYA Phoenix", seed: 1, score: 85 },
  },
  thirdPlace: {
    id: "3RD-PLACE",
    teamA: { name: "UPN Veteran", seed: 2, score: 79, winner: true },
    teamB: { name: "Petra Lions", seed: 2, score: 74 },
  },
};

export const PLAYOFF_ROUNDS: BracketRound[] = [
  {
    label: "Round of 16",
    matches: [
      { id: "r16-1", teamA: "ITS Basket A", teamB: "UBAYA Warriors", scoreA: 82, scoreB: 61 },
      { id: "r16-2", teamA: "Politeknik Sby", teamB: "UNAIR Reds", scoreA: 75, scoreB: 68 },
      { id: "r16-3", teamA: "UPN Veteran", teamB: "UK Widya Mandala", scoreA: 88, scoreB: 65 },
      { id: "r16-4", teamA: "Petra Stars", teamB: "STIA Surabaya", scoreA: 74, scoreB: 60 },
      { id: "r16-5", teamA: "UBAYA Phoenix", teamB: "STIESIA Wolves", scoreA: 85, scoreB: 58 },
      { id: "r16-6", teamA: "UNESA Knights", teamB: "ITATS Tigers", scoreA: 72, scoreB: 66 },
      { id: "r16-7", teamA: "Petra Lions", teamB: "ITS Basket D", scoreA: 86, scoreB: 62 },
      { id: "r16-8", teamA: "UNAIR Hawks", teamB: "UPN Thunder", scoreA: 77, scoreB: 70 },
    ],
  },
  {
    label: "Quarter-final",
    matches: [
      { id: "qf1", teamA: "ITS Basket A", teamB: "Politeknik Sby", scoreA: 78, scoreB: 70 },
      { id: "qf2", teamA: "UPN Veteran", teamB: "Petra Stars", scoreA: 81, scoreB: 75 },
      { id: "qf3", teamA: "UBAYA Phoenix", teamB: "UNESA Knights", scoreA: 80, scoreB: 73 },
      { id: "qf4", teamA: "Petra Lions", teamB: "UNAIR Hawks", scoreA: 83, scoreB: 76 },
    ],
  },
  {
    label: "Semi-final",
    matches: [
      { id: "sf1", teamA: "ITS Basket A", teamB: "UPN Veteran", scoreA: 84, scoreB: 79 },
      { id: "sf2", teamA: "UBAYA Phoenix", teamB: "Petra Lions", scoreA: 86, scoreB: 82 },
    ],
  },
  {
    label: "Final",
    matches: [
      { id: "f1", teamA: "ITS Basket A", teamB: "UBAYA Phoenix", scoreA: 88, scoreB: 85 },
    ],
  },
];
