import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/apiClient";
import { classify, newActionId } from "@/lib/hooks/useAutoSaveActions";

const apiError = (status: number, code = "X") => new ApiError(status, code, "msg");

describe("classify", () => {
  it.each([
    ["network error (status 0)", apiError(0, "NETWORK_ERROR"), "retry"],
    ["rate limit", apiError(429), "retry"],
    ["server error", apiError(503), "retry"],
    ["unknown non-API error", new TypeError("boom"), "retry"],
    ["expired login", apiError(401), "session"],
    ["invalid tap", apiError(400), "drop"],
    ["unprocessable tap", apiError(422), "drop"],
    ["session taken by another laptop", apiError(409, "SCORING_SESSION_REQUIRED"), "conflict"],
    ["forbidden", apiError(403), "conflict"],
  ])("%s → %s", (_label, error, expected) => {
    expect(classify(error)).toBe(expected);
  });
});

describe("newActionId", () => {
  const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  it("returns unique v4 UUIDs", () => {
    const ids = new Set(Array.from({ length: 500 }, newActionId));
    expect(ids.size).toBe(500);
    for (const id of ids) expect(id).toMatch(UUID_V4);
  });

  it("falls back to getRandomValues when randomUUID is unavailable (plain HTTP)", () => {
    const original = crypto.randomUUID;
    Object.defineProperty(crypto, "randomUUID", { value: undefined, configurable: true });
    try {
      expect(newActionId()).toMatch(UUID_V4);
    } finally {
      Object.defineProperty(crypto, "randomUUID", { value: original, configurable: true });
    }
  });
});
