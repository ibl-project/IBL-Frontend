export type ArtboardVariant = "desktop" | "mobile";

/** Container widths below this use the mobile (390) artboard. */
export const MOBILE_MAX_WIDTH = 768;

export const TEAMS_COLORS = {
  orange: "#EC5D12",
  ivory: "#FDF6DD",
  slate: "#799BA7",
  slateHeader: "#7A9BA8",
  ink: "#2F3C41",
  teal: "#50A28C",
} as const;

export const TEAMS_ASSETS = {
  /** Foto halftone yang dipakai layer Figma `image 2` / `image 4`. */
  halftone: "/images/groups-standings/board-texture.png",
} as const;

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
    board: { overlap: 43, minHeight: 660, paperInset: 28, paddingBottom: 72 },
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
      captionLeft: 12,
      caption: 15.58,
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
    board: { overlap: 20, minHeight: 560, paperInset: 18, paddingBottom: 40 },
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
      captionLeft: 0,
      caption: 0,
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
