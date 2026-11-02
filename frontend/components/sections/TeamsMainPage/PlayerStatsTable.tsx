import React, { useId, type CSSProperties } from "react";

import type { TeamPlayer } from "@/lib/teamsApi";
import { ARTBOARD, TEAMS_COLORS, textShadow, type ArtboardVariant, type TableSpec } from "./teamsMainTheme";
import { OutlinedText } from "./OutlinedText";
import type { StatColumn } from "./playerStatsColumns";

interface PlayerStatsTableProps {
  variant: ArtboardVariant;
  title: string;
  columns: StatColumn[];
  players: TeamPlayer[];
  playerColumnPercent: number;
  /** Lebar minimum tabel; jika lebih lebar dari kotaknya, tabel digulir ke samping. 0 = tanpa batas. */
  minWidth: number;
}

function cellStyle(table: TableSpec): CSSProperties {
  return {
    fontFamily: "var(--font-drowner)",
    fontSize: table.cell,
    lineHeight: `${table.row}px`,
    letterSpacing: "0.07em",
    color: TEAMS_COLORS.ink,
  };
}

/** Tabel statistik pemain. Nilai dari backend sudah siap tampil ("15.0", "50%", "-"). */
export function PlayerStatsTable({ variant, title, columns, players, playerColumnPercent, minWidth }: PlayerStatsTableProps) {
  const table = ARTBOARD[variant].table;
  const titleId = useId();
  const statPercent = (100 - playerColumnPercent) / columns.length;
  const gridTemplateColumns = `${playerColumnPercent}% repeat(${columns.length}, ${statPercent}%)`;
  const label = (text: string, fontSize: number) => (
    <OutlinedText
      outline={table.outline}
      outlineColor={TEAMS_COLORS.ivory}
      fill={TEAMS_COLORS.slate}
      shadow={textShadow(table.shadow)}
      style={{ fontFamily: "var(--font-hollywood)", fontSize, letterSpacing: "-0.02em" }}
    >
      {text}
    </OutlinedText>
  );
  const rule = `${table.rule}px solid ${TEAMS_COLORS.slate}`;

  return (
    <section aria-labelledby={titleId} className="mx-auto overflow-x-auto overscroll-x-contain" style={{ width: table.width }}>
      <div role="table" aria-labelledby={titleId} style={{ minWidth: minWidth || undefined }}>
        <div
          className="relative z-10 overflow-hidden"
          style={{
            background: TEAMS_COLORS.slateHeader,
            border: `${table.headerBorder}px solid ${TEAMS_COLORS.ivory}`,
            borderRadius: table.headerRadius,
          }}
        >
          <h3
            id={titleId}
            className="flex items-center justify-center uppercase"
            style={{ height: table.titleRow, lineHeight: `${table.titleRow}px` }}
          >
            {label(title, table.title)}
          </h3>
          <div
            role="row"
            className="grid"
            style={{
              gridTemplateColumns,
              height: table.labelRow,
              background: TEAMS_COLORS.slate,
              borderTop: `${table.rule}px solid ${TEAMS_COLORS.ivory}`,
            }}
          >
            <span role="columnheader" className="flex items-center justify-center uppercase">
              {label("Player", table.label)}
            </span>
            {columns.map((column) => (
              <span key={column.key} role="columnheader" className="flex items-center justify-center uppercase">
                {label(column.label, table.label)}
              </span>
            ))}
          </div>
        </div>

        <div
          role="rowgroup"
          style={{
            marginTop: -table.headerRadius,
            paddingTop: table.headerRadius,
            border: `${table.bodyBorder}px solid ${TEAMS_COLORS.slate}`,
            borderTop: "none",
            borderRadius: `0 0 ${table.bodyRadius}px ${table.bodyRadius}px`,
          }}
        >
          {players.length === 0 ? (
            <p className="text-center" style={{ ...cellStyle(table), lineHeight: `${table.row * 2}px` }}>
              Belum ada pemain terdaftar.
            </p>
          ) : (
            players.map((player, index) => (
              <div key={player.id} role="row" className="grid" style={{ gridTemplateColumns, borderTop: index === 0 ? "none" : rule }}>
                <span role="cell" title={player.name} className="truncate px-2 text-center" style={cellStyle(table)}>
                  {player.isCaptain ? `${player.name} (C)` : player.name}
                </span>
                {columns.map((column) => (
                  <span key={column.key} role="cell" className="text-center" style={{ ...cellStyle(table), borderLeft: rule }}>
                    {player.stats[column.key]}
                  </span>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
