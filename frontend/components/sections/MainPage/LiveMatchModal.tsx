"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { listMatches, type MatchListItem } from "@/lib/matchesApi";
import { useMatchLive } from "@/lib/hooks/useMatchLive";
import { todayWib, toWibFields } from "@/lib/datetime";
import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";

const DISMISS_KEY_PREFIX = "ibl_live_popup_dismissed_";

// Durasi perkiraan pertandingan basket (2.5 jam)
const MATCH_WINDOW_MS = 2.5 * 60 * 60 * 1000;

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
 * Cari pertandingan aktif yang sedang berlangsung hari ini:
 * Mengutamakan match hari ini (WIB) yang berstatus LIVE atau SCHEDULED yang jam mulainya sudah masuk.
 */
function findTargetLiveMatch(matches: MatchListItem[]): MatchListItem | null {
  const today = todayWib();

  // 1. Ambil pertandingan yang terjadwal untuk hari ini (WIB) yang belum FINISHED
  const todayMatches = matches.filter((m) => {
    if (m.status === "FINISHED") return false;
    const matchDate = toWibFields(m.scheduledAt).date;
    return matchDate === today;
  });

  if (todayMatches.length > 0) {
    // Prioritas 1A: Match hari ini yang statusnya LIVE
    const liveToday = todayMatches.find((m) => m.status === "LIVE");
    if (liveToday) return liveToday;

    // Prioritas 1B: Match hari ini yang jadwal mulainya sudah masuk (>= scheduledAt dan <= +2.5 jam)
    const now = Date.now();
    const ongoingToday = todayMatches
      .filter((m) => {
        if (!m.scheduledAt) return false;
        const time = new Date(m.scheduledAt).getTime();
        return now >= time && now <= time + MATCH_WINDOW_MS;
      })
      .sort((a, b) => {
        const timeA = new Date(a.scheduledAt!).getTime();
        const timeB = new Date(b.scheduledAt!).getTime();
        return Math.abs(now - timeA) - Math.abs(now - timeB);
      });

    if (ongoingToday.length > 0) return ongoingToday[0];

    // Prioritas 1C: Jika ada jadwal hari ini yang terdekat
    return todayMatches[0];
  }

  // 2. Fallback jika tidak ada match terjadwal hari ini: cari match LIVE apa pun
  const anyLive = matches.find((m) => m.status === "LIVE");
  return anyLive ?? null;
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
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/65 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Pertandingan Berlangsung"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="relative flex w-[calc(100vw_-_16px)] max-h-[calc(100dvh_-_32px)] flex-col overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_0%_0%,#3d86a8_0%,transparent_45%),linear-gradient(180deg,#F2A81D_0%,#F7D26A_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.65)] select-none sm:block sm:aspect-[1064/613] sm:max-h-none sm:w-[min(88vw,760px,calc(88vh_*_1064_/_613))] sm:rounded-[36px] sm:bg-transparent [@media(min-width:640px)_and_(max-height:500px)]:block [@media(min-width:640px)_and_(max-height:500px)]:aspect-[1064/613] [@media(min-width:640px)_and_(max-height:500px)]:max-h-none [@media(min-width:640px)_and_(max-height:500px)]:w-[min(96vw,760px,calc(88vh_*_1064_/_613))]"
        >
          {/* ── Tombol Close Silang (X) — mobile 48px, desktop lebih besar (min 44px touch target) ── */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup pop up"
            className="absolute right-1 top-1 z-40 flex h-12 w-12 items-center justify-center rounded-full cursor-pointer transition-all active:scale-90 sm:right-[1.5%] sm:top-[0.5%] sm:h-auto sm:w-[7%] sm:aspect-square sm:min-h-[56px] sm:min-w-[56px] sm:hover:bg-black/10"
          >
            <X className="h-[62%] w-[62%] text-[#7E0202]" strokeWidth={3.5} strokeLinecap="round" />
          </button>

          {/* ══════ LAYOUT BOARD (desktop sm:+ & landscape pendek) ══════ */}
          <div className="absolute inset-0 hidden sm:block [@media(min-width:640px)_and_(max-height:500px)]:block">
            {/* ── Background board (art + frame kartu) — desktop saja ── */}
            <Image
              src="/images/live-popup/popup-board-nox.webp"
              alt="Live Match Board"
              fill
              priority
              className="object-cover object-center pointer-events-none select-none z-0 scale-[1.03]"
            />
            {/* ═══ KARTU TIM 1 (KIRI) ═══
                Panel putih di aset: 8.17%–31.55%. Gambar background pakai scale 1.03 (object-cover),
                jadi posisinya bergeser ke luar: center panel jadi 18.84%, left = 18.84 - 23.38/2.
            */}
            <div className="absolute left-[7.15%] top-[22.99%] w-[23.38%] h-[54.18%] z-20 flex flex-col items-center justify-center gap-1.5 sm:gap-3 p-[2%] sm:p-[4%] pointer-events-none overflow-hidden">
            {/* Logo Tim */}
            <div className="relative w-[48%] aspect-square shrink-0 flex items-center justify-center">
              <TeamLogo
                src={currentMatch.team1?.logo}
                alt={`Logo ${team1Name}`}
                sizes="120px"
                className="object-contain object-center drop-shadow-sm"
              />
            </div>

            {/* Nama Tim */}
            <p
              className="w-full text-center text-black font-normal uppercase truncate text-[clamp(9px,1.4vw,18px)] leading-tight"
              style={{ fontFamily: "var(--font-drowner)" }}
              title={team1Name}
            >
              {team1Name}
            </p>

            {/* Skor Tim */}
            <div className="w-full flex items-center justify-center">
              <span
                className="font-bold text-center select-none text-[clamp(18px,4.2vw,64px)] leading-none"
                style={{
                  fontFamily: '"DSEG7ClassicMini", monospace',
                  color: "#7E0202",
                  filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))",
                }}
              >
                {team1Score}
              </span>
            </div>
          </div>

          {/* ═══ KOTAK SCOREBOARD QUARTER (TENGAH) — sejajar dengan kotak hitam pada background ═══ */}
          <div className="absolute left-[44.16%] top-[39.72%] w-[11.82%] h-[21.04%] flex items-center justify-center select-none pointer-events-none z-20">
            <span
              className="text-white font-bold text-center leading-none text-[clamp(18px,4.5vw,72px)]"
              style={{
                fontFamily: '"DSEG7ClassicMini", monospace',
                filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))",
                // Font 7-seg menaruh ink "1" di kanan cell (80.3% advance); geser agar ink di tengah.
                transform: quarterText === "1" ? "translateX(-30.3%)" : undefined,
              }}
            >
              {quarterText}
            </span>
          </div>

          {/* ═══ TOMBOL DETAIL GAME (LINK) (Min 44px tap target di mobile) ═══ */}
          <Link
            href={`/schedule-result?matchId=${currentMatch.id}`}
            aria-label="Lihat Detail Pertandingan"
            className="absolute left-[40.60%] top-[74%] w-[18.72%] h-[8%] min-h-[44px] -translate-y-2 sm:translate-y-0 sm:top-[75.04%] sm:h-[6.85%] sm:min-h-0 rounded-xl cursor-pointer z-30 hover:brightness-110 active:scale-95 transition-all"
          />

          {/* ═══ KARTU TIM 2 (KANAN) ═══
              Panel putih di aset: 68.45%–91.83%. Setelah scale 1.03: center 81.16%, left = 81.16 - 23.38/2.
          */}
          <div className="absolute left-[69.47%] top-[22.99%] w-[23.38%] h-[54.18%] z-20 flex flex-col items-center justify-center gap-1.5 sm:gap-3 p-[2%] sm:p-[4%] pointer-events-none overflow-hidden">
            {/* Logo Tim */}
            <div className="relative w-[48%] aspect-square shrink-0 flex items-center justify-center">
              <TeamLogo
                src={currentMatch.team2?.logo}
                alt={`Logo ${team2Name}`}
                sizes="120px"
                className="object-contain object-center drop-shadow-sm"
              />
            </div>

            {/* Nama Tim */}
            <p
              className="w-full text-center text-black font-normal uppercase truncate text-[clamp(9px,1.4vw,18px)] leading-tight"
              style={{ fontFamily: "var(--font-drowner)" }}
              title={team2Name}
            >
              {team2Name}
            </p>

            {/* Skor Tim */}
            <div className="w-full flex items-center justify-center">
              <span
                className="font-bold text-center select-none text-[clamp(18px,4.2vw,64px)] leading-none"
                style={{
                  fontFamily: '"DSEG7ClassicMini", monospace',
                  color: "#7E0202",
                  filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))",
                }}
              >
                {team2Score}
              </span>
            </div>
          </div>
          </div>

          {/* ══════ LAYOUT STACKED (mobile portrait <640px, tinggi >= 500px) ══════ */}
          <div className="relative z-20 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-3 sm:hidden [@media(min-width:640px)_and_(max-height:500px)]:hidden">
            {/* Header: LIVE · QRT · flip counter */}
            <div className="flex items-center gap-2 pr-12">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#7E0202] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Live
              </span>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.24em] text-[#1a1a1a]/70">
                QRT
              </span>
              <span className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md bg-[#17171A] ring-1 ring-black/20">
                <span
                  className="text-white font-bold leading-none text-[22px]"
                  style={{
                    fontFamily: '"DSEG7ClassicMini", monospace',
                    transform: quarterText === "1" ? "translateX(-30.3%)" : undefined,
                  }}
                >
                  {quarterText}
                </span>
              </span>
            </div>

            {/* Kartu Tim A */}
            <div className="flex items-center gap-3 rounded-xl border-[3px] border-[#8A8A8A] bg-[linear-gradient(180deg,#FFFFFF_0%,#E7F0F6_100%)] px-3 py-2.5 pointer-events-none">
              <div className="relative h-14 w-14 shrink-0">
                <TeamLogo
                  src={currentMatch.team1?.logo}
                  alt={`Logo ${team1Name}`}
                  sizes="64px"
                  className="object-contain object-center"
                />
              </div>
              <p className="min-w-0 flex-1 truncate text-base font-bold text-[#1a1a1a]" title={team1Name}>
                {team1Name}
              </p>
              <span
                className="shrink-0 select-none font-bold leading-none text-[48px]"
                style={{ fontFamily: '"DSEG7ClassicMini", monospace', color: "#7E0202" }}
              >
                {team1Score}
              </span>
            </div>

            {/* Kartu Tim B */}
            <div className="flex items-center gap-3 rounded-xl border-[3px] border-[#8A8A8A] bg-[linear-gradient(180deg,#FFFFFF_0%,#E7F0F6_100%)] px-3 py-2.5 pointer-events-none">
              <div className="relative h-14 w-14 shrink-0">
                <TeamLogo
                  src={currentMatch.team2?.logo}
                  alt={`Logo ${team2Name}`}
                  sizes="64px"
                  className="object-contain object-center"
                />
              </div>
              <p className="min-w-0 flex-1 truncate text-base font-bold text-[#1a1a1a]" title={team2Name}>
                {team2Name}
              </p>
              <span
                className="shrink-0 select-none font-bold leading-none text-[48px]"
                style={{ fontFamily: '"DSEG7ClassicMini", monospace', color: "#7E0202" }}
              >
                {team2Score}
              </span>
            </div>

            {/* Detail Game */}
            <Link
              href={`/schedule-result?matchId=${currentMatch.id}`}
              className="flex h-11 items-center justify-center rounded-xl bg-[#2E8B94] text-sm font-semibold text-white cursor-pointer transition-all active:scale-95"
            >
              Detail Game
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
