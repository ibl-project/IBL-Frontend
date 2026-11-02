import React from "react";

/**
 * Kertas di atas papan, dari public/images/groups-standings/paper-standings.svg (ekspor SVG Figma untuk
 * komponen PAPER yang sama: layer bg-card + Vector 2581). Bentuknya segi lima, bukan persegi panjang:
 * tepi kiri miring, tepi atas turun ~0,8 derajat, tepi bawah ~1,1 derajat, sudut kanan bawah terpotong
 * dan ditutup lipatan kertas (curl).
 *
 * Sudut-sudutnya ditulis sebagai jarak tetap (px) dari tepi kotak, jadi kertas bisa memanjang mengikuti
 * isi tanpa ikut melar (tidak seperti preserveAspectRatio="none").
 *
 * Outline itu sendiri miring, dan tepi atas serta bawahnya tidak sejajar satu sama lain. Supaya semua garis
 * sejajar dengan navbar, papan, dan konten yang lurus, paperGeometry():
 *  - memutar kertas sebesar kemiringan tepi bawah, sehingga tepi bawah benar-benar datar;
 *  - menurunkan sudut kiri atas supaya tepi atas sejajar tepi bawah (ikut datar);
 *  - menghitung jarak tepi atas/bawah yang sudah datar ke kotaknya, supaya margin tan yang terlihat tepat.
 * Potongan kanan bawah dan lipatannya tidak diubah, jadi lipatan tetap pas di sudutnya.
 */
const CORNER = {
  topRight: { fromRight: 32.08, y: 2.05 },
  topLeft: { x: 5.86 },
  tip: { fromRight: 3.69, fromBottom: 120.08 },
  cut: { fromRight: 151.85, fromBottom: 33.94 },
  bottomLeft: { x: 45.64, fromBottom: 5.87 },
};

/** Bentuk kertas yang diluruskan untuk lebar tertentu (px desain). */
function paperGeometry(width: number) {
  const { topRight, topLeft, tip, cut, bottomLeft } = CORNER;
  const cutX = width - cut.fromRight;
  const topRightX = width - topRight.fromRight;
  // Tepi bawah naik ke kanan sebesar `rise` px per px; diputar searah jarum jam sebesar itu supaya datar.
  const rise = (cut.fromBottom - bottomLeft.fromBottom) / (cutX - bottomLeft.x);
  const angle = (Math.atan(rise) * 180) / Math.PI;
  // Sudut kiri atas diturunkan supaya tepi atas punya kemiringan yang sama dengan tepi bawah.
  const topLeftY = topRight.y + rise * (topRightX - topLeft.x);
  // Setelah diputar terhadap pusat, tiap tepi datar di ketinggian titiknya pada x = tengah.
  const center = width / 2;
  const insetTop = topLeftY - rise * (center - topLeft.x);
  const insetBottom = bottomLeft.fromBottom + rise * (center - bottomLeft.x);
  const clip =
    `polygon(${topLeft.x}px ${topLeftY.toFixed(2)}px, calc(100% - ${topRight.fromRight}px) ${topRight.y}px, ` +
    `calc(100% - ${tip.fromRight}px) calc(100% - ${tip.fromBottom}px), ` +
    `calc(100% - ${cut.fromRight}px) calc(100% - ${cut.fromBottom}px), ` +
    `${bottomLeft.x}px calc(100% - ${bottomLeft.fromBottom}px))`;
  return { angle, insetTop, insetBottom, clip };
}

/**
 * Gradasi kertas. Figma menulis 226.86deg untuk layer yang diputar -90 derajat; arah sebenarnya di layar
 * diambil dari gradient userSpace di paper-standings.svg, yang tepat menghasilkan stop 40,12% / 114,62% pada 160deg.
 */
const PAPER_FILL = "linear-gradient(160deg, #F8F8F8 40.12%, #B0A889 114.62%)";

/** Kotak lipatan di paper-standings.svg (viewBox 1651.63 x 653.83), menempel di pojok kanan bawah. */
const CURL_BOX = { x: 1491, y: 515, width: 160.63, height: 138.83 };
const CURL_PATH =
  "M1551.22 545.768C1547.45 556.638 1506.01 588.857 1499.09 604.56C1581.95 600.666 1643.07 546.406 1647.27 521.983" +
  "C1645.59 523.191 1638.98 527.299 1620.9 530.848C1602.82 534.397 1564.41 529.392 1547.46 526.446" +
  "C1548.51 527.519 1554.5 536.314 1551.22 545.768Z";

interface PaperCardProps {
  /** Kiri dan lebar kotak kertas, dari tepi kiri papan. */
  left: number;
  width: number;
  /** Margin tan yang terlihat antara tepi papan dan tepi kertas. */
  top: number;
  bottom: number;
  /** Skala bayangan (mobile sedikit lebih kecil di Figma). */
  shadowScale: number;
}

export function PaperCard({ left, width, top, bottom, shadowScale }: PaperCardProps) {
  const s = shadowScale;
  const paper = paperGeometry(width);
  return (
    <div
      aria-hidden
      className="absolute"
      style={{
        left,
        width,
        top: top - paper.insetTop,
        bottom: bottom - paper.insetBottom,
        transform: `rotate(${paper.angle}deg)`,
        filter: `drop-shadow(${-5.2 * s}px ${5.2 * s}px ${2.6 * s}px rgba(0, 0, 0, 0.25))`,
      }}
    >
      <div className="absolute inset-0" style={{ clipPath: paper.clip, background: PAPER_FILL }} />
      <svg
        className="absolute bottom-0 right-0"
        width={CURL_BOX.width}
        height={CURL_BOX.height}
        viewBox={`${CURL_BOX.x} ${CURL_BOX.y} ${CURL_BOX.width} ${CURL_BOX.height}`}
        style={{ filter: `drop-shadow(${-6.5 * s}px ${3.25 * s}px ${4 * s}px rgba(0, 0, 0, 0.25))` }}
      >
        <defs>
          <linearGradient id="teams-paper-curl" x1="1647.25" y1="562.037" x2="1532.84" y2="509.706" gradientUnits="userSpaceOnUse">
            <stop offset="0.0961538" stopColor="#80807F" />
            <stop offset="0.961538" stopColor="#9F9F9F" />
          </linearGradient>
        </defs>
        <path d={CURL_PATH} fill="url(#teams-paper-curl)" />
      </svg>
    </div>
  );
}
