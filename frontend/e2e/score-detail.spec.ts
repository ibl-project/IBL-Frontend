import { expect, test } from "@playwright/test";
import {
  ADMIN_PDF_BYTES,
  DETAIL_URL,
  adminResultFile,
  blockPopups,
  finishedMatch,
  mockApi,
  readBlobText,
} from "./fixtures";

/**
 * Integrasi tombol "Score Detail" di halaman detail pertandingan publik:
 * halaman sungguhan (next dev) + render PDF sungguhan (html-to-image + jsPDF), API dipalsukan.
 */

const scoreDetailButton = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Score Detail" });

test.describe("Score Detail", () => {
  test("tanpa PDF admin: membuka tab loading lalu PDF box score yang dibuat dari data match", async ({ page }) => {
    await mockApi(page, finishedMatch());
    await page.goto(DETAIL_URL);

    const button = scoreDetailButton(page);
    await expect(button).toBeEnabled();

    const [popup] = await Promise.all([page.waitForEvent("popup"), button.click()]);

    // Tab loading bertema muncul dulu, dengan nama kedua tim
    await expect(popup).toHaveTitle("Score Detail · Elektro vs Sipil");
    await expect(popup.locator("h1")).toHaveText("Score Detail");

    // Lalu berpindah ke PDF hasil generate
    await popup.waitForURL(/^blob:/, { timeout: 30_000 });
    const pdf = await readBlobText(page, popup.url());
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

    const [popup] = await Promise.all([page.waitForEvent("popup"), scoreDetailButton(page).click()]);
    await popup.waitForURL(/^blob:/);

    expect(await readBlobText(page, popup.url())).toBe(ADMIN_PDF_BYTES);
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

    const [popup] = await Promise.all([page.waitForEvent("popup"), scoreDetailButton(page).click()]);
    await popup.waitForURL(/^blob:/, { timeout: 30_000 });

    const pdf = await readBlobText(page, popup.url());
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
    const [popup] = await Promise.all([page.waitForEvent("popup"), link.click()]);
    expect(popup.url()).toBe(href);
    await expect(link).toBeHidden();
  });

  test("nama tim berisi HTML tampil sebagai teks di tab loading, bukan markup", async ({ page }) => {
    const match = finishedMatch();
    match.team1.name = "<img src=x onerror=alert(1)>";
    await mockApi(page, match);
    await page.goto(DETAIL_URL);

    let dialogShown = false;
    page.context().on("page", (p) => p.on("dialog", (d) => ((dialogShown = true), d.dismiss())));

    const [popup] = await Promise.all([page.waitForEvent("popup"), scoreDetailButton(page).click()]);
    await expect(popup).toHaveTitle("Score Detail · <img src=x onerror=alert(1)> vs Sipil");
    await expect(popup.locator(".teams b").first()).toHaveText("<img src=x onerror=alert(1)>");
    await popup.waitForURL(/^blob:/, { timeout: 30_000 });
    expect(dialogShown).toBe(false);
  });

  test("klik dua kali cepat hanya membuka satu tab", async ({ page }) => {
    await mockApi(page, finishedMatch());
    await page.goto(DETAIL_URL);

    const popups: unknown[] = [];
    page.on("popup", (p) => popups.push(p));

    const button = scoreDetailButton(page);
    await button.click();
    await button.click({ force: true }).catch(() => {});

    await expect(button).toHaveText("Score Detail", { timeout: 30_000 });
    expect(popups).toHaveLength(1);
  });
});
