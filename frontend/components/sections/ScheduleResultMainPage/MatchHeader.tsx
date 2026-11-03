"use client";

import type { CSSProperties, ReactNode } from "react";

import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";
import { DROWNER_ADVANCE, textWidthEm } from "@/lib/fontMetrics";
import { formatKickoff, teamLabel } from "@/lib/matchDisplay";
import type { MatchTeamSide } from "@/lib/matchesApi";

/**
 * Header detail pertandingan (desain Figma "team12"): logo kedua tim, nama tim, lokasi,
 * dan jam. Menggantikan gambar team12 group.svg yang berisi teks contoh.
 *
 * Kotak ini container "header"; semua ukuran memakai cqw-nya. Tata letak mobile dipakai
 * kalau frame halaman (container "detail") lebih sempit dari 480px. Angka dari
 * IMPLEMENTATION_DETAIL.md §4.
 */

export interface MatchHeaderData {
  team1: MatchTeamSide;
  team2: MatchTeamSide;
  venue: string | null;
  scheduledAt: string | null;
}

// Varian mobile ditulis lengkap di setiap kelas (bukan disusun dari variabel), karena
// Tailwind hanya membuat kelas yang tertulis utuh di source.

// Ukuran teks: max(floor, min(ukuran desain, lebar kotak / (jumlah huruf × lebar per huruf))).
// Nama panjang mengecil sendiri tanpa mengukur DOM; sisanya terpotong dengan elipsis.
const FIT_TEXT =
  "text-[length:max(var(--floor),min(var(--fs),calc(var(--box)/(var(--chars)*var(--per-char)))))]";

const GRADIENT_TEAM = "bg-[linear-gradient(168.07deg,#F48F42_21.6%,#F4CB81_91.28%)]";
const GRADIENT_VENUE = "bg-[linear-gradient(168.07deg,#CB0404_21.6%,#F4CB81_91.28%)]";

/**
 * Teks gradien dengan garis tepi hitam. Dua lapis: garis tepi di belakang (lebarnya dua kali,
 * separuh dalamnya tertutup lapis atas) dan gradien di depan, supaya garis tepi berada di luar huruf.
 */
function OutlinedText({ text, gradient }: { text: string; gradient: string }) {
  const layer = "overflow-hidden text-ellipsis whitespace-nowrap pl-[var(--ls)]";
  return (
    <span title={text} className="relative block w-full text-center">
      <span
        aria-hidden="true"
        className={`absolute inset-0 block text-transparent [-webkit-text-stroke:var(--stroke)_#000] ${layer}`}
      >
        {text}
      </span>
      <span className={`relative block ${layer}`}>
        <span className={`bg-clip-text text-transparent ${gradient}`}>{text}</span>
      </span>
    </span>
  );
}

