import { defineConfig, devices } from "@playwright/test";

/**
 * Test integrasi browser (Playwright). Jalankan: `npm run test:e2e`
 * (sekali saja sebelumnya: `npx playwright install chromium`).
 *
 * Backend TIDAK dipakai: semua request ke API_URL palsu di bawah dicegat di test
 * (lihat e2e/fixtures.ts), jadi test tidak butuh staging, login, atau data tertentu.
 */
export const FAKE_API_URL = "http://api.ibl.test/api";
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Engine Safari (WebKit) dengan viewport, touch, dan user agent iPhone. Bukan iOS sungguhan:
    // popup blocker, PDF viewer iOS, dan in-app browser tetap harus dicek di iPhone asli.
    { name: "iphone", use: { ...devices["iPhone 15"] } },
  ],
  webServer: {
    // Port sendiri agar tidak bentrok dengan `npm run dev` yang mungkin sedang jalan di 3000.
    command: `npx next dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Environment variable proses mengalahkan .env.local, jadi dev server memakai API palsu.
    // NEXT_DIST_DIR: folder build terpisah, jadi test tidak bentrok dengan `npm run dev` yang sedang jalan.
    env: { NEXT_PUBLIC_API_URL: FAKE_API_URL, NEXT_DIST_DIR: ".next-e2e" },
  },
});
