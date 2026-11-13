"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { listMatches, type MatchListItem } from "@/lib/matchesApi";
import { useMatchLive } from "@/lib/hooks/useMatchLive";
import { todayWib, toWibFields } from "@/lib/datetime";
import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";

const DISMISS_KEY_PREFIX = "ibl_live_popup_dismissed_";

/**
 * Format kuarter ke tampilan flip-box:
 * Kuarter 1–4 tampil "1"–"4", overtime (5+) tampil "OT".
 */
function formatQuarterBox(quarter: number | null | undefined): string {
  if (!quarter || quarter <= 0) return "1";
  if (quarter <= 4) return String(quarter);
  return "OT";
}

/**
 * Cari pertandingan yang sedang LIVE. Mengutamakan match LIVE yang dijadwalkan hari ini (WIB).
 */
function findTargetLiveMatch(matches: MatchListItem[]): MatchListItem | null {
  const live = matches.filter((m) => m.status === "LIVE");
  const today = todayWib();
  return live.find((m) => m.scheduledAt && toWibFields(m.scheduledAt).date === today) ?? live[0] ?? null;
}

// Mock fallback data jika URL dibuka dengan ?testLive=true
const MOCK_LIVE_MATCH: MatchListItem = {
  id: "test-live-match",
  season: "2K26",
  matchNumber: 12,
  stage: "GROUP",
  group: { id: "group-a", name: "Group A" },
  playoffRound: null,
  bracketPosition: null,
  status: "LIVE",
  liveNow: true,
  locked: false,
  scheduledAt: new Date().toISOString(),
  venue: "Lapangan Basket ITS",
  startedAt: new Date().toISOString(),
  finishedAt: null,
  resultFile: null,
  winnerTeamId: null,
  team1: {
    id: "team-1",
    name: "HMM",
    logo: null,
    placeholder: "HMM",
    color: "#E4571A",
    score: 68,
  },
  team2: {
    id: "team-2",
    name: "HMPL",
    logo: null,
    placeholder: "HMPL",
    color: "#1B8B9B",
    score: 65,
  },
};

