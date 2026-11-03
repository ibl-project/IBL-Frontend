export type ArtboardVariant = "desktop" | "mobile";

/** Container widths below this use the mobile (390) artboard. */
export const MOBILE_MAX_WIDTH = 768;

/**
 * Artboard desktop ikut membesar sampai lebar ini (skala 1920/1440 = 1,33), lalu berhenti dan dipusatkan.
 * Di atasnya (mis. browser di-zoom out ekstrem) halaman tidak terus membesar.
 */
export const DESKTOP_MAX_WIDTH = 1920;

export const TEAMS_COLORS = {
  orange: "#EC5D12",
  ivory: "#FDF6DD",
  slate: "#799BA7",
  slateHeader: "#7A9BA8",
  ink: "#2F3C41",
  teal: "#50A28C",
} as const;

export const TEAMS_ASSETS = {
  /** Halftone halaman (layer Figma `image 4` / `image 5`), digenerate oleh tools/teams-bg/generate.mjs. */
  halftone: "/images/teams/halftone.png",
  /** Serat papan (layer Figma `image 2`), digenerate oleh tools/teams-bg/generate.mjs; setengah resolusi. */
  grain: "/images/teams/board-grain.png",
} as const;

/** Rasio tinggi/lebar halftone.png (1622 x 1009). */
export const HALFTONE_ASPECT = 1009 / 1622;

