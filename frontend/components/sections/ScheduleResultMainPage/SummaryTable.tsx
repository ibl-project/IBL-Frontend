"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

import { SUMMARY_ROWS, teamLabel } from "@/lib/matchDisplay";
import type { MatchSide } from "@/lib/matchesApi";

/**
 * Tabel ringkasan statistik (desain Figma "Tabel Summary"). Garis dan kotaknya digambar
 * summary-table-frame.svg (diambil dari desain, tanpa teks); semua teks di sini HTML.
 *
 * Kotak ini container "summary" (760 × 390); ukuran memakai cqw-nya. Skala teks mobile dipakai
 * kalau frame halaman (container "detail") < 480px, singkatan label kalau tabel < 320px.
 * Angka dari IMPLEMENTATION_DETAIL.md §5.
 */

const SHORT_LABELS: Record<string, string> = {
  "Field Goals": "FG",
  "2 Points": "2PT",
  "3 Points": "3PT",
  "Free Throws": "FT",
  "Rebounds (O/D)": "REB (O/D)",
  Assist: "AST",
};

// Titik tengah baris pertama dan jarak antarbaris (% tinggi tabel): 96/390 dan 50/390.
const FIRST_ROW_CENTER = 24.62;
const ROW_PITCH = 12.82;

// Varian ditulis lengkap di setiap kelas: Tailwind hanya membuat kelas yang tertulis utuh.
const CELL =
  "absolute h-[10.26%] -translate-y-1/2 flex items-center overflow-hidden whitespace-nowrap font-drowner leading-none text-white tracking-[0.07em] " +
  "text-[length:max(0.5625rem,var(--fs))] [--fs:2.254cqw] @max-[480px]/detail:[--fs:2.651cqw]";

const HEADER_NAME =
  "absolute top-[5.38%] h-[13.59%] w-[46.6%] flex items-center justify-center font-hollywood leading-none tracking-[-0.02em] " +
  "text-[length:max(0.625rem,min(var(--fs),calc(46.6cqw/(var(--chars)*0.47))))] [--fs:3.83cqw] [--stroke:0.182em] " +
  "@max-[480px]/detail:[--fs:4.874cqw] @max-[480px]/detail:[--stroke:0.153em]";

/** Nama tim di header: gradien teal, garis tepi krem di luar huruf, bayangan di belakang. */
function HeaderName({ text, className }: { text: string; className: string }) {
  const layer = "block overflow-hidden text-ellipsis whitespace-nowrap";
  return (
    <div className={`${HEADER_NAME} ${className}`} style={{ "--chars": Math.max(text.length, 1) } as CSSProperties}>
      <span title={text} className="relative block w-full text-center">
        <span
          aria-hidden="true"
          className={`absolute inset-0 text-transparent [-webkit-text-stroke:var(--stroke)_#FDF6DD] [text-shadow:0_0.121em_0.121em_rgba(0,0,0,0.5)] ${layer}`}
        >
          {text}
        </span>
        <span className={`relative ${layer}`}>
          <span className="bg-[linear-gradient(198.35deg,#44D1D1_15.83%,#23637B_90.1%)] bg-clip-text text-transparent">
            {text}
          </span>
        </span>
      </span>
    </div>
  );
}

/** `teams` null = masih memuat: hanya bingkai tabel. */
export function SummaryTable({ teams }: { teams: { team1: MatchSide; team2: MatchSide } | null }) {
  const name1 = teams ? teamLabel(teams.team1) : "";
  const name2 = teams ? teamLabel(teams.team2) : "";

  return (
    <div className="@container/summary relative aspect-[760/390] w-full">
      <Image
        src="/svg/figma/summary-table-frame.svg"
        alt=""
        fill
        className="pointer-events-none select-none object-contain"
      />

      {teams && (
        <>
          {/* Tabel asli untuk pembaca layar; tampilan di bawahnya disembunyikan dari mereka. */}
          <table className="sr-only">
            <caption>Ringkasan statistik pertandingan</caption>
            <thead>
              <tr>
                <th scope="col">Statistik</th>
                <th scope="col">{name1}</th>
                <th scope="col">{name2}</th>
              </tr>
            </thead>
            <tbody>
              {SUMMARY_ROWS.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value(teams.team1)}</td>
                  <td>{row.value(teams.team2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div aria-hidden="true">
            <HeaderName text={name1} className="left-[1.58%]" />
            <HeaderName text={name2} className="left-[51.34%]" />

            {SUMMARY_ROWS.map((row, index) => {
              const top = { top: `${FIRST_ROW_CENTER + ROW_PITCH * index}%` };
              return (
                <div key={row.label}>
                  {/* Team 1: rata kiri dari x 24 sampai garis kolom (288.5) − 12. */}
                  <div className={`${CELL} left-[3.16%] w-[33.22%] justify-start`} style={top}>
                    <span className="overflow-hidden text-ellipsis">{row.value(teams.team1)}</span>
                  </div>

                  {/* Label: di tengah kolom tengah (289.3–467.2); disingkat kalau tabel < 320px. */}
                  <div className={`${CELL} left-[38.06%] w-[23.41%] justify-center`} style={top}>
                    <span className="pl-[0.07em] @max-[320px]/summary:hidden">{row.label}</span>
                    <abbr title={row.label} className="hidden pl-[0.07em] no-underline @max-[320px]/summary:inline">
                      {SHORT_LABELS[row.label] ?? row.label}
                    </abbr>
                  </div>

                  {/* Team 2: rata kanan dari garis kolom (466.5) + 12 sampai x 735.5. */}
                  <div className={`${CELL} left-[62.96%] w-[33.82%] justify-end`} style={top}>
                    <span className="-mr-[0.07em] overflow-hidden text-ellipsis">{row.value(teams.team2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
