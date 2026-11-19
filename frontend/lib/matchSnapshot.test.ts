import { describe, expect, it } from "vitest";

import { STAT_KEYS, type MatchSide, type MatchSnapshot, type PlayerLine, type StatCounts } from "@/lib/matchesApi";
import { applyLock, applyStep, replayOutbox, withServerLine } from "@/lib/matchSnapshot";
import type { OutboxItem } from "@/lib/scoringOutbox";

const zeroStats = () => Object.fromEntries(STAT_KEYS.map((key) => [key, 0])) as StatCounts;

const player = (id: string, overrides: Partial<PlayerLine> = {}): PlayerLine => ({
  ...zeroStats(),
  id,
  name: id,
  nopung: "0",
  isCaptain: false,
  points: 0,
  quarters: {},
  ...overrides,
});

const side = (id: string, players: PlayerLine[]): MatchSide => ({
  id,
  name: id,
  logo: null,
  placeholder: null,
  color: "#000",
  score: 0,
  quarterScores: [0, 0, 0, 0],
  summary: {} as MatchSide["summary"],
  players,
});

const snapshot = (overrides: Partial<MatchSnapshot> = {}): MatchSnapshot => ({
  id: "m1",
  season: "2026",
  matchNumber: 1,
  stage: "GROUP",
  group: null,
  playoffRound: null,
  status: "LIVE",
  currentQuarter: 1,
  quarters: [1, 2, 3, 4].map((quarter) => ({ quarter, locked: false, lockedAt: null })),
  locked: false,
  lockedAt: null,
  scheduledAt: null,
  venue: null,
  startedAt: null,
  finishedAt: null,
  resultFile: null,
  team1: side("t1", [player("a"), player("b")]),
  team2: side("t2", [player("c")]),
  ...overrides,
});

const tap = (seq: number, playerId: string, teamId: string, overrides: Partial<OutboxItem> = {}): OutboxItem =>
  ({
    kind: "tap",
    seq,
    actionId: `x${seq}`,
    playerId,
    teamId,
    quarter: 1,
    actionType: "twoPointMade",
    delta: 1,
    createdAt: "",
    ...overrides,
  }) as OutboxItem;

describe("applyStep", () => {
  it("adds points to the player, the period and the team total", () => {
    let next = applyStep(snapshot(), 1, "a", "threePointMade", 1, 1);
    next = applyStep(next, 1, "b", "freethrowMade", 1, 2);
    expect(next.team1.players[0].points).toBe(3);
    expect(next.team1.players[0].quarters?.[1]?.threePointMade).toBe(1);
    expect(next.team1.quarterScores).toEqual([3, 1, 0, 0]);
    expect(next.team1.score).toBe(4);
    expect(next.team2.score).toBe(0);
  });

  it("never goes below zero on a minus tap", () => {
    const next = applyStep(snapshot(), 1, "a", "twoPointMade", -1, 1);
    expect(next.team1.players[0].twoPointMade).toBe(0);
    expect(next.team1.score).toBe(0);
  });

  it("plus then minus returns to the original score", () => {
    const start = snapshot();
    const next = applyStep(applyStep(start, 2, "c", "twoPointMade", 1, 1), 2, "c", "twoPointMade", -1, 1);
    expect(next.team2.score).toBe(0);
    expect(next.team2.quarterScores[0]).toBe(0);
  });

  it("extends quarterScores for overtime periods", () => {
    const next = applyStep(snapshot(), 1, "a", "twoPointMade", 1, 5);
    expect(next.team1.quarterScores).toEqual([0, 0, 0, 0, 2]);
  });

  it("does not mutate the input snapshot", () => {
    const start = snapshot();
    const copy = structuredClone(start);
    applyStep(start, 1, "a", "twoPointMade", 1, 1);
    expect(start).toEqual(copy);
  });
});

describe("applyLock", () => {
  it("locks the period and moves currentQuarter to the next open one", () => {
    const next = applyLock(snapshot(), 1);
    expect(next.quarters[0].locked).toBe(true);
    expect(next.quarters[0].lockedAt).not.toBeNull();
    expect(next.currentQuarter).toBe(2);
  });

  it("sets currentQuarter to null when every period is locked", () => {
    const next = [1, 2, 3, 4].reduce(applyLock, snapshot());
    expect(next.currentQuarter).toBeNull();
  });

  it("is a no-op on an already locked period", () => {
    const once = applyLock(snapshot(), 1);
    expect(applyLock(once, 1).quarters[0].lockedAt).toBe(once.quarters[0].lockedAt);
  });
});

describe("replayOutbox", () => {
  it("re-applies queued taps on top of a fresh server snapshot", () => {
    const items = [tap(1, "a", "t1"), tap(2, "c", "t2", { actionType: "threePointMade" })];
    const next = replayOutbox(snapshot(), items, true);
    expect(next.team1.score).toBe(2);
    expect(next.team2.score).toBe(3);
  });

  it("applies locks in order, so taps after a lock land in the next period", () => {
    const items: OutboxItem[] = [
      tap(1, "a", "t1"),
      { kind: "lock", seq: 2, quarter: 1, createdAt: "" },
      tap(3, "a", "t1", { quarter: 2 }),
    ];
    const next = replayOutbox(snapshot(), items, true);
    expect(next.currentQuarter).toBe(2);
    expect(next.team1.quarterScores).toEqual([2, 2, 0, 0]);
  });

  it("with withTaps=false only replays locks (scores already include the taps)", () => {
    const items: OutboxItem[] = [tap(1, "a", "t1"), { kind: "lock", seq: 2, quarter: 1, createdAt: "" }];
    const next = replayOutbox(snapshot(), items, false);
    expect(next.team1.score).toBe(0);
    expect(next.quarters[0].locked).toBe(true);
  });

  it("ignores taps for a team that is not in this match", () => {
    const next = replayOutbox(snapshot(), [tap(1, "a", "other-team")], true);
    expect(next).toEqual(snapshot());
  });

  it("returns the same snapshot for an empty queue", () => {
    const start = snapshot();
    expect(replayOutbox(start, [], true)).toBe(start);
  });
});

describe("withServerLine", () => {
  it("replaces the player line and team scores with the server values", () => {
    const line = player("a", { twoPointMade: 2, points: 4 });
    const next = withServerLine(snapshot(), {
      player: line,
      playerQuarter: { ...zeroStats(), twoPointMade: 2, points: 4, quarter: 1 },
      team1Score: 4,
      team2Score: 0,
      quarterScore: { quarter: 1, team1: 4, team2: 0 },
    } as Parameters<typeof withServerLine>[1]);
    expect(next.team1.players[0].points).toBe(4);
    expect(next.team1.players[0].quarters?.[1]?.points).toBe(4);
    expect(next.team1.score).toBe(4);
    expect(next.team1.quarterScores[0]).toBe(4);
  });

  it("keeps team scores when withScores is false", () => {
    const next = withServerLine(
      snapshot(),
      { player: player("a", { points: 2 }), team1Score: 99 } as Parameters<typeof withServerLine>[1],
      false,
    );
    expect(next.team1.players[0].points).toBe(2);
    expect(next.team1.score).toBe(0);
  });
});
