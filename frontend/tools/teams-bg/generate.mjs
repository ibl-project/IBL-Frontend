/**
 * Generator latar halaman Teams (/teams-main): halftone halaman dan serat papan.
 *
 * Jalankan dari folder frontend:   node tools/teams-bg/generate.mjs
 * Hasil:                           public/images/teams/halftone.png, public/images/teams/board-grain.png
 *
 * Kenapa digenerate: ekspor "Copy as CSS" Figma membuang semua layer gambar (`background: url()` kosong),
 * dan file Figma tidak bisa diekspor. Sumber yang tersisa adalah public/images/groups-standings/board-texture.png,
 * yaitu layer Figma "image 4" yang diperkecil 5,45x (rasio 185/298 = 0,621 sama dengan 1009/1622 = 0,622).
 * Gambar itu terlalu kecil untuk dipakai langsung (buram dan berulang kalau di-tile).
 *
 * Cara kerja ("re-screen"):
 *  1. Descreen: tinta = 1 - abu-abu, lalu blur Gaussian supaya titik halftone lebur menjadi peta kepekatan
 *     (posisi bercak gelap/terang dari desainer tetap sama).
 *  2. Orientasi sesuai Figma: "image 4" memakai matrix(0, 1, 1, 0) (transpose); "image 2" (serat papan)
 *     memakai matrix(-0.02, -1, -1, 0.02) (anti-transpose).
 *  3. Ukuran kanvas sama dengan layer Figma (halftone 1622 x 1009, serat 1816 x 1014); di Figma layer juga berhenti di situ.
 *  4. Re-screen: titik hitam tajam di kisi persegi 45 derajat, jarak 11 px desain, jari-jari
 *     r = jarak * sqrt(kepekatan / pi) supaya luas tinta sama. Di PNG sumber titiknya tinggal 1 px dengan jarak
 *     ~2 px (di bawah batas resolusi), jadi jarak aslinya ~2 x 5,45 = 11 px desain. Puncak autokorelasi 8 px
 *     di PNG adalah moire grid piksel, bukan kisi aslinya.
 *  5. Ketidakrataan cetak: tiap titik diberi variasi jari-jari dan geser kecil dari PRNG ber-seed tetap,
 *     supaya tidak terlihat seperti gradasi vektor yang terlalu rapi. Seed tetap = output selalu sama.
 *
 *  6. Dirender ke PNG abu-abu 4 tingkat (titik hitam di atas putih). ~14 ribu titik terlalu berat sebagai SVG, dan
 *     4 tingkat sudah cukup untuk titik hitam-putih yang antialias. Serat papan dirender setengah resolusi
 *     (tampil 10%, jadi ketajaman tidak terlihat) supaya filenya kecil.
 *
 * Komponen memakai mix-blend-mode multiply + opacity: untuk titik hitam di atas putih, hasilnya sama persis dengan
 * titik hitam transparan dengan opacity yang sama di Figma (dasar x (1 - opacity x tinta)).
 * Opacity diatur di komponen (halftone 30%, serat 10%).
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const FRONTEND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = path.join(FRONTEND, "public/images/groups-standings/board-texture.png");
const OUT_DIR = path.join(FRONTEND, "public/images/teams");

/** Jarak dan sudut kisi halftone (piksel desain Figma). */
const PITCH = 11;
const ANGLE_DEG = 45;
/** Blur peta kepekatan, dalam piksel PNG sumber (titik sumber berjarak ~2 px): cukup untuk melebur kisi, coretan tetap ada. */
const BLUR_SIGMA = 1.1;
/** Ketidakrataan cetak per titik: variasi jari-jari (relatif) dan geser posisi (relatif terhadap jarak kisi). */
const RADIUS_JITTER = 0.12;
const POSITION_JITTER = 0.04;
/** Seed tetap supaya hasil generate selalu sama (diff git bersih). */
const SEED = 2026;
/** Titik lebih kecil dari ini tidak digambar (tak terlihat, hanya menambah ukuran file). */
const MIN_RADIUS = 0.35;
/** Jumlah tingkat abu-abu PNG. */
const PNG_LEVELS = 4;

async function loadDensity() {
  const { data, info } = await sharp(SOURCE).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const ink = new Float64Array(width * height);
  for (let i = 0; i < width * height; i++) ink[i] = 1 - data[i * channels] / 255;
  return { width, height, field: gaussianBlur(ink, width, height, BLUR_SIGMA) };
}

function gaussianBlur(src, width, height, sigma) {
  const radius = Math.ceil(sigma * 3);
  const kernel = [];
  let sum = 0;
  for (let k = -radius; k <= radius; k++) {
    const w = Math.exp(-(k * k) / (2 * sigma * sigma));
    kernel.push(w);
    sum += w;
  }
  const norm = kernel.map((w) => w / sum);
  const pass = (input, horizontal) => {
    const out = new Float64Array(input.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let acc = 0;
        for (let k = -radius; k <= radius; k++) {
          // Tepi dipantulkan supaya pinggir tidak menjadi gelap/terang.
          let sx = horizontal ? x + k : x;
          let sy = horizontal ? y : y + k;
          if (sx < 0) sx = -sx;
          if (sx >= width) sx = 2 * width - 2 - sx;
          if (sy < 0) sy = -sy;
          if (sy >= height) sy = 2 * height - 2 - sy;
          acc += input[sy * width + sx] * norm[k + radius];
        }
        out[y * width + x] = acc;
      }
    }
    return out;
  };
  return pass(pass(src, true), false);
}

