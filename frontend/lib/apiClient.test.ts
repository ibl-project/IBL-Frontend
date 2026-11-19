import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// apiClient keeps the session in module state, so each test imports a fresh copy.
type ApiClient = typeof import("@/lib/apiClient");

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const session = (token: string) =>
  json(200, {
    success: true,
    data: {
      accessToken: token,
      expiresIn: 900,
      user: { id: "u1", email: "a@b.c", name: "A", role: "admin", lastLoginAt: null, createdAt: "" },
    },
  });

const ok = (data: unknown) => json(200, { success: true, data });
const unauthorized = () => json(401, { success: false, error: { code: "UNAUTHORIZED", message: "no" } });

let fetchMock: ReturnType<typeof vi.fn>;
let api: ApiClient;

const calls = () => fetchMock.mock.calls.map(([url]) => String(url).replace(/^.*\/api/, ""));
const authHeader = (index: number) =>
  (fetchMock.mock.calls[index][1] as RequestInit & { headers: Record<string, string> }).headers?.Authorization;

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://test.local/api");
  vi.stubGlobal("BroadcastChannel", undefined);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  api = await import("@/lib/apiClient");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("apiFetch", () => {
  it("public requests send no token and unwrap data", async () => {
    fetchMock.mockResolvedValueOnce(ok([1, 2]));
    await expect(api.apiFetch("/teams", { auth: false })).resolves.toEqual([1, 2]);
    expect(authHeader(0)).toBeUndefined();
  });

  it("refreshes first when there is no token, then sends the bearer token", async () => {
    fetchMock.mockResolvedValueOnce(session("t1")).mockResolvedValueOnce(ok("done"));
    await expect(api.apiFetch("/matches")).resolves.toBe("done");
    expect(calls()).toEqual(["/auth/refresh", "/matches"]);
    expect(authHeader(1)).toBe("Bearer t1");
  });

  it("on a mid-session 401, refreshes once and retries with the new token", async () => {
    fetchMock
      .mockResolvedValueOnce(session("old"))
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(session("new"))
      .mockResolvedValueOnce(ok("done"));
    await expect(api.apiFetch("/matches/1/actions", { method: "POST", body: {} })).resolves.toBe("done");
    expect(calls()).toEqual(["/auth/refresh", "/matches/1/actions", "/auth/refresh", "/matches/1/actions"]);
    expect(authHeader(3)).toBe("Bearer new");
  });

  it("throws UNAUTHORIZED and clears the session when the refresh is rejected", async () => {
    const { useAuthStore } = await import("@/lib/store/useAuthStore");
    fetchMock
      .mockResolvedValueOnce(session("old"))
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(unauthorized());
    await expect(api.apiFetch("/matches")).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("concurrent requests share a single refresh", async () => {
    fetchMock.mockImplementation(async (url: string) => (url.endsWith("/auth/refresh") ? session("t1") : ok("done")));
    await Promise.all([api.apiFetch("/a"), api.apiFetch("/b"), api.apiFetch("/c")]);
    expect(calls().filter((path) => path === "/auth/refresh")).toHaveLength(1);
  });

  it("maps a network failure to a retryable ApiError with status 0", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(api.apiFetch("/teams", { auth: false })).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });

  it("maps an error envelope to ApiError with the backend code", async () => {
    fetchMock.mockResolvedValueOnce(
      json(409, { success: false, error: { code: "SCORING_SESSION_REQUIRED", message: "taken" } }),
    );
    await expect(api.apiFetch("/x", { auth: false })).rejects.toMatchObject({
      status: 409,
      code: "SCORING_SESSION_REQUIRED",
    });
  });

  it("handles a non-JSON error page", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<html>Bad gateway</html>", { status: 502 }));
    await expect(api.apiFetch("/x", { auth: false })).rejects.toMatchObject({ status: 502, code: "HTTP_ERROR" });
  });
});

describe("logout", () => {
  it("clears the in-memory token so the next call must refresh", async () => {
    fetchMock
      .mockResolvedValueOnce(session("t1"))
      .mockResolvedValueOnce(ok("done"))
      .mockResolvedValueOnce(ok(null))
      .mockResolvedValueOnce(unauthorized());
    await api.apiFetch("/a");
    await api.logout();
    await expect(api.apiFetch("/b")).rejects.toMatchObject({ status: 401 });
    expect(calls()).toEqual(["/auth/refresh", "/a", "/auth/logout", "/auth/refresh"]);
  });
});
