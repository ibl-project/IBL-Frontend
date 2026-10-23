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

export function SingleGroupTable({ group }: { group: StandingsGroup }) {
  return (
    <div className="w-full rounded-[14px] border-[2px] border-[#658B9D] bg-white shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto scrollbar-none sm:scrollbar-thin">
        <table className="w-full min-w-0 border-collapse table-auto">
          <thead>
            <tr className="bg-[#658B9D] text-white">
              <th
                className="text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[11.5px] sm:text-sm uppercase tracking-tight sm:tracking-wide whitespace-nowrap"
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
                  className={`py-1.5 sm:py-2 text-center text-[10.5px] sm:text-xs uppercase tracking-tight sm:tracking-wider whitespace-nowrap ${
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
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] truncate max-w-[125px] min-[375px]:max-w-[145px] min-[390px]:max-w-[170px] sm:max-w-none whitespace-nowrap"
                  style={{ fontFamily: "var(--font-poppins)" }}
                  title={row.team.name}
                >
                  {row.team.name}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.G}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.W}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.L}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PM}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PA}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PD}
                </td>
                <td
                  className="px-1 sm:pr-3 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-extrabold text-[#1E293B] whitespace-nowrap tabular-nums"
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

export function GroupStageGrid({ groups }: GroupStageGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-5 sm:gap-y-6 w-full max-w-[1020px] mx-auto">
      {groups.map((group) => (
        <SingleGroupTable key={group.id} group={group} />
      ))}
    </div>
  );
}

export function StandingsTable({ teams, groupLabel = "TIM" }: StandingsTableProps) {
  return (
    <div className="w-full max-w-[760px] mx-auto rounded-[14px] border-[2px] border-[#658B9D] bg-white shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto scrollbar-none sm:scrollbar-thin">
        <table className="w-full min-w-0 border-collapse table-auto">
          <thead>
            <tr className="bg-[#658B9D] text-white">
              <th
                className="text-center px-1 sm:px-2 py-1.5 sm:py-2.5 text-[10px] sm:text-xs uppercase tracking-tight sm:tracking-wider whitespace-nowrap w-[24px] sm:w-[44px]"
                style={{
                  fontFamily: "var(--font-hollywood), var(--font-poppins)",
                  textShadow: "0 1.5px 2px rgba(0,0,0,0.5)",
                }}
              >
                #
              </th>
              <th
                className="text-left px-2 sm:px-3 py-1.5 sm:py-2.5 text-[11.5px] sm:text-sm uppercase tracking-tight sm:tracking-wide whitespace-nowrap"
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
                  className={`py-1.5 sm:py-2.5 text-center text-[10.5px] sm:text-xs uppercase tracking-tight sm:tracking-wider whitespace-nowrap ${
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
                  className="px-1 sm:px-2 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#658B9D] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.rank}
                </td>
                <td
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] truncate max-w-[115px] min-[375px]:max-w-[135px] min-[390px]:max-w-[160px] sm:max-w-none whitespace-nowrap"
                  style={{ fontFamily: "var(--font-poppins)" }}
                  title={row.team.name}
                >
                  {row.team.name}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.G}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.W}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.L}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PM}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PA}
                </td>
                <td
                  className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-bold text-[#1E293B] border-r border-[#D3E2E9] whitespace-nowrap tabular-nums"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {row.PD}
                </td>
                <td
                  className="px-1 sm:pr-3 py-1.5 sm:py-2 text-center text-[11.5px] sm:text-xs font-extrabold text-[#1E293B] whitespace-nowrap tabular-nums"
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