/** Ukuran Figma dalam piksel desain, diukur dari bawah navbar. */
export const ARTBOARD = {
  desktop: {
    width: 1440,
    checker: 103.2,
    // Grup `TEAMS` Figma (684 x 118.39): plat pita bertakik di kedua ujung, sedikit miring.
    title: {
      top: 12,
      groupW: 684,
      height: 118.39,
      plateLeft: 186.41,
      plateTop: 7.2,
      plateW: 308.73,
      plateH: 75.47,
      plateBorder: 3.03,
      plateNotchLeft: 26,
      plateNotchRight: 26,
      plateTilt: -0.5,
      artW: 195,
      artH: 73,
      artTop: 9,
    },
    board: { overlap: 43, minHeight: 660, paddingBottom: 72 },
    bar: {
      offset: 55,
      width: 1125,
      height: 95,
      border: 5.82,
      radius: 28.05,
      innerInsetX: 4.6,
      innerInsetY: 4.5,
      innerRadius: 24.85,
      labelLeft: 25,
      labelTop: 10,
      label: 24.94,
      labelStroke: 1.66,
      stripLeft: 33,
      stripTop: 40,
      stripW: 1048.71,
      stripH: 43.53,
      stripRadius: 6.65,
      // Kolom pencarian (strip abu-abu); placeholder "Himpunan Mahasiswa" di Figma: x 216,4, 15,58 px.
      searchLeft: 12,
      searchFont: 15.58,
      // Ikon bulat teal di ujung kanan strip (Figma "Huge Icons / arrow-right-01-round", ~20 px, kanan 12 px).
      searchIcon: 24,
      // basketapi.svg (370 x 489, dipakai juga di Leaderboard): bola menggantung di sudut kanan bawah bar.
      fireball: { left: 1054, top: -78, width: 209 },
    },
    grid: { offset: 38, columns: 8, pitch: 125.3, logo: 67, logoGap: 11.6, name: 14.46, nameLine: 16, nameStroke: 1, rowGap: 4, scroll: null },
    // Halaman Figma: plat di (145, 97.86), logo di (178.71, 74); logo berdiri di atas plat.
    banner: {
      top: 14,
      plateLeft: 145,
      plateTop: 23.86,
      logoInset: 33.72,
      // Nama rata kiri, 12px di kanan logo.
      nameAreaLeft: 166.6,
      plateNotchLeft: 21,
      plateNotchRight: 35,
      plateTilt: -1.1,
      logoW: 120.85,
      logoH: 131.39,
      plateW: 409.07,
      plateH: 79.11,
      plateBorder: 4.42,
      namePadX: 24,
      nameMaxW: 900,
      font: 46.68,
      line: 54,
      stroke: 3.12,
      shadow: 4.16,
      boardOverlap: 74,
    },
    detail: { tablesOffset: 77 },
    table: {
      width: 966,
      headerBorder: 1.55,
      headerRadius: 12.39,
      titleRow: 39,
      labelRow: 43.54,
      row: 31,
      title: 26.86,
      label: 23.69,
      cell: 13.94,
      outline: 2.15,
      shadow: 2.87,
      rule: 2.15,
      bodyBorder: 2.87,
      bodyRadius: 15.79,
      gap: 32,
      minWidthTotals: 0,
      minWidthAverage: 0,
    },
    message: 18,
    backLink: { font: 16, top: 24, right: 236 },
  },
  mobile: {
    width: 390,
    checker: 60.9,
    title: {
      top: 14,
      groupW: 261,
      height: 45.17,
      plateLeft: 71.13,
      plateTop: 2.7,
      plateW: 117.8,
      plateH: 28.8,
      plateBorder: 1.15,
      plateNotchLeft: 9.9,
      plateNotchRight: 9.9,
      plateTilt: -0.5,
      artW: 74,
      artH: 28,
      artTop: 3.4,
    },
    board: { overlap: 20, minHeight: 560, paddingBottom: 40 },
    bar: {
      offset: 43,
      width: 335.09,
      height: 41.05,
      border: 1.9,
      radius: 7.8,
      innerInsetX: 1.4,
      innerInsetY: 1.9,
      innerRadius: 6.91,
      labelLeft: 9,
      labelTop: 4,
      label: 8.04,
      labelStroke: 0.54,
      stripLeft: 11,
      stripTop: 19,
      stripW: 312.37,
      stripH: 16.1,
      stripRadius: 2.4,
      // Figma mobile: placeholder 5 px (tak terbaca), dinaikkan ke 7 px; masih muat di strip 16,1 px.
      searchLeft: 3.7,
      searchFont: 7,
      // Figma mobile: ikon 6 px di kanan strip; dinaikkan sedikit agar terlihat.
      searchIcon: 11,
      fireball: { left: 316, top: -6, width: 56.5 },
    },
    grid: {
      offset: 50,
      columns: 3,
      pitch: 93,
      logo: 50,
      logoGap: 8,
      name: 10.79,
      nameLine: 12,
      nameStroke: 0.74,
      rowGap: 6,
      // Area gulir 5 baris; scrollbar Figma di x 46, panjang 308 (y 226-534).
      scroll: { height: 380, left: 46, trackWidth: 7, trackMargin: 36 },
    },
    // Plat di (25.59, 104.51), logo di (29.04, 92).
    banner: {
      top: 37,
      plateLeft: 25.59,
      plateTop: 12.51,
      logoInset: 3.45,
      nameAreaLeft: 71.5,
      plateNotchLeft: 9.7,
      plateNotchRight: 16.2,
      plateTilt: -1.1,
      logoW: 62.42,
      logoH: 67.87,
      plateW: 189.76,
      plateH: 36.7,
      plateBorder: 2,
      namePadX: 10,
      nameMaxW: 290,
      font: 29.79,
      line: 34,
      stroke: 1.4,
      shadow: 2.65,
      boardOverlap: 71,
    },
    detail: { tablesOffset: 84.6 },
    // Ukuran tabel mobile sengaja lebih besar dari Figma (0,327 x desktop) agar terbaca; tabel digulir ke samping.
    table: {
      width: 318,
      headerBorder: 0.8,
      headerRadius: 6,
      titleRow: 18,
      labelRow: 18,
      row: 18,
      title: 12,
      label: 10,
      cell: 9,
      outline: 0.9,
      shadow: 1.2,
      rule: 1,
      bodyBorder: 1.2,
      bodyRadius: 7,
      gap: 18,
      minWidthTotals: 360,
      minWidthAverage: 520,
    },
    message: 14,
    backLink: { font: 11, top: 12, right: 36 },
  },
} as const;

