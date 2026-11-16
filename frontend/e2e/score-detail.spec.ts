import { type Page, expect, test } from "@playwright/test";
import {
  ADMIN_PDF_BYTES,
  DETAIL_URL,
  MATCH_ID,
  SCORE_DETAIL_URL,
  adminResultFile,
  finishedMatch,
  mockApi,
  nextDownload,
  pdfFrom,
} from "./fixtures";

/**
 * Integrasi "Score Detail": tombol di halaman detail game membuka halaman /schedule-result-main/score-detail,
 * dan halaman itu yang membuat PDF (di tab yang sedang dilihat, jadi tidak dibekukan browser HP).
 * Halaman sungguhan (next dev) + render PDF sungguhan (html-to-image + jsPDF), API dipalsukan.
 */

// Dicari lewat title: tetap sama walau tampilannya berubah
const scoreDetailLink = (page: Page) => page.getByRole("link").and(page.getByTitle("Buka Lembar Skor di Tab Baru"));

// Next.js juga punya elemen role="alert" sendiri (route announcer, kosong), jadi ambil yang berisi teks
const statusAlert = (page: Page) => page.getByRole("alert").filter({ hasText: /\S/ });

/** Cek PDF hasil generate: header PDF, satu halaman ("Total"), gambar JPEG. */
function expectGeneratedPdf(pdf: string) {
  expect(pdf.startsWith("%PDF-")).toBe(true);
  expect(pdf.match(/\/Type \/Page\b/g)).toHaveLength(1);
  expect(pdf).toContain("/DCTDecode");
}

/** 500 dengan header CORS lengkap, supaya yang diuji benar-benar error HTTP, bukan error CORS. */
const serverError = (route: import("@playwright/test").Route) =>
  route.fulfill({
    status: 500,
    headers: { "Access-Control-Allow-Origin": route.request().headers()["origin"] ?? "*" },
    json: { success: false, error: { code: "INTERNAL", message: "error (mock e2e)" } },
  });

test.describe("Score Detail", () => {
  test("tombol membuka halaman Score Detail di tab baru, lalu halaman itu menampilkan PDF", async ({ page }) => {
    await mockApi(page, finishedMatch());
    await page.goto(DETAIL_URL);

    const downloaded = nextDownload(page);
    const [tab] = await Promise.all([page.waitForEvent("popup"), scoreDetailLink(page).click()]);
    await expect(tab).toHaveURL(new RegExp(`/schedule-result-main/score-detail\\?id=${MATCH_ID}$`));

    const { url, text } = await pdfFrom(downloaded);
    expect(url).toMatch(/^blob:/);
    expectGeneratedPdf(text);
  });

  test("dibuka langsung di tab yang sama (in-app browser, reload) tetap membuat PDF", async ({ page }) => {
    await mockApi(page, finishedMatch());
    const downloaded = nextDownload(page);
    await page.goto(SCORE_DETAIL_URL);

    expectGeneratedPdf((await pdfFrom(downloaded)).text);
  });

  test("selama PDF disiapkan: judul, nama tim (sebagai teks biasa), dan progress", async ({ page }) => {
    const match = finishedMatch();
    match.team1.name = "<img src=x onerror=alert(1)>";
    await mockApi(page, match);
    // Tahan pembuatan PDF (fonts.ready tidak pernah selesai) agar tampilan loading bisa diperiksa
    await page.addInitScript(() => {
      Object.defineProperty(document.fonts, "ready", { get: () => new Promise(() => {}) });
    });
    let dialogShown = false;
    page.on("dialog", (dialog) => {
      dialogShown = true;
      void dialog.dismiss();
    });

    await page.goto(SCORE_DETAIL_URL);

    await expect(page).toHaveTitle("Score Detail | IBL 2K26");
    await expect(page.getByRole("heading", { name: "Score Detail" })).toBeVisible();
    // .first(): nama tim juga ada di lembar PDF offscreen; yang pertama adalah strip "A VS B" yang terlihat
    await expect(page.getByText("<img src=x onerror=alert(1)>", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Sipil", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Menyiapkan box score" })).toBeVisible();
    expect(dialogShown).toBe(false);
  });

  test("dengan PDF admin: menampilkan file yang diunggah admin, bukan PDF hasil generate", async ({ page }) => {
    await mockApi(page, finishedMatch({ resultFile: adminResultFile }));
    const downloaded = nextDownload(page);
    await page.goto(SCORE_DETAIL_URL);

    expect((await pdfFrom(downloaded)).text).toBe(ADMIN_PDF_BYTES);
  });

  test("PDF admin gagal diambil: beralih ke PDF hasil generate", async ({ page }) => {
    await mockApi(page, finishedMatch({ resultFile: adminResultFile }));
    // Didaftarkan setelah mockApi sehingga didahulukan
    await page.context().route("**/result-file**", serverError);
    const downloaded = nextDownload(page);
    await page.goto(SCORE_DETAIL_URL);

    expectGeneratedPdf((await pdfFrom(downloaded)).text);
  });

  test("match tidak ditemukan: pesan jelas dan link ke jadwal", async ({ page }) => {
    await mockApi(page, finishedMatch());
    await page.goto("/schedule-result-main/score-detail?id=99999999-2222-4333-8444-555555555555");

    await expect(statusAlert(page)).toContainText("Pertandingan tidak ditemukan.");
    await expect(page.getByRole("link", { name: "Ke jadwal" })).toHaveAttribute("href", "/schedule-result-main");
  });

  test("API error: pesan + 'Coba lagi' yang berhasil setelah API pulih", async ({ page }) => {
    await mockApi(page, finishedMatch());
    let failing = true;
    await page.context().route(`**/api/matches/${MATCH_ID}`, (route) =>
      failing ? serverError(route) : route.fallback(),
    );
    await page.goto(SCORE_DETAIL_URL);

    await expect(statusAlert(page)).toContainText("Gagal memuat data pertandingan.");
    await expect(page.getByRole("link", { name: "Kembali" })).toHaveAttribute("href", `/schedule-result-main/detail-game?id=${MATCH_ID}`);

    failing = false;
    const downloaded = nextDownload(page);
    await page.getByRole("button", { name: "Coba lagi" }).click();
    expectGeneratedPdf((await pdfFrom(downloaded)).text);
  });

  test("double-click hanya membuka satu tab", async ({ page }) => {
    await mockApi(page, finishedMatch());
    await page.goto(DETAIL_URL);

    const tabs: Page[] = [];
    page.on("popup", (tab) => tabs.push(tab));

    await scoreDetailLink(page).dblclick();
    await expect.poll(() => tabs.length).toBeGreaterThan(0);
    // Beri waktu tab kedua (kalau ada) untuk muncul sebelum menghitung
    await page.waitForTimeout(1_500);
    expect(tabs).toHaveLength(1);
  });
});
