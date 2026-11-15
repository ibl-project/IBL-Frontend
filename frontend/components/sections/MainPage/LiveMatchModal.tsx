"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { X } from "lucide-react";

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

/**
 * Angka ala papan skor: nilai lama keluar ke bawah, nilai baru masuk dari atas.
 * `initial={false}` agar tidak beranimasi saat pop up pertama kali muncul.
 */
function FlipValue({
  value,
  className,
  style,
}: {
  value: string | number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "-70%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "70%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className={className}
          style={style}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Kartu tim berdenyut dan bersinar kuning sesaat setiap kali skornya bertambah. */
function BumpOnIncrease({
  value,
  className,
  children,
}: {
  value: number;
  className?: string;
  children: React.ReactNode;
}) {
  const controls = useAnimationControls();
  const prev = useRef(value);

  useEffect(() => {
    if (value > prev.current) {
      controls.start({
        scale: [1, 1.06, 1],
        filter: [
          "drop-shadow(0 0 0px rgba(245,214,68,0))",
          "drop-shadow(0 0 18px rgba(245,214,68,0.9))",
          "drop-shadow(0 0 0px rgba(245,214,68,0))",
        ],
        transition: { duration: 0.5, ease: "easeOut" },
      });
    }
    prev.current = value;
  }, [value, controls]);

  return (
    <motion.div animate={controls} className={className}>
      {children}
    </motion.div>
  );
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

  const isOpen = Boolean(ready && currentMatch && !dismissed);

  useEffect(() => {
    if (!isOpen || !currentMatch) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sessionStorage.setItem(`${DISMISS_KEY_PREFIX}${currentMatch.id}`, "true");
        setDismissed(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, currentMatch]);

  // AnimatePresence harus selalu ter-render agar animasi exit sempat berjalan saat pop up ditutup.
  return <AnimatePresence>{isOpen && currentMatch && renderModal(currentMatch)}</AnimatePresence>;

  function renderModal(currentMatch: NonNullable<typeof liveCandidate> | NonNullable<typeof snapshot>) {
    const handleDismiss = () => {
      sessionStorage.setItem(`${DISMISS_KEY_PREFIX}${currentMatch.id}`, "true");
      setDismissed(true);
    };

    const team1Name = currentMatch.team1?.name || currentMatch.team1?.placeholder || "Team 1";
    const team2Name = currentMatch.team2?.name || currentMatch.team2?.placeholder || "Team 2";
    const team1Score = currentMatch.team1?.score ?? 0;
    const team2Score = currentMatch.team2?.score ?? 0;

    const quarterVal = "currentQuarter" in currentMatch ? currentMatch.currentQuarter : 1;
    const quarterText = formatQuarterBox(quarterVal);

    return (
      <motion.div
        key="live-match-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.05 } }}
        transition={{ duration: 0.2 }}
        onClick={handleDismiss}
        className="fixed inset-0 z-[100] flex items-center justify-center p-5 sm:p-6 bg-black/65 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Pertandingan Berlangsung"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex w-[min(86vw,360px)] max-h-[calc(100dvh_-_48px)] flex-col overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#337796_0%,#3E88A8_24%,#FFFFFF_24.4%,#FFFFFF_26.5%,#F1AF2A_26.9%,#F8CC46_100%)] ring-1 ring-black/20 shadow-[0_24px_60px_rgba(0,0,0,0.7)] select-none sm:block sm:aspect-[1064/613] sm:max-h-none sm:w-[min(88vw,760px,calc(88vh_*_1064_/_613))] sm:rounded-[36px] sm:bg-none sm:bg-transparent sm:ring-0 [@media(min-width:640px)_and_(max-height:500px)]:block [@media(min-width:640px)_and_(max-height:500px)]:aspect-[1064/613] [@media(min-width:640px)_and_(max-height:500px)]:max-h-none [@media(min-width:640px)_and_(max-height:500px)]:w-[min(96vw,760px,calc(88vh_*_1064_/_613))] [@media(min-width:640px)_and_(max-height:500px)]:bg-none [@media(min-width:640px)_and_(max-height:500px)]:bg-transparent [@media(min-width:640px)_and_(max-height:500px)]:ring-0"
        >
          {/* ── Tombol Close Silang (X) — mobile 44px+, desktop lebih besar ── */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup pop up"
            className="absolute right-2 top-2 z-40 flex h-11 w-11 items-center justify-center rounded-full cursor-pointer transition-all hover:bg-black/10 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7E0202]/70 sm:right-[1.5%] sm:top-[0.5%] sm:h-auto sm:w-[7%] sm:aspect-square sm:min-h-[56px] sm:min-w-[56px]"
          >
            <X className="h-[60%] w-[60%] text-[#7E0202]" strokeWidth={3.5} strokeLinecap="round" />
          </button>

          {/* ══════ LAYOUT BOARD (desktop sm:+ & landscape pendek) ══════ */}
          <div className="absolute inset-0 hidden sm:block [@media(min-width:640px)_and_(max-height:500px)]:block">
            {/* ── Background board (art + frame kartu) — desktop saja ── */}
            <Image src="/images/live-popup/popup-board-nox.webp" alt="Live Match Board" fill priority className="object-cover object-center pointer-events-none select-none z-0 scale-[1.03]" />
            <BumpOnIncrease value={team1Score} className="absolute left-[7.15%] top-[22.99%] w-[23.38%] h-[54.18%] z-20 flex flex-col items-center justify-center gap-1.5 sm:gap-3 p-[2%] sm:p-[4%] pointer-events-none overflow-hidden">
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
              <FlipValue
                className="font-bold text-center select-none text-[clamp(18px,4.2vw,64px)] leading-none"
                style={{
                  fontFamily: '"DSEG7ClassicMini", monospace',
                  color: "#7E0202",
                  filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))",
                }}
                value={team1Score}
              />
            </div>
          </BumpOnIncrease>

          {/* ═══ KOTAK SCOREBOARD QUARTER (TENGAH) — sejajar dengan kotak hitam pada background ═══ */}
          <div className="absolute left-[44.16%] top-[39.72%] w-[11.82%] h-[21.04%] flex items-center justify-center select-none pointer-events-none z-20">
            <FlipValue
              value={quarterText}
              className="text-white font-bold text-center leading-none text-[clamp(18px,4.5vw,72px)]"
              style={{
                fontFamily: '"DSEG7ClassicMini", monospace',
                filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))",
                // Font 7-seg menaruh ink "1" di kanan cell (80.3% advance); geser agar ink di tengah.
                transform: quarterText === "1" ? "translateX(-30.3%)" : undefined,
              }}
            />
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
              Panel putih di aset: 68.45%–91.83%. Setelah scale 1.03: center 81.16%, left = 81.16 - 23.38/2.
          */}
          <BumpOnIncrease value={team2Score} className="absolute left-[69.47%] top-[22.99%] w-[23.38%] h-[54.18%] z-20 flex flex-col items-center justify-center gap-1.5 sm:gap-3 p-[2%] sm:p-[4%] pointer-events-none overflow-hidden">
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
              <FlipValue
                className="font-bold text-center select-none text-[clamp(18px,4.2vw,64px)] leading-none"
                style={{
                  fontFamily: '"DSEG7ClassicMini", monospace',
                  color: "#7E0202",
                  filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))",
                }}
                value={team2Score}
              />
            </div>
          </BumpOnIncrease>
          </div>

          {/* ══════ LAYOUT STACKED (mobile portrait <640px, tinggi >= 500px) ══════ */}
          <div className="relative z-20 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-4 pt-3.5 sm:hidden [@media(min-width:640px)_and_(max-height:500px)]:hidden">
            {/* Aksen sinar halus di background mobile (selaras Figma) */}
            <Image
              src="/images/live-popup/bright-rays.svg"
              alt=""
              fill
              aria-hidden="true"
              className="pointer-events-none select-none object-cover opacity-30 mix-blend-overlay"
            />

            {/* Header: LIVE · QRT · flip counter */}
            <div className="relative z-10 flex w-full items-center pr-10">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/40 bg-[linear-gradient(180deg,#9B0A0A_0%,#680202_100%)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B30] shadow-[0_0_6px_rgba(255,59,48,0.9)]" />
                Live
              </span>
              <div className="ml-auto flex items-center gap-2">
                <span
                  className="shrink-0 text-[18px] font-black uppercase tracking-[0.1em] text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]"
                  style={{
                    WebkitTextStroke: "3.5px #1E293B",
                    paintOrder: "stroke fill",
                  }}
                >
                  QRT
                </span>
                <span className="relative flex h-9 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/50 bg-[linear-gradient(180deg,#2A2A2E_0%,#141417_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_3px_8px_rgba(0,0,0,0.35)]">
                  <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-px bg-black/80" />
                  <FlipValue
                    value={quarterText}
                    className="relative z-10 text-white font-bold leading-none text-[24px]"
                    style={{
                      fontFamily: '"DSEG7ClassicMini", monospace',
                      filter: "drop-shadow(0 0 6px rgba(255,255,255,0.35))",
                      transform: quarterText === "1" ? "translateX(-30.3%)" : undefined,
                    }}
                  />
                </span>
              </div>
            </div>

            {/* Kartu Tim A */}
            <BumpOnIncrease
              value={team1Score}
              className="relative z-10 rounded-2xl border border-black/45 bg-[linear-gradient(180deg,#A1AAB3_0%,#6D7680_50%,#4B525A_100%)] p-[4px] shadow-[0_6px_14px_rgba(0,0,0,0.28)]"
            >
              <div className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-[12px] border border-black/70 bg-[linear-gradient(180deg,#FFFFFF_0%,#CAE4EE_75%,#A5C6D4_100%)] px-3 py-2.5 pointer-events-none">
                <div className="relative h-[52px] w-[52px] shrink-0 flex items-center justify-center">
                  <TeamLogo
                    src={currentMatch.team1?.logo}
                    alt={`Logo ${team1Name}`}
                    sizes="56px"
                    className="object-contain object-center drop-shadow-sm"
                  />
                </div>
                <p
                  className="min-w-0 truncate text-center text-base font-normal uppercase tracking-wide text-black"
                  style={{ fontFamily: "var(--font-drowner)" }}
                  title={team1Name}
                >
                  {team1Name}
                </p>
                <div className="flex min-w-[64px] items-center justify-end">
                  <FlipValue
                    value={team1Score}
                    className="select-none font-bold leading-none text-[42px]"
                    style={{
                      fontFamily: '"DSEG7ClassicMini", monospace',
                      color: "#7E0202",
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))",
                    }}
                  />
                </div>
              </div>
            </BumpOnIncrease>

            {/* Kartu Tim B */}
            <BumpOnIncrease
              value={team2Score}
              className="relative z-10 rounded-2xl border border-black/45 bg-[linear-gradient(180deg,#A1AAB3_0%,#6D7680_50%,#4B525A_100%)] p-[4px] shadow-[0_6px_14px_rgba(0,0,0,0.28)]"
            >
              <div className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-[12px] border border-black/70 bg-[linear-gradient(180deg,#FFFFFF_0%,#CAE4EE_75%,#A5C6D4_100%)] px-3 py-2.5 pointer-events-none">
                <div className="relative h-[52px] w-[52px] shrink-0 flex items-center justify-center">
                  <TeamLogo
                    src={currentMatch.team2?.logo}
                    alt={`Logo ${team2Name}`}
                    sizes="56px"
                    className="object-contain object-center drop-shadow-sm"
                  />
                </div>
                <p
                  className="min-w-0 truncate text-center text-base font-normal uppercase tracking-wide text-black"
                  style={{ fontFamily: "var(--font-drowner)" }}
                  title={team2Name}
                >
                  {team2Name}
                </p>
                <div className="flex min-w-[64px] items-center justify-end">
                  <FlipValue
                    value={team2Score}
                    className="select-none font-bold leading-none text-[42px]"
                    style={{
                      fontFamily: '"DSEG7ClassicMini", monospace',
                      color: "#7E0202",
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))",
                    }}
                  />
                </div>
              </div>
            </BumpOnIncrease>

            {/* Detail Game */}
            <Link
              href={"/schedule-result-main/detail-game?id=" + currentMatch.id + (currentMatch.scheduledAt ? "&date=" + toWibFields(currentMatch.scheduledAt).date : "")}
              className="relative z-10 mt-0.5 flex h-11 min-h-[44px] items-center justify-center rounded-xl border border-white/25 bg-[linear-gradient(180deg,#3A9BA6_0%,#1D6D7A_100%)] text-sm font-bold tracking-wide text-white shadow-[0_4px_12px_rgba(0,0,0,0.28)] cursor-pointer transition-all hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              Detail Game
            </Link>
          </div>
        </motion.div>
      </motion.div>
    );
  }
}
