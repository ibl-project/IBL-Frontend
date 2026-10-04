import { type AuthUser, useAuthStore } from "@/lib/store/useAuthStore";

/**
 * =============================================================================
 * KLIEN API BACKEND IBL 2K26 (IBL-Backend, Fastify)
 * =============================================================================
 * Semua komunikasi ke backend lewat file ini. Kontrak endpoint lengkap ada di
 * IBL-Backend/docs/API.md.
 *
 * Cara kerja sesi login:
 * - Access token (JWT, berlaku 15 menit) hanya disimpan di MEMORI modul ini,
 *   tidak di localStorage atau cookie biasa, supaya tidak bisa dicuri script
 *   lewat celah XSS.
 * - Refresh token disimpan backend sebagai cookie httpOnly. Setelah halaman
 *   di-reload (memori hilang), sesi dipulihkan lewat POST /auth/refresh.
 * - Semua request memakai `credentials: "include"` supaya cookie itu ikut.
 *
 * Yang menentukan seseorang boleh masuk dashboard adalah backend, bukan
 * frontend: data tim/skor hanya diberikan untuk access token yang sah.
 * =============================================================================
 */

function resolveApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:4000/api";
  console.error("NEXT_PUBLIC_API_URL belum diatur. Isi di environment variable deployment.");
  return "/api";
}

export const API_URL = resolveApiUrl();

// "http://localhost:4000/api" -> "http://localhost:4000"
const API_ORIGIN = API_URL.replace(/\/api$/, "");

/**
 * Path aset dari backend (mis. logo "/api/teams/<id>/logo?v=...") menjadi URL
 * lengkap ke host API. Aset frontend ("/images/...") dikembalikan apa adanya.
 */
export function assetUrl(path: string): string {
  return path.startsWith("/api/") ? `${API_ORIGIN}${path}` : path;
}

/** Error dari backend dengan status HTTP dan kode yang sama dengan docs/API.md. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string>;

  constructor(status: number, code: string, message: string, details?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, string> };
}

interface SessionPayload {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}

const NETWORK_ERROR_MESSAGE = "Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.";
const SESSION_EXPIRED_MESSAGE = "Sesi login sudah berakhir. Silakan login lagi.";
// Token diperbarui sedikit sebelum benar-benar kedaluwarsa.
const REFRESH_MARGIN_MS = 30_000;

let accessToken: string | null = null;
let accessTokenExpiresAt = 0;
let refreshInFlight: Promise<AuthUser | null> | null = null;
// Naik setiap login/logout. Hasil refresh yang dimulai sebelum login/logout
// dibuang, supaya respons lama tidak menimpa keadaan yang lebih baru.
let sessionEpoch = 0;

// ---------------------------------------------------------------------------
// Sesi di memori
// ---------------------------------------------------------------------------

function hasFreshToken(): boolean {
  return accessToken !== null && Date.now() < accessTokenExpiresAt - REFRESH_MARGIN_MS;
}

function setSession(payload: SessionPayload) {
  accessToken = payload.accessToken;
  accessTokenExpiresAt = Date.now() + payload.expiresIn * 1000;
  useAuthStore.setState({ status: "authenticated", user: payload.user });
  listenForLogoutInOtherTabs();
}

function clearSession() {
  accessToken = null;
  accessTokenExpiresAt = 0;
  useAuthStore.setState({ status: "unauthenticated", user: null });
}

// Logout di satu tab ikut mengeluarkan tab lain di browser yang sama
// (penting untuk laptop scoring desk yang dipakai bergantian).
let logoutChannel: BroadcastChannel | null = null;

function listenForLogoutInOtherTabs() {
  if (logoutChannel || typeof BroadcastChannel === "undefined") return;
  logoutChannel = new BroadcastChannel("ibl-auth");
  logoutChannel.onmessage = (event) => {
    if (event.data === "logout") {
      sessionEpoch += 1;
      clearSession();
    }
  };
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

async function send(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, { ...init, credentials: "include" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "NETWORK_ERROR", NETWORK_ERROR_MESSAGE);
  }
}

async function parse<T>(res: Response): Promise<T> {
  let body: Envelope<T> | null = null;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    // Respons bukan JSON (mis. halaman error proxy).
  }

  if (res.ok && body?.success) return body.data as T;

  throw new ApiError(
    res.status,
    body?.error?.code ?? "HTTP_ERROR",
    body?.error?.message ?? `Permintaan gagal (HTTP ${res.status})`,
    body?.error?.details,
  );
}

/**
 * Refresh token hanya sah sekali pakai. Kalau dua tab me-refresh bersamaan
 * dengan cookie yang sama, salah satunya ditolak. Web Locks membuat tab kedua
 * menunggu sampai tab pertama selesai, lalu memakai cookie yang sudah baru.
 */