export type TableSpec = (typeof ARTBOARD)[ArtboardVariant]["table"];

export type TeamsPage = "list" | "detail";

/**
 * Latar halaman per halaman dan varian, dari ekspor CSS Figma (teams-*.txt, detail-teams-*.txt).
 * Koordinat dalam piksel desain artboard (frame Figma dikurangi tinggi navbar: 60 desktop, 55 mobile).
 * Frame mobile Figma bukan layout yang diperkecil: isinya potongan 390 px dari komposisi yang sama (skala ~0,92),
 * jadi papan, kertas, dan halftone mobile berada jauh di kiri (left negatif besar).
 *
 * Papan sengaja TIDAK dimiringkan (Figma: 0,81 derajat). Kemiringan itu bertabrakan dengan navbar, footer,
 * pita checker, dan konten yang semuanya lurus, sehingga margin tan menjadi baji. Semua garis dibuat sejajar.
 */
export interface PageBackground {
  /** Layer halftone: kiri-atas dan lebar; tinggi = lebar x HALFTONE_ASPECT. Opacity 30%. */
  halftone: { left: number; top: number; width: number };
  /** Pita checker atas (3 baris): jarak dari atas artboard. Kolomnya dipusatkan di tengah artboard. */
  checkerTop: { top: number };
  /** Papan: kiri dan lebar (berhenti di ujung komposisi Figma), skala bayangan. */
  board: { left: number; width: number; shadowScale: number };
  /** Kertas di dalam papan: kiri (dari tepi kiri papan), lebar, margin tan yang terlihat di atas/bawah kertas. */
  paper: { left: number; width: number; top: number; bottom: number };
  /** Lebar tampil serat papan (layer Figma `image 2`). */
  grainWidth: number;
}

export const PAGE_BACKGROUND: Record<TeamsPage, Record<ArtboardVariant, PageBackground>> = {
  list: {
    desktop: {
      halftone: { left: -19, top: -119, width: 1622 },
      checkerTop: { top: -1 },
      board: { left: -218.51, width: 1900.9, shadowScale: 1 },
      paper: { left: 97.08, width: 1867, top: 28.69, bottom: 30.12 },
      grainWidth: 1816.06,
    },
    mobile: {
      halftone: { left: -886.3, top: -162, width: 1491.97 },
      checkerTop: { top: -2 },
      board: { left: -1021, width: 1705.54, shadowScale: 0.9 },
      paper: { left: 86.88, width: 1754.28, top: 18.03, bottom: 9.44 },
      grainWidth: 1629.42,
    },
  },
  detail: {
    desktop: {
      halftone: { left: -153, top: -74, width: 1622 },
      checkerTop: { top: -7 },
      board: { left: -178.24, width: 1830.78, shadowScale: 0.96 },
      paper: { left: 93.5, width: 1798.13, top: 27.78, bottom: 29.19 },
      grainWidth: 1753.97,
    },
    mobile: {
      halftone: { left: -966.3, top: -161, width: 1491.97 },
      checkerTop: { top: -1 },
      board: { left: -1084, width: 1674.03, shadowScale: 0.88 },
      paper: { left: 85.28, width: 1721.88, top: 17.7, bottom: 9.26 },
      grainWidth: 1599.32,
    },
  },
};

/** Isi teks bergaris tepi (lihat OutlinedText). */
export const TEXT_FILLS = {
  goldTeal: "linear-gradient(168.07deg, #44D1D1 21.6%, #F4CB81 91.28%)",
  teal: "linear-gradient(198.35deg, #44D1D1 15.83%, #23637B 90.1%)",
} as const;

/** Bayangan teks Figma `0 y y rgba(0,0,0,.5)` sebagai argumen drop-shadow(). */
export function textShadow(offsetPx: number): string {
  return `0 ${offsetPx}px ${offsetPx}px rgba(0, 0, 0, 0.5)`;
}

export function teamDetailHref(teamId: string): string {
  return `/teams-main/detail-team?id=${encodeURIComponent(teamId)}`;
}
