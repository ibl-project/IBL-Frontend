<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Overview: IBL 2K26

**IBL** stands for **ITS Basketball League**, which is an annual basketball tournament hosted by the student basketball club (**UKM Basket**) at the **Institut Teknologi Sepuluh Nopember (ITS)**.

This repository contains the frontend web application for the **IBL 2K26** edition: the landing page, event information, the registration portal, and the committee dashboard. The REST API lives in the separate **IBL-Backend** repository.

---

## Committee Dashboard & Backend API

`/login` and the dashboard (`app/(dashboard)/`: Teams, Schedule Result, Scoring) use the IBL-Backend API. Its endpoint contract is the Bruno collection in the **IBL-apidocs** repository (runnable requests + Docs tabs); its setup guide is `SETUP.md` in IBL-Backend.

- Base URL: `NEXT_PUBLIC_API_URL`. Local dev reads `NEXT_PUBLIC_API_URL` from the untracked `.env.local` (template `.env.local.example`; the URL values are shared privately by the team, never committed). `NEXT_PUBLIC_BACKEND_URL` (registration form, Google Apps Script) is unused since the form closed on 10 Jul 2026; leave it commented out. Frontend developers always point it at the staging (testing) or production API and never run the backend locally. Vercel uses its dashboard values. The `http://localhost:4000/api` fallback in `lib/apiClient.ts` exists only for backend developers.
- Call the API only through `lib/apiClient.ts` (`apiFetch`: bearer token, shared refresh on 401, raw file upload), `lib/teamsApi.ts`, and `lib/matchesApi.ts`. Never call `fetch` directly. Never put tokens in `localStorage` or `sessionStorage`: the access token stays in memory and the refresh token is an httpOnly cookie.
- Live match data: `lib/hooks/useMatchLive.ts` (snapshot + SSE). Scoring writes: `lib/hooks/useScoringSession.ts` (one account per match, 30 s heartbeat) and `lib/hooks/useAutoSaveActions.ts` (one UUID `actionId` per tap, retried with the same id).
- Offline scoring: taps and Save and Lock of a period that is not the last open one go through a per-account, per-match queue in localStorage (`lib/scoringOutbox.ts`). The queue is retried without limit and replayed on top of every server snapshot (`replayOutbox` in `lib/matchSnapshot.ts`). After a connection drop, the queue reaches the server before the session is reclaimed, so a session taken over by another laptop stops the queue (conflict panel) instead of being double-counted. Locking the last open period, Reset, Unlock, and jersey colors need a connection. Reloading while offline is not supported (no service worker).
- Scoring is per period: Quarter 1–4, then OT1, OT2, … (periods 5–10) when the score is tied. Only the active period (the lowest one that is not locked) can be scored, reset, or locked; every tap sends its `quarter`. Save and Lock is per period: locking the last period finishes the match (or opens the next OT on a tie), and Unlock reopens one period for correction (status stays FINISHED). The Total tab (read-only) is the sum of all periods and is what standings and Teams use. Details: Docs of the `Scoring` folder in IBL-apidocs.
- Times are shown in WIB through `lib/datetime.ts`; send ISO strings with `+07:00`.
- Role checks such as `canEditData` only hide controls. The API is the real guard.
- User-facing text is Indonesian.

---

## Code Style

- Comments, docblocks, identifiers and commit messages are in English (Conventional Commits). User-facing text stays Indonesian. Translate old Indonesian comments when you touch a file.
- Components: `export function Name(props: NameProps)` with named exports. Default exports only where Next.js requires them (`page.tsx`, `layout.tsx`, `route.ts`).
- Formatting is Prettier (`npm run format`); CI fails on `npm run format:check`.
- Keep components under about 300 lines (ESLint `max-lines` warns): move state into hooks and split subcomponents. Pure logic goes in `lib/` with a Vitest test next to it.
- No `any`: use `unknown` and narrow it.

---

## iOS WKWebView & In-App Browser Compatibility

To ensure the web app works inside restricted environments like the Google Search App on iOS (WKWebView), adhere to the following rules:

- **Viewport Initialization (Race Conditions):** iOS WebViews often have delayed viewport initialization and may report `window.innerWidth` as `0` initially. Use `document.documentElement.clientWidth` as a fallback, and execute resize listeners with slight timeouts (e.g., 100ms, 500ms) during hydration to ensure the scale ratio is accurately captured.
- **Hidden File Inputs (Programmatic Clicks):** iOS WebKit blocks programmatic `.click()` actions on file inputs that are removed from the render tree via `display: none` (Tailwind `hidden`). Always use `className="absolute pointer-events-none opacity-0 w-px h-px"` to visually hide file inputs while keeping them strictly accessible to WebKit's interaction policies.
- **Strict Z-Index Values:** Do not use invalid Tailwind utility classes (e.g., `z-100` instead of `z-[100]`). WKWebView's strict GPU stacking context rules require exact z-indexes to prevent touch events from bleeding through modal overlays or loading screens.
- **IndexedDB Hang Prevention:** In private browsing or restricted WebViews, `indexedDB.open` can hang indefinitely without triggering success or error callbacks. Always wrap IndexedDB connection promises in a hard timeout (e.g., `1000ms`) and provide a graceful fallback to in-memory state.

---

## Development & Verification Rules

- **No Browser Checking:** DO NOT use `browser_subagent` or browser tools to inspect, test, or verify changes. The user will check and test all UI and interactive changes directly themselves. Validate code using static type checking (`npx tsc --noEmit`) or linting when necessary, then complete the turn immediately.
