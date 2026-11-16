import { expect, test } from "@playwright/test";
import {
  ADMIN_PDF_BYTES,
  DETAIL_URL,
  adminResultFile,
  blockPopups,
  finishedMatch,
  mockApi,
  nextDownload,
  pdfFrom,
  readBlobText,
} from "./fixtures";

/**
 * Integrasi tombol "Score Detail" di halaman detail pertandingan publik:
 * halaman sungguhan (next dev) + render PDF sungguhan (html-to-image + jsPDF), API dipalsukan.
 */

// Dicari lewat title, bukan teks: teksnya berubah jadi "Opening PDF..." selama proses.
const scoreDetailButton = (page: import("@playwright/test").Page) =>
  page.getByRole("button").and(page.getByTitle("Buka Lembar Skor di Tab Baru"));

test.describe("Score Detail", () => {
  test("tanpa PDF admin: membuka tab loading lalu PDF box score yang dibuat dari data match", async ({ page }) => {
    await mockApi(page, finishedMatch());
    await page.goto(DETAIL_URL);

    const button = scoreDetailButton(page);
    await expect(button).toBeEnabled();

    const downloaded = nextDownload(page);
    const [popup] = await Promise.all([page.waitForEvent("popup"), button.click()]);

    // Tab loading bertema muncul dulu, dengan nama kedua tim
    await expect(popup).toHaveTitle("Score Detail · Elektro vs Sipil");
    await expect(popup.locator("h1")).toHaveText("Score Detail");

    // Lalu tab itu membuka PDF hasil generate
    const { url, text: pdf } = await pdfFrom(downloaded, page);
    expect(url).toMatch(/^blob:/);
    expect(pdf.startsWith("%PDF-")).toBe(true);
    // Satu lembar ("Total") = satu halaman, gambar disisipkan sebagai JPEG
    expect(pdf.match(/\/Type \/Page\b/g)).toHaveLength(1);
    expect(pdf).toContain("/DCTDecode");

    // Tombol kembali normal setelah selesai
    await expect(button).toBeEnabled();
    await expect(button).toHaveText("Score Detail");
  });

  test("dengan PDF admin: membuka file yang diunggah admin, bukan PDF hasil generate", async ({ page }) => {
    await mockApi(page, finishedMatch({ resultFile: adminResultFile }));
    await page.goto(DETAIL_URL);

    const downloaded = nextDownload(page);
    await scoreDetailButton(page).click();

    expect((await pdfFrom(downloaded, page)).text).toBe(ADMIN_PDF_BYTES);
  });

  test("PDF admin gagal diambil: beralih ke PDF hasil generate", async ({ page }) => {
    await mockApi(page, finishedMatch({ resultFile: adminResultFile }));
    // Didaftarkan setelah mockApi sehingga didahulukan: endpoint file hasil error 500.
    // Header CORS harus lengkap (origin + credentials), kalau tidak yang diuji malah error CORS, bukan 500.
    await page.context().route("**/result-file**", (route) =>
      route.fulfill({
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": route.request().headers()["origin"] ?? "*",
          "Access-Control-Allow-Credentials": "true",
        },
        body: "error",
      }),
    );
    await page.goto(DETAIL_URL);

    const downloaded = nextDownload(page);
    await scoreDetailButton(page).click();

    const { text: pdf } = await pdfFrom(downloaded, page);
    expect(pdf.startsWith("%PDF-")).toBe(true);
    expect(pdf).not.toBe(ADMIN_PDF_BYTES);
  });

  test("popup diblokir: menampilkan link 'Buka PDF' yang membuka PDF saat diklik", async ({ page }) => {
    await blockPopups(page);
    await mockApi(page, finishedMatch());
    await page.goto(DETAIL_URL);

    await scoreDetailButton(page).click();

    const link = page.getByRole("link", { name: /Buka PDF/ });
    await expect(link).toBeVisible({ timeout: 30_000 });
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^blob:/);
    expect((await readBlobText(page, href!)).startsWith("%PDF-")).toBe(true);

    // Klik link membuka tab baru (target=_blank) dan link hilang
    // Listener dipasang sebelum klik: tab baru langsung mengunduh PDF begitu terbuka
    const downloaded = nextDownload(page);
    await link.click();
    expect((await downloaded).url()).toBe(href);
    await expect(link).toBeHidden();
  });

  test("nama tim berisi HTML tampil sebagai teks di tab loading, bukan markup", async ({ page }) => {
    const match = finishedMatch();
    match.team1.name = "<img src=x onerror=alert(1)>";
    await mockApi(page, match);
    await page.goto(DETAIL_URL);

    let dialogShown = false;
    page.context().on("page", (p) => p.on("dialog", (d) => ((dialogShown = true), d.dismiss())));

    const downloaded = nextDownload(page);
    const [popup] = await Promise.all([page.waitForEvent("popup"), scoreDetailButton(page).click()]);
    await expect(popup).toHaveTitle("Score Detail · <img src=x onerror=alert(1)> vs Sipil");
    await expect(popup.locator(".teams b").first()).toHaveText("<img src=x onerror=alert(1)>");
    await pdfFrom(downloaded, page);
    expect(dialogShown).toBe(false);
  });

  test("double-click hanya membuka satu tab", async ({ page }) => {
    await mockApi(page, finishedMatch());
    await page.goto(DETAIL_URL);

    const popups: import("@playwright/test").Page[] = [];
    page.on("popup", (p) => popups.push(p));

    // Double-click sungguhan: dua klik dalam satu gerakan, seperti user yang tidak sabar
    const button = scoreDetailButton(page);
    await button.dblclick();

    // Tunggu tab pertama muncul dan proses selesai (tombol kembali normal), baru hitung tab
    await expect.poll(() => popups.length).toBeGreaterThan(0);
    await expect(button).toHaveText("Score Detail", { timeout: 30_000 });
    expect(popups).toHaveLength(1);
  });
});