/** Sampel bilinear dengan koordinat dijepit ke tepi. */
function sample({ width, height, field }, x, y) {
  const cx = Math.min(Math.max(x, 0), width - 1);
  const cy = Math.min(Math.max(y, 0), height - 1);
  const x0 = Math.floor(cx);
  const y0 = Math.floor(cy);
  const x1 = Math.min(x0 + 1, width - 1);
  const y1 = Math.min(y0 + 1, height - 1);
  const fx = cx - x0;
  const fy = cy - y0;
  const top = field[y0 * width + x0] * (1 - fx) + field[y0 * width + x1] * fx;
  const bottom = field[y1 * width + x0] * (1 - fx) + field[y1 * width + x1] * fx;
  return top * (1 - fy) + bottom * fy;
}

/** PRNG mulberry32: deterministik untuk seed yang sama. */
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Gambar titik halftone untuk kanvas width x height.
 * toSource(X, Y) memetakan titik kanvas ke koordinat PNG sumber.
 */
function screen(density, width, height, toSource, seed) {
  const random = prng(seed);
  const a = (ANGLE_DEG * Math.PI) / 180;
  const e1 = [PITCH * Math.cos(a), PITCH * Math.sin(a)];
  const e2 = [-PITCH * Math.sin(a), PITCH * Math.cos(a)];
  // Rentang indeks kisi yang menutup seluruh kanvas (proyeksi keempat sudut).
  const corners = [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height],
  ];
  const proj = (p, e) => (p[0] * e[0] + p[1] * e[1]) / (PITCH * PITCH);
  const iRange = corners.map((p) => proj(p, e1));
  const jRange = corners.map((p) => proj(p, e2));
  const dots = [];
  for (let i = Math.floor(Math.min(...iRange)) - 1; i <= Math.ceil(Math.max(...iRange)) + 1; i++) {
    for (let j = Math.floor(Math.min(...jRange)) - 1; j <= Math.ceil(Math.max(...jRange)) + 1; j++) {
      const x = i * e1[0] + j * e2[0] + (random() - 0.5) * 2 * POSITION_JITTER * PITCH;
      const y = i * e1[1] + j * e2[1] + (random() - 0.5) * 2 * POSITION_JITTER * PITCH;
      const wobble = 1 + (random() - 0.5) * 2 * RADIUS_JITTER;
      if (x < -PITCH || y < -PITCH || x > width + PITCH || y > height + PITCH) continue;
      const [sx, sy] = toSource(x, y);
      const d = Math.min(sample(density, sx, sy), 0.9);
      const r = PITCH * Math.sqrt(d / Math.PI) * wobble;
      if (r >= MIN_RADIUS) dots.push([x, y, r]);
    }
  }
  return dots;
}

function toSvg(width, height, dots, scale) {
  const f = (n) => Number(n.toFixed(2));
  const circles = dots.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(width * scale)}" height="${Math.round(height * scale)}"` +
    ` viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#fff"/><g fill="#000">${circles}</g></svg>`
  );
}

const density = await loadDensity();
const { width: SW, height: SH } = density;
await mkdir(OUT_DIR, { recursive: true });

// "image 4": 1009 x 1622 portrait, transpose -> 1622 x 1009 landscape.
const HALFTONE = { width: 1622, height: 1009, sourceW: 1009, sourceH: 1622, scale: 1 };
const halftoneDots = screen(density, HALFTONE.width, HALFTONE.height, (X, Y) => {
  const lx = Y; // transpose: lokal x = kanvas Y
  const ly = X; // lokal y = kanvas X
  return [(lx * SW) / HALFTONE.sourceW, (ly * SH) / HALFTONE.sourceH];
}, SEED);

// "image 2": 1013.92 x 1816.06 portrait, anti-transpose -> 1816 x 1014 landscape, dirender setengah resolusi.
const GRAIN = { width: 1816, height: 1014, sourceW: 1013.92, sourceH: 1816.06, scale: 0.5 };
const grainDots = screen(density, GRAIN.width, GRAIN.height, (X, Y) => {
  const lx = GRAIN.sourceW - Y; // anti-transpose: lokal x = W - kanvas Y
  const ly = GRAIN.sourceH - X; // lokal y = H - kanvas X
  return [(lx * SW) / GRAIN.sourceW, (ly * SH) / GRAIN.sourceH];
}, SEED + 1);

const outputs = [
  ["halftone.png", HALFTONE, halftoneDots],
  ["board-grain.png", GRAIN, grainDots],
];
for (const [name, size, dots] of outputs) {
  const file = path.join(OUT_DIR, name);
  const svg = Buffer.from(toSvg(size.width, size.height, dots, size.scale));
  const info = await sharp(svg)
    .greyscale()
    .png({ palette: true, colors: PNG_LEVELS, compressionLevel: 9, effort: 10 })
    .toFile(file);
  const ink = dots.reduce((s, [, , r]) => s + Math.PI * r * r, 0);
  console.log(
    `${name}: ${info.width}x${info.height}, ${dots.length} titik, ${(info.size / 1024).toFixed(0)} KB,`,
    `cakupan tinta ~${((ink / (size.width * size.height)) * 100).toFixed(1)}%`,
  );
}
