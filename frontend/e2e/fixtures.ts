import type { Page, Route } from "@playwright/test";
import type { MatchSide, MatchSnapshot, PlayerLine, ResultFile, TeamSummary } from "@/lib/matchesApi";
import { FAKE_API_URL } from "../playwright.config";

export const MATCH_ID = "11111111-2222-4333-8444-555555555555";
export const DETAIL_URL = `/schedule-result-main/detail-game?id=${MATCH_ID}`;

/** Isi PDF palsu untuk file hasil yang diunggah admin. Cukup header PDF; isinya tidak dirender di test. */
export const ADMIN_PDF_BYTES = "%PDF-1.4\n% admin upload\n%%EOF\n";

const FAKE_API_ORIGIN = new URL(FAKE_API_URL).origin;

const summary: TeamSummary = {
  points: 0,
  fieldGoalsMade: 0,
  fieldGoalsAttempted: 0,
  fieldGoalPercentage: 0,
  twoPointMade: 0,
  twoPointAttempted: 0,
  twoPointPercentage: 0,
  threePointMade: 0,
  threePointAttempted: 0,
  threePointPercentage: 0,
  freeThrowsMade: 0,
  freeThrowsAttempted: 0,
  freeThrowPercentage: 0,
  reboundOff: 0,
  reboundDef: 0,
  rebounds: 0,
  assist: 0,
  foul: 0,
};

function player(id: string, name: string, nopung: string, twoPointMade: number): PlayerLine {
  return {
    id,
    name,
    nopung,
    isCaptain: false,
    points: twoPointMade * 2,
    twoPointMade,
    twoPointMiss: 1,
    threePointMade: 0,
    threePointMiss: 0,
    assist: 1,
    freethrowMade: 0,
    freethrowMiss: 0,
    reboundOff: 0,
    reboundDef: 2,
    foul: 1,
  };
}

function side(id: string, name: string, color: string, scores: number[], players: PlayerLine[]): MatchSide {
  const score = scores.reduce((a, b) => a + b, 0);
  return {
    id,
    name,
    logo: null,
    placeholder: null,
    color,
    score,
    quarterScores: scores,
    summary: { ...summary, points: score },
    players,
  };
}

/** Match FINISHED dan terkunci: halaman tidak membuka SSE dan tidak refresh live, jadi test stabil. */
export function finishedMatch(overrides: Partial<MatchSnapshot> = {}): MatchSnapshot {
  return {
    id: MATCH_ID,
    season: "2026",
    matchNumber: 7,
    stage: "GROUP",
    group: { id: "g1", name: "Group A" },
    playoffRound: null,
    status: "FINISHED",
    liveNow: false,
    currentQuarter: null,
    quarters: [1, 2, 3, 4].map((quarter) => ({ quarter, locked: true, lockedAt: "2026-11-10T12:00:00+07:00" })),
    locked: true,
    lockedAt: "2026-11-10T12:00:00+07:00",
    scheduledAt: "2026-11-10T10:00:00+07:00",
    venue: "GOR ITS",
    startedAt: "2026-11-10T10:05:00+07:00",
    finishedAt: "2026-11-10T11:40:00+07:00",
    resultFile: null,
    team1: side("t1", "Elektro", "#074770", [10, 12, 8, 14], [player("p1", "Andi", "4", 5), player("p2", "Budi", "7", 3)]),
    team2: side("t2", "Sipil", "#760807", [9, 11, 10, 7], [player("p3", "Cahya", "10", 4), player("p4", "Dodi", "12", 2)]),
    ...overrides,
  };
}

export const adminResultFile: ResultFile = {
  name: "hasil-elektro-sipil.pdf",
  byteSize: ADMIN_PDF_BYTES.length,
  url: `/api/matches/${MATCH_ID}/result-file?v=abc123`,
  uploadedAt: "2026-11-10T12:30:00+07:00",
};

const cors = (route: Route) => ({
  "Access-Control-Allow-Origin": route.request().headers()["origin"] ?? "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

/**
 * Cegat semua request ke API palsu. GET /matches/:id mengembalikan `match`,
 * GET /matches/:id/result-file mengembalikan PDF admin, sisanya 404 (mis. refresh sesi).
 */
export async function mockApi(page: Page, match: MatchSnapshot): Promise<void> {
  await page.context().route(`${FAKE_API_ORIGIN}/**`, async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const headers = cors(route);

    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers });

    if (pathname === `/api/matches/${MATCH_ID}`) {
      return route.fulfill({ status: 200, headers, json: { success: true, data: match } });
    }
    if (pathname === `/api/matches/${MATCH_ID}/result-file` && match.resultFile) {
      return route.fulfill({
        status: 200,
        headers: { ...headers, "Content-Disposition": `attachment; filename="${match.resultFile.name}"` },
        contentType: "application/pdf",
        body: ADMIN_PDF_BYTES,
      });
    }
    return route.fulfill({
      status: 404,
      headers,
      json: { success: false, error: { code: "NOT_FOUND", message: "Tidak ditemukan (mock e2e)" } },
    });
  });
}

/** Simulasikan popup blocker: window.open selalu mengembalikan null. */
export async function blockPopups(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.open = () => null;
  });
}

/** Baca isi URL blob dari dalam halaman yang membuatnya (blob hanya bisa dibaca dari origin yang sama). */
export async function readBlobText(page: Page, url: string): Promise<string> {
  return page.evaluate(async (blobUrl) => (await fetch(blobUrl)).text(), url);
}
