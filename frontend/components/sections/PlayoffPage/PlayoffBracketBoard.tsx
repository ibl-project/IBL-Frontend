"use client";

import React from "react";
import type { PlayoffMatch, PlayoffSlot, Playoffs } from "@/lib/standingsApi";
import type { PlayoffRound } from "@/lib/matchesApi";
import { PlayoffMatchCard } from "./PlayoffMatchCard";

interface PlayoffBracketBoardProps {
  playoffs: Playoffs | null;
  onEditSlot: (round: PlayoffRound, position: number, match: PlayoffMatch | null) => void;
}

export const PlayoffBracketBoard: React.FC<PlayoffBracketBoardProps> = ({
  playoffs,
  onEditSlot,
}) => {
  const getSlot = (round: PlayoffRound, position: number): PlayoffSlot | null => {
    if (!playoffs) return null;
    const r = playoffs.rounds.find((rnd) => rnd.round === round);
    if (!r) return null;
    return r.slots.find((s) => s.position === position) ?? null;
  };

  const roundBadges = [
    { label: "Round Of 16", left: 34 },
    { label: "Quarter Final", left: 248 },
    { label: "Semi Final", left: 454 },
    { label: "Final", left: 647 },
    { label: "Semi Final", left: 840 },
    { label: "Quarter Final", left: 1046 },
    { label: "Round Of 16", left: 1260 },
  ];

  return (
    <div className="w-full flex flex-col gap-6 overflow-hidden">
      {/* Scrollable Container */}
      <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div className="relative mx-auto w-[1440px] min-w-[1440px] h-[720px] select-none">
          {/* Header Badges Rail */}
          <div className="absolute top-0 left-0 w-full h-[40px] z-20">
            {roundBadges.map((badge, idx) => (
              <span
                key={idx}
                style={{ left: `${badge.left}px` }}
                className="absolute top-0 w-36 py-2 px-3 rounded-lg bg-[#6E9398] text-white text-xs font-semibold shadow-sm tracking-wide text-center"
              >
                {badge.label}
              </span>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════════
              LEFT WING
          ══════════════════════════════════════════════════════════ */}
          {/* Left R16 Cards (4 duels) */}
          {[1, 2, 3, 4].map((pos, idx) => {
            const topPositions = [60, 205, 360, 505];
            return (
              <div
                key={`r16-left-${pos}`}
                style={{ left: "24px", top: `${topPositions[idx]}px` }}
                className="absolute z-10"
              >
                <PlayoffMatchCard
                  round="ROUND_OF_16"
                  position={pos}
                  slot={getSlot("ROUND_OF_16", pos)}
                  onEdit={onEditSlot}
                />
              </div>
            );
          })}

          {/* Left R16 Connector Tracks */}
          {/* Upper Fork: R16 1 & 2 -> QF 1 */}
          <div
            className="absolute pointer-events-none z-0"
            style={{
              left: "184px",
              top: "123px",
              width: "54px",
              height: "145px",
            }}
          >
            <div className="absolute left-0 top-0 w-[28px] h-[2px] bg-[#401212]" />
            <div className="absolute left-0 bottom-0 w-[28px] h-[2px] bg-[#401212]" />
            <div className="absolute left-[27px] top-0 bottom-0 w-[2px] bg-[#401212]" />
            <div className="absolute left-[27px] right-0 top-[72px] h-[2px] bg-[#401212]" />
          </div>

          {/* Lower Fork: R16 3 & 4 -> QF 2 */}
          <div
            className="absolute pointer-events-none z-0"
            style={{
              left: "184px",
              top: "423px",
              width: "54px",
              height: "145px",
            }}
          >
            <div className="absolute left-0 top-0 w-[28px] h-[2px] bg-[#401212]" />
            <div className="absolute left-0 bottom-0 w-[28px] h-[2px] bg-[#401212]" />
            <div className="absolute left-[27px] top-0 bottom-0 w-[2px] bg-[#401212]" />
            <div className="absolute left-[27px] right-0 top-[72px] h-[2px] bg-[#401212]" />
          </div>

          {/* Left Quarter Final Cards (2 duels) */}
          <div
            style={{ left: "238px", top: "132px" }}
            className="absolute z-10"
          >
            <PlayoffMatchCard
              round="QUARTERFINAL"
              position={1}
              slot={getSlot("QUARTERFINAL", 1)}
              onEdit={onEditSlot}
            />
          </div>

          <div
            style={{ left: "238px", top: "432px" }}
            className="absolute z-10"
          >
            <PlayoffMatchCard
              round="QUARTERFINAL"
              position={2}
              slot={getSlot("QUARTERFINAL", 2)}
              onEdit={onEditSlot}
            />
          </div>

          {/* Left QF Connector Track (QF 1 & QF 2 -> SF 1) */}
          <div
            className="absolute pointer-events-none z-0"
            style={{
              left: "398px",
              top: "195px",
              width: "46px",
              height: "300px",
            }}
          >
            <div className="absolute left-0 top-0 w-[24px] h-[2px] bg-[#401212]" />
            <div className="absolute left-0 bottom-0 w-[24px] h-[2px] bg-[#401212]" />
            <div className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-[#401212]" />
            <div className="absolute left-[23px] right-0 top-[150px] h-[2px] bg-[#401212]" />
          </div>

          {/* Left Semi Final Card (1 duel) */}
          <div
            style={{ left: "444px", top: "282px" }}
            className="absolute z-10"
          >
            <PlayoffMatchCard
              round="SEMIFINAL"
              position={1}
              slot={getSlot("SEMIFINAL", 1)}
              onEdit={onEditSlot}
            />
          </div>

          {/* Left SF Connector Track */}
          {/* Connector Rail dari SF 1 (kiri) ke Final (atas) & 3rd Place (bawah) */}
          <div
            className="absolute pointer-events-none z-0"
            style={{
              left: "604px",
              top: "145px",
              width: "33px",
              height: "360px",
            }}
          >
            {/* Garis vertikal di tengah antara SF 1 dan Final/3rd Place */}
            <div className="absolute left-[16px] top-0 bottom-0 w-[2px] bg-[#401212]" />
            {/* Cabang horizontal keluar dari sisi kanan SF 1 ke garis vertikal */}
            <div className="absolute left-0 top-[200px] w-[18px] h-[2px] bg-[#401212]" />
            {/* Cabang horizontal masuk ke Final (ke dalam / ke kanan) */}
            <div className="absolute left-[16px] right-0 top-0 h-[2px] bg-[#401212]" />
            {/* Cabang horizontal masuk ke 3rd Place (ke dalam / ke kanan) */}
            <div className="absolute left-[16px] right-0 bottom-0 h-[2px] bg-[#401212]" />
          </div>

          {/* ══════════════════════════════════════════════════════════
              CENTER COLUMN (CHAMPION & 3RD PLACE)
          ══════════════════════════════════════════════════════════ */}
          {/* Final Match (Champion) */}
          <div
            style={{ left: "637px", top: "75px" }}
            className="absolute z-10 flex flex-col items-center gap-1.5"
          >
            <div className="text-base font-black tracking-wider uppercase text-[#E5B338] drop-shadow-sm flex items-center gap-1 select-none">
              CHAMPION
            </div>
            <PlayoffMatchCard
              round="FINAL"
              position={1}
              slot={getSlot("FINAL", 1)}
              onEdit={onEditSlot}
              className="ring-2 ring-[#E5B338]/60 shadow-lg"
            />
          </div>

          {/* 3rd Place Match */}
          <div
            style={{ left: "637px", top: "435px" }}
            className="absolute z-10 flex flex-col items-center gap-1.5"
          >
            <PlayoffMatchCard
              round="THIRD_PLACE"
              position={1}
              slot={getSlot("THIRD_PLACE", 1)}
              onEdit={onEditSlot}
            />
            <div className="text-sm font-extrabold tracking-wider uppercase text-slate-600 drop-shadow-sm select-none">
              3RD PLACE
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT WING
          ══════════════════════════════════════════════════════════ */}
          {/* Connector Rail dari SF 2 (kanan) ke Final (atas) & 3rd Place (bawah) */}
          <div
            className="absolute pointer-events-none z-0"
            style={{
              left: "797px",
              top: "145px",
              width: "33px",
              height: "360px",
            }}
          >
            {/* Garis vertikal di tengah antara Final/3rd Place dan SF 2 */}
            <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-[#401212]" />
            {/* Cabang horizontal masuk ke Final dari garis vertikal (ke dalam / ke kiri) */}
            <div className="absolute left-0 top-0 w-[17px] h-[2px] bg-[#401212]" />
            {/* Cabang horizontal masuk ke 3rd Place dari garis vertikal (ke dalam / ke kiri) */}
            <div className="absolute left-0 bottom-0 w-[17px] h-[2px] bg-[#401212]" />
            {/* Cabang horizontal keluar dari garis vertikal ke sisi kiri SF 2 */}
            <div className="absolute left-[15px] right-0 top-[200px] h-[2px] bg-[#401212]" />
          </div>

          {/* Right Semi Final Card (1 duel) */}
          <div
            style={{ left: "830px", top: "282px" }}
            className="absolute z-10"
          >
            <PlayoffMatchCard
              round="SEMIFINAL"
              position={2}
              slot={getSlot("SEMIFINAL", 2)}
              onEdit={onEditSlot}
            />
          </div>

          {/* Right QF Connector Track (SF 2 -> QF 3 & QF 4) */}
          <div
            className="absolute pointer-events-none z-0"
            style={{
              left: "990px",
              top: "195px",
              width: "46px",
              height: "300px",
            }}
          >
            <div className="absolute left-0 top-[150px] w-[24px] h-[2px] bg-[#401212]" />
            <div className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-[#401212]" />
            <div className="absolute left-[23px] right-0 top-0 h-[2px] bg-[#401212]" />
            <div className="absolute left-[23px] right-0 bottom-0 h-[2px] bg-[#401212]" />
          </div>

          {/* Right Quarter Final Cards (2 duels) */}
          <div
            style={{ left: "1036px", top: "132px" }}
            className="absolute z-10"
          >
            <PlayoffMatchCard
              round="QUARTERFINAL"
              position={3}
              slot={getSlot("QUARTERFINAL", 3)}
              onEdit={onEditSlot}
            />
          </div>

          <div
            style={{ left: "1036px", top: "432px" }}
            className="absolute z-10"
          >
            <PlayoffMatchCard
              round="QUARTERFINAL"
              position={4}
              slot={getSlot("QUARTERFINAL", 4)}
              onEdit={onEditSlot}
            />
          </div>

          {/* Right R16 Connector Tracks */}
          {/* Upper Fork: QF 3 <- R16 5 & 6 */}
          <div
            className="absolute pointer-events-none z-0"
            style={{
              left: "1196px",
              top: "123px",
              width: "54px",
              height: "145px",
            }}
          >
            <div className="absolute left-0 top-[72px] w-[28px] h-[2px] bg-[#401212]" />
            <div className="absolute left-[27px] top-0 bottom-0 w-[2px] bg-[#401212]" />
            <div className="absolute left-[27px] right-0 top-0 h-[2px] bg-[#401212]" />
            <div className="absolute left-[27px] right-0 bottom-0 h-[2px] bg-[#401212]" />
          </div>

          {/* Lower Fork: QF 4 <- R16 7 & 8 */}
          <div
            className="absolute pointer-events-none z-0"
            style={{
              left: "1196px",
              top: "423px",
              width: "54px",
              height: "145px",
            }}
          >
            <div className="absolute left-0 top-[72px] w-[28px] h-[2px] bg-[#401212]" />
            <div className="absolute left-[27px] top-0 bottom-0 w-[2px] bg-[#401212]" />
            <div className="absolute left-[27px] right-0 top-0 h-[2px] bg-[#401212]" />
            <div className="absolute left-[27px] right-0 bottom-0 h-[2px] bg-[#401212]" />
          </div>

          {/* Right R16 Cards (4 duels) */}
          {[5, 6, 7, 8].map((pos, idx) => {
            const topPositions = [60, 205, 360, 505];
            return (
              <div
                key={`r16-right-${pos}`}
                style={{ left: "1250px", top: `${topPositions[idx]}px` }}
                className="absolute z-10"
              >
                <PlayoffMatchCard
                  round="ROUND_OF_16"
                  position={pos}
                  slot={getSlot("ROUND_OF_16", pos)}
                  onEdit={onEditSlot}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
