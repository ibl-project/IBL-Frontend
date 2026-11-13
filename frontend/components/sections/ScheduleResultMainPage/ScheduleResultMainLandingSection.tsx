"use client";

import { type ReactNode, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { popSpringVariants, popPunchVariants } from "@/lib/animations";
import { todayWib } from "@/lib/datetime";
import { HOLLYWOOD_BOLD_ADVANCE, textWidthEm } from "@/lib/fontMetrics";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { formatKickoff, teamLabel } from "@/lib/matchDisplay";
import { type MatchListItem, type MatchTeamSide, isLiveNow, listMatches } from "@/lib/matchesApi";
import { useLiveScores } from "@/lib/hooks/useLiveScores";
import { formatMatchDay, groupMatchesByWibDay, pickDefaultDay } from "@/lib/scheduleDays";
import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";
import { CalendarStrip } from "./CalendarStrip";

const CARD_FRAMES = ["/svg/figma/Box Tim 12.svg", "/svg/figma/Box Tim 34.svg"];

/**
 * Nama tim di kartu harus tetap di dalam panel kuning frame (Box Tim 12/34.svg). Panel itu miring: di baris nama
 * (57,5-69,6% tinggi kartu) tepi kirinya 8,5-9,7% dan tepi kanannya 93,2-94,1% lebar kartu. Skor 3 digit
 * menempati 22,6-30,4% / 69,6-77,4%. Jadi kotak nama: kiri 10-22,5%, kanan 80-92,5% (lebar NAME_BOX).
 */
const NAME_BOX = 12.5;
/** Ukuran desain 22 px pada kartu selebar 1026 px, dalam cqw kartu. */
const NAME_FONT_CQW = 2.144;

/**
 * Ukuran font nama: ukuran desain (minimum 9 px di ponsel), dikecilkan hanya kalau nama tidak muat di kotaknya
 * (lebar dari huruf Hollywood Bold + tracking-wide 0,025em); paling kecil 7 px, setelah itu `truncate` memberi "…".
 * Memakai cqw kartu, bukan vw, supaya ukuran ikut lebar kartu.
 */
function cardNameFontSize(name: string): string {
  const em = textWidthEm(HOLLYWOOD_BOLD_ADVANCE, name, 0.025);
  return `max(7px, min(max(9px, ${NAME_FONT_CQW}cqw), ${(NAME_BOX / em).toFixed(3)}cqw))`;
}

function MatchCard({ match, frame, dateKey }: { match: MatchListItem; frame: string; dateKey: string }) {
  const { team1, team2, status } = match;
  // Match LIVE yang belum di-scoring siapa pun (0–0, tanpa sesi) tampil seperti belum dimulai.
  const live = isLiveNow(match);
  const showScore = live || status === "FINISHED";
  // Nama tim yang kalah sedikit diredupkan setelah laga selesai.
  const dimmed = (side: MatchTeamSide) =>
    status === "FINISHED" && match.winnerTeamId && side.id !== match.winnerTeamId ? "opacity-60" : "";

  return (
    <motion.article
      aria-label={`${teamLabel(team1)} vs ${teamLabel(team2)}, ${formatKickoff(match.scheduledAt)}`}
      whileHover={{ scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className="@container/card relative w-full"
    >
      <Image
        src={frame}
        alt=""
        width={1026}
        height={327}
        className="block h-auto w-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        loading="eager"
      />
      <div className="absolute inset-0 text-center text-[#101010]">
        {/* Sisi Kiri: Logo Tim 1 & Nama Tim 1 (Sepenuhnya di dalam boks kuning) */}
        <div className="absolute left-[14%] top-[30.5%] -translate-x-1/2 aspect-[73/77] h-[25%] pointer-events-none">
          <TeamLogo src={team1.logo} alt={`Logo ${teamLabel(team1)}`} sizes="75px" />
        </div>
        <p
          title={teamLabel(team1)}
          style={{ fontSize: cardNameFontSize(teamLabel(team1)) }}
          className={`absolute left-[10%] top-[57.5%] w-[12.5%] truncate text-center font-hollywood font-bold tracking-wide text-[#074770] [text-shadow:1px_1px_0_#FFF3D2,0_1px_2px_rgba(0,0,0,0.18)] leading-tight ${dimmed(team1)}`}
        >
          {teamLabel(team1)}
        </p>

        {/* Skor Tim 1 (Di sebelah kanan logo Tim 1) */}
        {showScore && (
          <div className="absolute left-[26.5%] top-[48.5%] -translate-x-1/2 -translate-y-1/2 font-crosner text-[clamp(30px,5vw,72px)] font-black text-[#760807] [text-shadow:2px_2px_0_#FFF3D2,4px_4px_0_rgba(56,6,6,0.25)] leading-none select-none tracking-tight">
            {team1.score}
          </div>
        )}

        {/* Blok Tengah: Venue, Kickoff, dan Game Detail. Ukuran minimum di ponsel mengikuti main (lokasi 12 px, kickoff 10 px). */}
        <p className="absolute left-[29.5%] right-[29.5%] top-[30.5%] truncate font-hollywood text-[clamp(12px,1.25vw,18px)] leading-tight text-[#147f83] [text-shadow:1px_1px_0_#fff3d2]">
          {match.venue ?? "Lokasi belum diatur"}
        </p>
        <p className="absolute left-[29.5%] right-[29.5%] top-[41.5%] flex items-center justify-center gap-1 sm:gap-1.5 font-poppins text-[clamp(10px,0.95vw,14px)] font-extrabold leading-tight tracking-tight">
          {live && (
            <span className="shrink-0 rounded-[3px] bg-[#c51610] px-[0.35em] py-[0.05em] font-poppins text-[0.7em] font-bold tracking-wider text-white shadow-xs">
              LIVE
            </span>
          )}
          <span className="shrink-0">{formatKickoff(match.scheduledAt)}</span>
        </p>
        {/* Teks 9 px; area sentuh tak terlihat (before:) membuat tinggi target >= 24 px (WCAG 2.5.8) tanpa mengubah tampilan. */}
        <Link
          href={`/schedule-result-main/detail-game?id=${match.id}&date=${dateKey}`}
          className="absolute left-1/2 top-[54%] -translate-x-1/2 rounded-[3.5px] border border-[#f6c475] bg-gradient-to-b from-[#c51610] to-[#760807] px-1.5 py-[1px] font-poppins text-[9px] font-semibold text-white before:absolute before:-inset-x-1 before:-inset-y-1 before:content-[''] shadow-[0_1px_0_rgba(0,0,0,.22)] transition-[transform,background-color] hover:scale-[1.07] hover:from-[#d6211b] hover:to-[#8a0a09] active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44D1D1] sm:rounded-[6px] sm:px-[clamp(9px,1.3vw,18px)] sm:py-[clamp(2.5px,0.3vw,4.5px)] sm:text-[clamp(8.5px,0.85vw,12px)] sm:shadow-[0_2px_0_rgba(0,0,0,.28)]"
        >
          Game Detail
        </Link>

        {/* Skor Tim 2 (Di sebelah kiri logo Tim 2) */}
        {showScore && (
          <div className="absolute left-[73.5%] top-[48.5%] -translate-x-1/2 -translate-y-1/2 font-crosner text-[clamp(30px,5vw,72px)] font-black text-[#760807] [text-shadow:2px_2px_0_#FFF3D2,4px_4px_0_rgba(56,6,6,0.25)] leading-none select-none tracking-tight">
            {team2.score}
          </div>
        )}

        {/* Sisi Kanan: Logo Tim 2 & Nama Tim 2 (Sepenuhnya di dalam boks kuning) */}
        <div className="absolute left-[86%] top-[31%] -translate-x-1/2 aspect-[73/77] h-[25%] pointer-events-none">
          <TeamLogo src={team2.logo} alt={`Logo ${teamLabel(team2)}`} sizes="75px" />
        </div>
        <p
          title={teamLabel(team2)}
          style={{ fontSize: cardNameFontSize(teamLabel(team2)) }}
          className={`absolute left-[80%] top-[57.5%] w-[12.5%] truncate text-center font-hollywood font-bold tracking-wide text-[#074770] [text-shadow:1px_1px_0_#FFF3D2,0_1px_2px_rgba(0,0,0,0.18)] leading-tight ${dimmed(team2)}`}
        >
          {teamLabel(team2)}
        </p>
      </div>
    </motion.article>
  );
}

/** Pembungkus kalender: animasi masuk + lebar strip (naik terus sampai 978px). */
function CalendarBlock({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={popSpringVariants}
      custom={0.12}
      className="relative z-0 -mt-0 w-[min(96vw,978px)] drop-shadow-[0_6px_16px_rgba(0,0,0,0.1)] md:-mt-[3vw] lg:-mt-[1.2vw]"
    >
      {children}
    </motion.div>
  );
}

function MatchesBanner() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={popPunchVariants}
      custom={{ delay: 0.22, rotation: -2 }}
    >
      <Image
        src="/svg/figma/matches.svg"
        alt="Matches"
        width={319}
        height={94}
        className="mt-3 h-auto w-[44vw] max-w-[319px] sm:mt-5 sm:w-[30vw]"
        loading="eager"
      />
    </motion.div>
  );
}

/** Tampilan sementara saat ?date= dibaca (Suspense): kalender kosong + banner. */
function ScheduleFallback() {
  return (
    <>
      <CalendarBlock>
        <CalendarStrip days={[]} selectedKey={null} onSelect={() => {}} status="loading" />
      </CalendarBlock>
      <MatchesBanner />
    </>
  );
}

const LIVE_REFRESH_MS = 60_000;

/**
 * Kalender hari pertandingan + daftar laga hari terpilih, dari GET /matches. Hari terpilih
 * disimpan di ?date= supaya bertahan saat reload. Data diperbarui diam-diam saat tab kembali
 * aktif dan tiap 60 detik selama ada laga LIVE di hari terpilih (gagal refresh tidak mengganti
 * tampilan dengan error).
 */
function MatchDaySchedule() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion() ?? false;
  const listRef = useRef<HTMLDivElement>(null);

  const { state, reload, setState } = useAsyncData(listMatches);
  const { days, unscheduled } = useMemo(
    () => (state.status === "ready" ? groupMatchesByWibDay(state.data) : { days: [], unscheduled: [] }),
    [state],
  );

  const [today] = useState(todayWib);
  const [picked, setPicked] = useState<string | null>(null);
  const selectedKey = pickDefaultDay(days, picked ?? searchParams.get("date"), today);
  const selectedDay = days.find((day) => day.dateKey === selectedKey);

  const selectDay = (dateKey: string) => {
    setPicked(dateKey);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dateKey);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    // Daftar laga di luar layar (ponsel, layar laptop pendek): gulir ke sana.
    const list = listRef.current;
    if (list && list.getBoundingClientRect().top > window.innerHeight) {
      list.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  const refreshSilently = useCallback(() => {
    listMatches().then(
      (data) => setState({ status: "ready", data }),
      () => {},
    );
  }, [setState]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshSilently();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshSilently]);

  const hasLiveMatch = selectedDay?.matches.some((match) => match.status === "LIVE") ?? false;
  useEffect(() => {
    if (!hasLiveMatch) return;
    const timer = setInterval(refreshSilently, LIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [hasLiveMatch, refreshSilently]);

  // Skor kartu LIVE berubah begitu scorer mengetuk (SSE). Refresh 60 detik di atas tetap
  // untuk match yang baru dimulai dan tanda LIVE (liveNow).
  const liveIds = useMemo(
    () => selectedDay?.matches.filter((match) => match.status === "LIVE").map((match) => match.id) ?? [],
    [selectedDay],
  );
  const patchMatches = useCallback(
    (update: (items: MatchListItem[]) => MatchListItem[]) =>
      setState((prev) => (prev.status === "ready" ? { status: "ready", data: update(prev.data) } : prev)),
    [setState],
  );
  useLiveScores(liveIds, patchMatches);

  return (
    <>
      <CalendarBlock>
        <CalendarStrip
          days={days}
          selectedKey={selectedKey}
          onSelect={selectDay}
          status={state.status}
          onRetry={reload}
        />
      </CalendarBlock>

      <MatchesBanner />

      {/* Laga hari terpilih: jumlah kartu selalu sama dengan "N laga" di kotak tanggalnya. */}
      <div
        ref={listRef}
        className="mt-2 flex w-[94vw] max-w-[1026px] scroll-mt-[calc(var(--navbar-height)+12px)] flex-col sm:w-[72vw] md:mt-[1.5vw] lg:w-[72vw]"
      >
        {selectedDay?.matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={popSpringVariants}
            custom={0.25 + index * 0.14}
            className={index > 0 ? "mt-4 sm:mt-6" : ""}
          >
            <MatchCard
              match={match}
              frame={CARD_FRAMES[index % CARD_FRAMES.length]}
              dateKey={selectedDay.dateKey}
            />
          </motion.div>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {selectedDay ? `${selectedDay.matches.length} laga pada ${formatMatchDay(selectedDay)}` : ""}
      </p>

      {state.status === "ready" && unscheduled.length > 0 && (
        <p className="mt-4 font-poppins text-sm font-semibold text-[#760807]">
          {unscheduled.length} laga belum dijadwalkan
        </p>
      )}
    </>
  );
}

/** Satu blok latar: gambar atas (sampai awal blok merah) lalu pita merah bertekstur yang diulang ke bawah. */
function BackgroundBlock({ mirrored }: { mirrored: boolean }) {
  return (
    <div className={`flex h-full w-[clamp(1100px,100vw,1440px)] shrink-0 flex-col ${mirrored ? "-scale-x-100" : ""}`}>
      <Image
        src="/images/Backgroundschedule-top.png"
        alt=""
        width={1440}
        height={1090}
        priority
        className="h-auto w-full shrink-0"
      />
      <div
        className="min-h-0 flex-1 bg-[#f3e6ce]"
        style={{
          backgroundImage: "url(/images/Backgroundschedule-tile.png)",
          backgroundSize: "100% auto",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "top center",
        }}
      />
    </div>
  );
}

export const ScheduleResultMainLandingSection = () => {
  return (
    <section
      aria-label="Schedule and Result"
      className="relative isolate overflow-hidden bg-[#f3e6ce] pb-5 pt-[calc(var(--navbar-height)+12px)] md:pt-[calc(var(--navbar-height)+12px)] lg:pt-[calc(var(--navbar-height)+16px)] sm:pb-6"
    >
      {/* Latar: lebar satu blok dikunci clamp(1100px, 100vw, 1440px) supaya skala mengikuti isi halaman (yang
          juga berhenti membesar di 1440px) dan tidak melar saat zoom out. Layar lebih lebar diisi blok cermin di kiri-kanan. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 z-0 flex -translate-x-1/2">
        {[true, false, true].map((mirrored, i) => (
          <BackgroundBlock key={i} mirrored={mirrored} />
        ))}
      </div>
      <div className="relative z-10 mx-auto flex w-full flex-col items-center">
        {/* Title: SCHEDULE & RESULT (Entrance Pop Animation only, no continuous float) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={popSpringVariants}
          custom={0}
          className="flex justify-center"
        >
          <Image
            src="/svg/figma/schedule & result.svg"
            alt="Schedule and Result"
            width={891}
            height={136}
            sizes="(max-width: 639px) 88vw, (max-width: 1023px) 64vw, 891px"
            className="h-auto w-[88vw] max-w-[891px] sm:w-[64vw]"
            priority
          />
        </motion.div>

        {/* Kalender, banner MATCHES, dan daftar laga berbagi hari terpilih (?date=), jadi
            ketiganya di dalam Suspense supaya halaman tetap bisa di-prerender. */}
        <Suspense fallback={<ScheduleFallback />}>
          <MatchDaySchedule />
        </Suspense>
      </div>
    </section>
  );
};
