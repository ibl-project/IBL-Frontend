"use client";

import React from "react";

import type { StandingRow, StandingsGroup } from "@/lib/standingsApi";

interface GroupStageGridProps {
  groups: StandingsGroup[];
}

interface StandingsTableProps {
  teams: StandingRow[];
  groupLabel?: string;
}

/**
 * `rows`: jumlah baris minimum. Grup yang timnya lebih sedikit diisi baris kosong
 * setinggi baris tim, supaya semua kotak grup di satu conference sejajar.
 */
export function SingleGroupTable({ group, rows = 1 }: { group: StandingsGroup; rows?: number }) {
  const fillerRows = Math.max(rows, 1) - group.standings.length;

  return (
    <div className="w-full overflow-hidden rounded-[14px] border-[2px] border-[#658B9D] bg-white shadow-sm">
      <div className="w-full scrollbar-none overflow-x-auto sm:scrollbar-thin">
        <table className="w-full min-w-0 table-auto border-collapse">
          <thead>
            <tr className="bg-[#658B9D] text-white">
              <th
                className="px-2 py-1.5 text-left text-[11.5px] tracking-tight whitespace-nowrap uppercase sm:px-3 sm:py-2 sm:text-sm sm:tracking-wide"
                style={{
                  fontFamily: "var(--font-hollywood), var(--font-poppins)",
                  textShadow: "0 1.5px 2px rgba(0,0,0,0.5)",
                }}
              >
                {group.name}
              </th>
              {["G", "W", "L", "PM", "PA", "PD", "PTS"].map((col, cIdx) => (
                <th
                  key={col}
                  className={`py-1.5 text-center text-[10.5px] tracking-tight whitespace-nowrap uppercase sm:py-2 sm:text-xs sm:tracking-wider ${
                    col === "G" || col === "W" || col === "L"
                      ? "w-[23px] sm:w-[28px]"
                      : col === "PM" || col === "PD"
                        ? "w-[27px] sm:w-[32px]"
                        : col === "PA"
                          ? "w-[32px] sm:w-[36px]"
                          : "w-[27px] sm:w-[36px]"
                  } ${cIdx === 6 ? "px-1 sm:pr-3" : "px-1 sm:px-1.5"}`}
                  style={{
                    fontFamily: "var(--font-hollywood), var(--font-poppins)",
                    textShadow: "0 1.5px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.standings.map((row, idx) => (
              <tr
                key={row.team.id}
                className={`border-t border-[#D3E2E9] transition-colors hover:bg-[#F2F7FA] ${
                  idx % 2 === 1 ? "bg-[#FAFCFD]" : "bg-white"
                }`}
              >
                <td
                  className="max-w-[125px] truncate border-r border-[#D3E2E9] px-2 py-1.5 text-[11px] font-bold whitespace-nowrap text-[#1E293B] min-[375px]:max-w-[145px] min-[390px]:max-w-[170px] sm:max-w-none sm:px-3 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                  title={row.team.name}
                >
                  {row.team.name}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.G}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.W}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.L}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PM}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PA}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PD}
                </td>
                <td
                  className="px-1 py-1.5 text-center text-[11.5px] font-extrabold whitespace-nowrap text-[#1E293B] tabular-nums sm:py-2 sm:pr-3 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PTS}
                </td>
              </tr>
            ))}
            {group.standings.length === 0 ? (
              // Grup kosong: satu sel setinggi `rows` baris tim, "Belum ada tim" di tengahnya.
              <tr className="border-t border-[#D3E2E9] bg-white">
                <td colSpan={8} className="relative p-0">
                  {Array.from({ length: Math.max(rows, 1) }, (_, i) => (
                    <div
                      key={i}
                      aria-hidden
                      className={`py-1.5 text-[11.5px] sm:py-2 sm:text-xs ${i > 0 ? "border-t border-transparent" : ""}`}
                    >
                      {" "}
                    </div>
                  ))}
                  <span
                    className="absolute inset-0 flex items-center justify-center text-[11.5px] font-bold text-[#94A3B8] sm:text-xs"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    Belum ada tim
                  </span>
                </td>
              </tr>
            ) : (
              Array.from({ length: Math.max(fillerRows, 0) }, (_, i) => {
                const idx = group.standings.length + i;
                return (
                  <tr
                    key={`empty-${i}`}
                    className={`border-t border-[#D3E2E9] ${idx % 2 === 1 ? "bg-[#FAFCFD]" : "bg-white"}`}
                  >
                    {/* Ukuran teks & padding sama dengan sel angka, jadi tingginya sama dengan baris tim. */}
                    <td colSpan={8} className="py-1.5 text-[11.5px] sm:py-2 sm:text-xs">
                      {" "}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GroupStageGrid({ groups }: GroupStageGridProps) {
  // Semua grup setinggi grup dengan tim terbanyak di conference ini.
  const rows = Math.max(1, ...groups.map((group) => group.standings.length));

  return (
    <div className="mx-auto grid w-full max-w-[1020px] grid-cols-1 items-start gap-x-6 gap-y-5 sm:gap-x-8 sm:gap-y-6 lg:grid-cols-2">
      {groups.map((group) => (
        <SingleGroupTable key={group.id} group={group} rows={rows} />
      ))}
    </div>
  );
}

export function StandingsTable({ teams, groupLabel = "TIM" }: StandingsTableProps) {
  return (
    <div className="mx-auto w-full max-w-[760px] overflow-hidden rounded-[14px] border-[2px] border-[#658B9D] bg-white shadow-sm">
      <div className="w-full scrollbar-none overflow-x-auto sm:scrollbar-thin">
        <table className="w-full min-w-0 table-auto border-collapse">
          <thead>
            <tr className="bg-[#658B9D] text-white">
              <th
                className="w-[24px] px-1 py-1.5 text-center text-[10px] tracking-tight whitespace-nowrap uppercase sm:w-[44px] sm:px-2 sm:py-2.5 sm:text-xs sm:tracking-wider"
                style={{
                  fontFamily: "var(--font-hollywood), var(--font-poppins)",
                  textShadow: "0 1.5px 2px rgba(0,0,0,0.5)",
                }}
              >
                #
              </th>
              <th
                className="px-2 py-1.5 text-left text-[11.5px] tracking-tight whitespace-nowrap uppercase sm:px-3 sm:py-2.5 sm:text-sm sm:tracking-wide"
                style={{
                  fontFamily: "var(--font-hollywood), var(--font-poppins)",
                  textShadow: "0 1.5px 2px rgba(0,0,0,0.5)",
                }}
              >
                {groupLabel}
              </th>
              {["G", "W", "L", "PM", "PA", "PD", "PTS"].map((col, cIdx) => (
                <th
                  key={col}
                  className={`py-1.5 text-center text-[10.5px] tracking-tight whitespace-nowrap uppercase sm:py-2.5 sm:text-xs sm:tracking-wider ${
                    col === "G" || col === "W" || col === "L"
                      ? "w-[23px] sm:w-[28px]"
                      : col === "PM" || col === "PD"
                        ? "w-[27px] sm:w-[32px]"
                        : col === "PA"
                          ? "w-[32px] sm:w-[36px]"
                          : "w-[27px] sm:w-[36px]"
                  } ${cIdx === 6 ? "px-1 sm:pr-3" : "px-1 sm:px-1.5"}`}
                  style={{
                    fontFamily: "var(--font-hollywood), var(--font-poppins)",
                    textShadow: "0 1.5px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((row, idx) => (
              <tr
                key={row.team.id}
                className={`border-t border-[#D3E2E9] transition-colors hover:bg-[#F2F7FA] ${
                  idx % 2 === 1 ? "bg-[#FAFCFD]" : "bg-white"
                }`}
              >
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#658B9D] tabular-nums sm:px-2 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.rank}
                </td>
                <td
                  className="max-w-[115px] truncate border-r border-[#D3E2E9] px-2 py-1.5 text-[11px] font-bold whitespace-nowrap text-[#1E293B] min-[375px]:max-w-[135px] min-[390px]:max-w-[160px] sm:max-w-none sm:px-3 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                  title={row.team.name}
                >
                  {row.team.name}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.G}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.W}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.L}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PM}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PA}
                </td>
                <td
                  className="border-r border-[#D3E2E9] px-1 py-1.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#1E293B] tabular-nums sm:px-1.5 sm:py-2 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PD}
                </td>
                <td
                  className="px-1 py-1.5 text-center text-[11.5px] font-extrabold whitespace-nowrap text-[#1E293B] tabular-nums sm:py-2 sm:pr-3 sm:text-xs"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PTS}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