function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  if (typeof navigator === "undefined" || !("locks" in navigator)) return task();

  // Kunci dilepas setelah promise dari callback selesai, yaitu setelah task.
  return new Promise<T>((resolve, reject) => {
    navigator.locks
      .request("ibl-auth-refresh", () => task().then(resolve, reject))
      .catch(reject);
  });
}

/**
 * Minta access token baru dengan cookie refresh. Pemanggilan bersamaan (mis.
 * beberapa komponen sekaligus, atau React Strict Mode) digabung jadi satu.
 * Mengembalikan null kalau tidak ada sesi yang sah.
 */
export function refreshSession(): Promise<AuthUser | null> {
  if (refreshInFlight) return refreshInFlight;

  const epoch = sessionEpoch;
  refreshInFlight = withRefreshLock(async () => {
    const res = await send("/auth/refresh", { method: "POST" });
    const stale = epoch !== sessionEpoch;

    if (res.status === 401 || res.status === 403) {
      if (!stale) clearSession();
      return stale ? useAuthStore.getState().user : null;
    }

    const payload = await parse<SessionPayload>(res);
    if (!stale) setSession(payload);
    return stale ? useAuthStore.getState().user : payload.user;
  }).finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

/**
 * Pastikan sesi login masih sah. Dipakai saat halaman dashboard/login dibuka.
 * Tidak pernah melempar error: server mati dianggap belum login.
 */
export async function restoreSession(): Promise<AuthUser | null> {
  if (hasFreshToken()) return useAuthStore.getState().user;
  try {
    return await refreshSession();
  } catch {
    clearSession();
    return null;
  }
}

export async function login(email: string, password: string, rememberMe: boolean): Promise<AuthUser> {
  const res = await send("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, rememberMe }),
  });
  const payload = await parse<SessionPayload>(res);

  sessionEpoch += 1;
  setSession(payload);
  return payload.user;
}

/** Cabut sesi di backend, lalu hapus sesi di semua tab browser ini. */
export async function logout(): Promise<void> {
  // Tunggu refresh yang sedang berjalan: kalau tidak, respons refresh bisa
  // memasang cookie baru SETELAH logout, dan sesi hidup lagi saat reload.
  if (refreshInFlight) await refreshInFlight.catch(() => null);
  try {
    await send("/auth/logout", { method: "POST" });
  } catch {
    // Server tidak terjangkau: sesi lokal tetap dihapus di bawah.
  }
  sessionEpoch += 1;
  clearSession();
  logoutChannel?.postMessage("logout");
}

async function getAccessToken(): Promise<string> {
  if (hasFreshToken() && accessToken) return accessToken;
  await refreshSession();
  if (!accessToken) throw new ApiError(401, "UNAUTHORIZED", SESSION_EXPIRED_MESSAGE);
  return accessToken;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Objek biasa dikirim sebagai JSON; File/Blob dikirim mentah (upload logo). */
  body?: unknown;
  /** false untuk endpoint publik (jadwal, klasemen, live score). Default true. */
  auth?: boolean;
  signal?: AbortSignal;
}

/**
 * Panggil endpoint backend dan kembalikan isi `data`.
 * Melempar ApiError kalau backend membalas `success: false`.
 *
 *   const teams = await apiFetch<Team[]>("/teams", { auth: false });
 *   await apiFetch(`/matches/${id}/start`, { method: "POST" });
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options;
  const isFile = typeof Blob !== "undefined" && body instanceof Blob;

  const run = (token: string | null) => {
    const headers: Record<string, string> = {};
    // Content-Type hanya kalau ada body: backend menolak JSON kosong.
    if (body !== undefined) {
      headers["Content-Type"] = isFile ? body.type || "application/octet-stream" : "application/json";
    }
    if (token) headers.Authorization = `Bearer ${token}`;
    return send(path, {
      method,
      headers,
      body: body === undefined ? undefined : isFile ? body : JSON.stringify(body),
      signal,
    });
  };

  if (!auth) return parse<T>(await run(null));

  let res = await run(await getAccessToken());

  // Token dicabut/kedaluwarsa di tengah jalan: perbarui sekali lalu ulangi.
  if (res.status === 401) {
    const user = await refreshSession().catch(() => null);
    if (!user || !accessToken) {
      clearSession();
      throw new ApiError(401, "UNAUTHORIZED", SESSION_EXPIRED_MESSAGE);
    }
    res = await run(accessToken);
  }

  return parse<T>(res);
}
