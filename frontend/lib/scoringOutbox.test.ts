import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  countOutboxByMatch,
  deleteOutboxItem,
  hasOutbox,
  loadOutbox,
  nextSeq,
  saveOutboxItem,
  type OutboxLock,
  type OutboxTap,
} from "@/lib/scoringOutbox";

const tap = (seq: number, overrides: Partial<OutboxTap> = {}): OutboxTap => ({
  kind: "tap",
  seq,
  actionId: `action-${seq}`,
  playerId: "p1",
  teamId: "t1",
  quarter: 1,
  actionType: "twoPointMade",
  delta: 1,
  createdAt: "2026-11-19T10:00:00+07:00",
  ...overrides,
});

const lock = (seq: number, quarter = 1): OutboxLock => ({
  kind: "lock",
  seq,
  quarter,
  createdAt: "2026-11-19T10:00:00+07:00",
});

/** In-memory Storage, so the test does not depend on the runtime's localStorage (Node 26 ships its own). */
class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
}

beforeEach(() => {
  vi.stubGlobal("localStorage", new MemoryStorage());
});

describe("nextSeq", () => {
  it("is strictly increasing even within the same millisecond", () => {
    const seqs = Array.from({ length: 1000 }, () => nextSeq());
    for (let index = 1; index < seqs.length; index += 1) expect(seqs[index]).toBeGreaterThan(seqs[index - 1]);
  });
});

describe("save / load / delete", () => {
  it("loads items sorted by seq regardless of insertion order", () => {
    saveOutboxItem("u1", "m1", tap(30));
    saveOutboxItem("u1", "m1", lock(20));
    saveOutboxItem("u1", "m1", tap(10));
    expect(loadOutbox("u1", "m1").map((item) => item.seq)).toEqual([10, 20, 30]);
  });

  it("round-trips the full item", () => {
    const item = tap(1, { delta: -1, actionType: "foul", quarter: 5 });
    saveOutboxItem("u1", "m1", item);
    expect(loadOutbox("u1", "m1")).toEqual([item]);
  });

  it("deletes a single item by seq", () => {
    saveOutboxItem("u1", "m1", tap(1));
    saveOutboxItem("u1", "m1", tap(2));
    deleteOutboxItem("u1", "m1", 1);
    expect(loadOutbox("u1", "m1").map((item) => item.seq)).toEqual([2]);
  });

  it("saving the same seq twice keeps one entry (retries do not duplicate)", () => {
    saveOutboxItem("u1", "m1", tap(1));
    saveOutboxItem("u1", "m1", tap(1));
    expect(loadOutbox("u1", "m1")).toHaveLength(1);
  });
});

describe("isolation", () => {
  it("never returns another account's or another match's items", () => {
    saveOutboxItem("u1", "m1", tap(1));
    saveOutboxItem("u2", "m1", tap(2));
    saveOutboxItem("u1", "m2", tap(3));
    expect(loadOutbox("u1", "m1").map((item) => item.seq)).toEqual([1]);
    expect(hasOutbox("u2", "m2")).toBe(false);
  });

  it("does not match a user id that is a prefix of another", () => {
    saveOutboxItem("u10", "m1", tap(1));
    expect(loadOutbox("u1", "m1")).toEqual([]);
  });
});

describe("corrupt or foreign data", () => {
  it("skips invalid JSON and objects that are not outbox items", () => {
    saveOutboxItem("u1", "m1", tap(1));
    localStorage.setItem("ibl-scoring-outbox:v1:u1:m1:2", "{not json");
    localStorage.setItem("ibl-scoring-outbox:v1:u1:m1:3", JSON.stringify({ kind: "other", seq: 3, quarter: 1 }));
    localStorage.setItem("unrelated-key", JSON.stringify(tap(4)));
    expect(loadOutbox("u1", "m1").map((item) => item.seq)).toEqual([1]);
  });
});

describe("countOutboxByMatch", () => {
  it("counts pending items per match for one account", () => {
    saveOutboxItem("u1", "m1", tap(1));
    saveOutboxItem("u1", "m1", lock(2));
    saveOutboxItem("u1", "m2", tap(3));
    saveOutboxItem("u2", "m1", tap(4));
    expect(countOutboxByMatch("u1")).toEqual({ m1: 2, m2: 1 });
  });
});

describe("blocked or full storage", () => {
  it("reports failure instead of throwing when setItem throws", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    expect(saveOutboxItem("u1", "m1", tap(1))).toBe(false);
  });

  it("returns an empty queue instead of throwing when storage is blocked", () => {
    vi.stubGlobal("localStorage", undefined);
    expect(loadOutbox("u1", "m1")).toEqual([]);
    expect(countOutboxByMatch("u1")).toEqual({});
  });
});