export function LiveMatchModal() {
  const [liveCandidate, setLiveCandidate] = useState<MatchListItem | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const isTestMode =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).get("testLive") === "true";

    listMatches()
      .then((matches) => {
        if (!active) return;
        const target = findTargetLiveMatch(matches);

        if (target) {
          setLiveCandidate(target);
          const wasDismissed = !isTestMode && sessionStorage.getItem(`${DISMISS_KEY_PREFIX}${target.id}`) === "true";
          setDismissed(wasDismissed);
        } else if (isTestMode) {
          setLiveCandidate(MOCK_LIVE_MATCH);
          setDismissed(false);
        } else {
          setLiveCandidate(null);
        }
      })
      .catch(() => {
        if (!active) return;
        if (isTestMode) {
          setLiveCandidate(MOCK_LIVE_MATCH);
          setDismissed(false);
        } else {
          setLiveCandidate(null);
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const matchId = liveCandidate?.id && liveCandidate.id !== "test-live-match" ? liveCandidate.id : "";

  // Hubungkan SSE untuk update live score real-time jika match berstatus LIVE
  const { snapshot } = useMatchLive(matchId, false);

  const currentMatch = useMemo(() => {
    if (snapshot) return snapshot;
    return liveCandidate;
  }, [snapshot, liveCandidate]);

  if (!ready || !currentMatch || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    if (currentMatch) {
      sessionStorage.setItem(`${DISMISS_KEY_PREFIX}${currentMatch.id}`, "true");
    }
    setDismissed(true);
  };

  const team1Name = currentMatch.team1?.name || currentMatch.team1?.placeholder || "Team 1";
  const team2Name = currentMatch.team2?.name || currentMatch.team2?.placeholder || "Team 2";
  const team1Score = currentMatch.team1?.score ?? 0;
  const team2Score = currentMatch.team2?.score ?? 0;

  const quarterVal = "currentQuarter" in currentMatch ? currentMatch.currentQuarter : 1;
  const quarterText = formatQuarterBox(quarterVal);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Pertandingan Berlangsung"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="relative w-[min(95vw,1064px)] aspect-[1064/613] rounded-2xl sm:rounded-[36px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.65)] select-none"
        >
          {/* ── Background Modal Utuh (Full-bleed, scale sedikit untuk eliminasi subpixel gap) ── */}
          <Image
            src="/images/live-popup/popup-board-bleed.webp"
            alt="Live Match Board"
            fill
            priority
            className="object-cover object-center pointer-events-none select-none z-0 scale-[1.03]"
          />

          {/* ── Tombol Close Silang (X) di Posisi Figma Kanan Atas (Min 44px touch target di mobile) ── */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup pop up"
            className="absolute right-[1.5%] top-[1.5%] w-[7%] sm:w-[5.5%] aspect-square min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center cursor-pointer z-40 hover:bg-black/10 active:scale-90 transition-all"
          />

          {/* ═══ KARTU TIM 1 (KIRI) ═══
              Posisi pada area kartu putih: left: 8.44%, top: 22.99%, width: 23.35%, height: 54.18%
          */}
          <div className="absolute left-[8.44%] top-[22.99%] w-[23.35%] h-[54.18%] z-20 flex flex-col items-center justify-between p-[2%] sm:p-[4%] pointer-events-none overflow-hidden">
            {/* Logo Tim */}
            <div className="relative w-[48%] aspect-square shrink-0 flex items-center justify-center mt-[2%]">
              <TeamLogo
                src={currentMatch.team1?.logo}
                alt={`Logo ${team1Name}`}
                sizes="120px"
                className="object-contain drop-shadow-sm"
              />
            </div>

            {/* Nama Tim */}
            <p
              className="w-[90%] text-center text-black font-normal uppercase tracking-[2px] truncate text-[clamp(9px,1.4vw,18px)] leading-tight my-1"
              style={{ fontFamily: "var(--font-drowner)" }}
              title={team1Name}
            >
              {team1Name}
            </p>

            {/* Skor Tim: Terkunci di dalam kartu putih dengan flex container rapi */}
            <div className="w-full h-[32%] flex items-center justify-center mb-[4%]">
              <span
                className="font-bold tracking-wider select-none text-[clamp(18px,4.2vw,64px)] leading-none"
                style={{
                  fontFamily: '"DSEG7ClassicMini", monospace',
                  background: "linear-gradient(180deg, #F5D644 15%, #44D1D1 85%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.3))",
                }}
              >
                {team1Score}
              </span>
            </div>
          </div>

          {/* ═══ KOTAK SCOREBOARD QUARTER (TENGAH) ═══ */}
          <div className="absolute left-[45.19%] top-[39.97%] w-[9.61%] h-[20.06%] flex items-center justify-center select-none pointer-events-none z-20">
            <span
              className="text-white font-bold leading-none text-[clamp(18px,4.5vw,72px)] pt-0.5"
              style={{
                fontFamily: '"DSEG7ClassicMini", monospace',
                filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))",
              }}
            >
              {quarterText}
            </span>
          </div>

          {/* ═══ TOMBOL DETAIL GAME (LINK) (Min 44px tap target di mobile) ═══ */}
          <Link
            href={`/schedule-result-main/detail-game?id=${currentMatch.id}${
              currentMatch.scheduledAt ? `&date=${toWibFields(currentMatch.scheduledAt).date}` : ""
            }`}
            aria-label="Lihat Detail Pertandingan"
            className="absolute left-[40.60%] top-[74%] w-[18.72%] h-[8%] min-h-[44px] -translate-y-2 sm:translate-y-0 sm:top-[75.04%] sm:h-[6.85%] sm:min-h-0 rounded-xl cursor-pointer z-30 hover:brightness-110 active:scale-95 transition-all"
          />

          {/* ═══ KARTU TIM 2 (KANAN) ═══
              Posisi pada area kartu putih: left: 68.26%, top: 22.99%, width: 23.35%, height: 54.18%
          */}
          <div className="absolute left-[68.26%] top-[22.99%] w-[23.35%] h-[54.18%] z-20 flex flex-col items-center justify-between p-[2%] sm:p-[4%] pointer-events-none overflow-hidden">
            {/* Logo Tim */}
            <div className="relative w-[48%] aspect-square shrink-0 flex items-center justify-center mt-[2%]">
              <TeamLogo
                src={currentMatch.team2?.logo}
                alt={`Logo ${team2Name}`}
                sizes="120px"
                className="object-contain drop-shadow-sm"
              />
            </div>

            {/* Nama Tim */}
            <p
              className="w-[90%] text-center text-black font-normal uppercase tracking-[2px] truncate text-[clamp(9px,1.4vw,18px)] leading-tight my-1"
              style={{ fontFamily: "var(--font-drowner)" }}
              title={team2Name}
            >
              {team2Name}
            </p>

            {/* Skor Tim: Terkunci di dalam kartu putih dengan flex container rapi */}
            <div className="w-full h-[32%] flex items-center justify-center mb-[4%]">
              <span
                className="font-bold tracking-wider select-none text-[clamp(18px,4.2vw,64px)] leading-none"
                style={{
                  fontFamily: '"DSEG7ClassicMini", monospace',
                  background: "linear-gradient(180deg, #F5D644 15%, #44D1D1 85%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.3))",
                }}
              >
                {team2Score}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