function TextRow({
  className,
  chars,
  vars,
  children,
}: {
  className: string;
  /** Jumlah huruf (baris lokasi/jam). Baris nama memakai `vars` dari nameFitVars. */
  chars?: number;
  vars?: CSSProperties;
  children: ReactNode;
}) {
  const style = chars === undefined ? vars : ({ "--chars": Math.max(chars, 1), ...vars } as CSSProperties);
  return (
    <div
      className={`absolute flex items-center justify-center font-drowner leading-none tracking-[var(--ls)] ${FIT_TEXT} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

function TeamLogoBlock({ side, position }: { side: MatchTeamSide | null; position: string }) {
  return (
    <div
      className={`absolute top-0 aspect-[135/134] w-[18.24%] @max-[480px]/detail:aspect-[50.32/49.84] @max-[480px]/detail:w-[14.8%] @max-[480px]/detail:drop-shadow-[0_0_10.81cqw_#FFFFFF] ${position}`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-[13.16%] right-[35.01%] top-[45.27%] bottom-[2.41%] rounded-[50%] bg-[rgba(235,223,188,0.7)] blur-[4.73cqw] @max-[480px]/detail:blur-[3.83cqw]`}
      />
      <div className="absolute inset-0">
        <TeamLogo
          src={side?.logo}
          alt={side ? `Logo ${teamLabel(side)}` : ""}
          sizes="(max-width: 504px) 64px, 200px"
        />
      </div>
    </div>
  );
}

/**
 * Kotak dan ukuran desain baris nama, dalam cqw (harus sama dengan [--box] dan [--fs] di NAME_ROW).
 * Ditulis ulang di sini karena Tailwind hanya membuat kelas yang tertulis utuh, jadi NAME_ROW tidak bisa disusun dari angka ini.
 */
const NAME_BOX = { desktop: { box: 21.49, fs: 3.919 }, mobile: { box: 46.76, fs: 3.235 } } as const;
/** Jarak huruf desain, dan batas terketat untuk nama panjang (em). */
const NAME_LS = { design: 0.26, min: 0.1 } as const;
/** Garis tepi di kedua ujung: separuh luar --stroke kiri + kanan (dipakai yang terbesar, 0,18em mobile). */
const NAME_OUTLINE_EM = 0.18;

/**
 * Nama panjang dibuat muat dengan merapatkan jarak huruf dulu (paling rapat NAME_LS.min), lalu baru mengecil
 * untuk sisanya (rumus FIT_TEXT). Nama yang sudah muat tetap memakai jarak dan ukuran desain.
 * Lebar dihitung dari lebar huruf Drowner yang sebenarnya; perkiraan lama "0,81 em per huruf" terlalu kecil
 * untuk huruf lebar (M, O, H), sehingga HIMATEKTRO terpotong.
 */
function nameFit(name: string, { box, fs }: { box: number; fs: number }) {
  const glyphs = textWidthEm(DROWNER_ADVANCE, name, 0);
  // Satu jarak per huruf ditambah padding kiri pl-[var(--ls)].
  const gaps = [...name].length + 1;
  const ls = Math.min(NAME_LS.design, Math.max(NAME_LS.min, (box / fs - glyphs - NAME_OUTLINE_EM) / gaps));
  return { ls, em: glyphs + ls * gaps + NAME_OUTLINE_EM };
}

/** Variabel CSS baris nama untuk kedua varian; dipakai oleh NAME_ROW. */
function nameFitVars(name: string): CSSProperties {
  const desktop = nameFit(name, NAME_BOX.desktop);
  const mobile = nameFit(name, NAME_BOX.mobile);
  return {
    "--name-ls": `${desktop.ls.toFixed(3)}em`,
    "--name-em": desktop.em.toFixed(3),
    "--name-ls-m": `${mobile.ls.toFixed(3)}em`,
    "--name-em-m": mobile.em.toFixed(3),
  } as CSSProperties;
}

// Posisi dan ukuran per baris teks: desktop (kotak 740 × 182) lalu mobile (340 × 64).
// Baris nama: jarak huruf dan lebar dari nameFitVars (--chars = lebar dalam em, --per-char 1).
const NAME_ROW =
  `top-[82.42%] h-[17.58%] w-[21.49%] @max-[480px]/detail:top-[81.25%] @max-[480px]/detail:h-[18.75%] @max-[480px]/detail:w-[46.76%] ` +
  `[--floor:0.625rem] [--fs:3.919cqw] [--box:21.49cqw] [--per-char:1] [--chars:var(--name-em)] [--ls:var(--name-ls)] [--stroke:0.138em] ` +
  `@max-[480px]/detail:[--fs:3.235cqw] @max-[480px]/detail:[--box:46.76cqw] @max-[480px]/detail:[--stroke:0.18em] ` +
  `@max-[480px]/detail:[--chars:var(--name-em-m)] @max-[480px]/detail:[--ls:var(--name-ls-m)]`;

const CENTER_COLUMN = `left-[20.95%] w-[59.19%] @max-[480px]/detail:left-[32.15%] @max-[480px]/detail:w-[37.85%]`;

const VENUE_ROW =
  `${CENTER_COLUMN} top-[37.36%] h-[17.58%] @max-[480px]/detail:top-[37.5%] @max-[480px]/detail:h-[15.63%] ` +
  `[--floor:0.625rem] [--fs:3.919cqw] [--box:59.19cqw] [--per-char:0.7] [--ls:0.26em] [--stroke:0.138em] ` +
  `@max-[480px]/detail:[--fs:2.647cqw] @max-[480px]/detail:[--box:37.85cqw] @max-[480px]/detail:[--stroke:0.22em] ` +
  // Header sangat sempit (ponsel 320px ke bawah): jarak huruf lokasi dirapatkan dulu sebelum elipsis.
  "@max-[300px]/header:[--ls:0.1em] @max-[300px]/header:[--per-char:0.52]";

const DATE_ROW =
  `${CENTER_COLUMN} top-[57.14%] h-[16.48%] @max-[480px]/detail:top-[57.81%] @max-[480px]/detail:h-[14.06%] text-black ` +
  `[--floor:0.5625rem] [--fs:3.649cqw] [--box:59.19cqw] [--per-char:0.55] [--ls:0.1em] ` +
  `@max-[480px]/detail:[--fs:2.353cqw] @max-[480px]/detail:[--box:37.85cqw]`;

/** `data` null = masih memuat: logo IBL bawaan tanpa teks. */
export function MatchHeader({ data }: { data: MatchHeaderData | null }) {
  const name1 = data ? teamLabel(data.team1) : "";
  const name2 = data ? teamLabel(data.team2) : "";
  const venue = data ? (data.venue ?? "Lokasi belum diatur") : "";
  const kickoff = data ? formatKickoff(data.scheduledAt) : "";

  return (
    <div className={`@container/header relative aspect-[740/182] w-full @max-[480px]/detail:aspect-[340/64]`}>
      <TeamLogoBlock side={data?.team1 ?? null} position={`left-[2.7%] @max-[480px]/detail:left-[17.35%]`} />
      <TeamLogoBlock side={data?.team2 ?? null} position={`left-[80.14%] @max-[480px]/detail:left-[70%]`} />

      {data && (
        <>
          <TextRow className={VENUE_ROW} chars={venue.length}>
            <OutlinedText text={venue} gradient={GRADIENT_VENUE} />
          </TextRow>

          <TextRow className={DATE_ROW} chars={kickoff.length}>
            <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap pl-[var(--ls)] text-center">
              {kickoff}
            </span>
          </TextRow>

          <TextRow className={`left-0 ${NAME_ROW}`} vars={nameFitVars(name1)}>
            <OutlinedText text={name1} gradient={GRADIENT_TEAM} />
          </TextRow>
          <TextRow className={`left-[78.51%] @max-[480px]/detail:left-[53.24%] ${NAME_ROW}`} vars={nameFitVars(name2)}>
            <OutlinedText text={name2} gradient={GRADIENT_TEAM} />
          </TextRow>
        </>
      )}
    </div>
  );
}
