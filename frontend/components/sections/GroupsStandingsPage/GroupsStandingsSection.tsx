"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { AnimatePresence, motion } from "framer-motion";

import { popPunchVariants, popSpringVariants } from "@/lib/animations";
import { useAsyncData, type AsyncState } from "@/lib/hooks/useAsyncData";
import { getPlayoffs, getStandings, toBracket } from "@/lib/standingsApi";

import { GroupStageGrid, StandingsTable } from "./ConferenceTable";
import { PlayoffBracket } from "./PlayoffBracket";

type ViewMode = "conference" | "playoff";

/** Teks di tengah papan selama data dimuat, gagal, atau masih kosong. */
function BoardMessage({ children, onRetry }: { children: React.ReactNode; onRetry?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-10 text-center text-sm font-bold text-[#658B9D] sm:text-base"
      style={{ fontFamily: "var(--font-poppins)" }}
    >
      <p>{children}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer rounded-full border-2 border-[#658B9D] px-5 py-1.5 text-xs uppercase transition-colors hover:bg-[#658B9D] hover:text-white sm:text-sm"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}

/** Isi papan menurut status muat; `render` hanya dipanggil saat data siap. */
function BoardContent<T>({
  state,
  onRetry,
  render,
}: {
  state: AsyncState<T>;
  onRetry: () => void;
  render: (data: T) => React.ReactNode;
}) {
  if (state.status === "loading") return <BoardMessage>Memuat data...</BoardMessage>;
  if (state.status === "error") return <BoardMessage onRetry={onRetry}>{state.message}</BoardMessage>;
  return <>{render(state.data)}</>;
}

function WoodPlankBar({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={`relative h-[24px] w-full overflow-hidden sm:h-[30px] ${
        position === "top" ? "border-b border-[#D8B98C]" : "border-t border-[#D8B98C]"
      }`}
      style={{
        background: "linear-gradient(180deg, #F9E8BD 0%, #EDCEAA 100%)",
      }}
    >
      {/* Halftone / Wood Grain Texture Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply"
        style={{
          backgroundImage: "url('/images/groups-standings/board-texture.png')",
          backgroundSize: "280px auto",
          backgroundRepeat: "repeat",
        }}
      />
      {/* Light edge highlight */}
      <div
        className={`absolute inset-x-0 ${
          position === "top" ? "top-0 border-t border-white/60" : "bottom-0 border-b border-black/15"
        }`}
      />
    </div>
  );
}

export function GroupsStandingsSection() {
  const [viewMode, setViewMode] = useState<ViewMode>("conference");
  const [conferenceIdx, setConferenceIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { state: standings, reload: reloadStandings } = useAsyncData(getStandings);
  const { state: playoffs, reload: reloadPlayoffs } = useAsyncData(getPlayoffs);

  const conferences = standings.status === "ready" ? standings.data.conferences : [];
  const activeConference = conferences[conferenceIdx] ?? conferences[0];
  const conferenceLabel = activeConference?.name ?? "Conference";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLabel = viewMode === "playoff" ? "PLAYOFF" : conferenceLabel.toUpperCase();

  return (
    <section
      className="relative min-h-screen w-full overflow-x-hidden pt-[var(--navbar-height)] pb-20"
      style={{
        backgroundColor: "#E4571A",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='292.57' height='292.57'%3E%3Crect width='146.285' height='146.285' fill='%237F0303'/%3E%3Crect x='146.285' y='146.285' width='146.285' height='146.285' fill='%237F0303'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "292.57px 292.57px",
      }}
    >
      {/* ── Subtle Top Vignette ────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.25) 0%, transparent 65%)",
          zIndex: 0,
        }}
        aria-hidden
      />

      {/* ── Header & Dropdown (Centered, max-w-1440px) ─────────────── */}
      <div className="relative z-40 mx-auto w-full max-w-[1440px] px-4 pt-6 sm:px-6 sm:pt-10 md:px-8 md:pt-14">
        {/* ── Page Header: GROUP & STANDING ────────────────────────── */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Left Rays: Punchy Pop-in + Organic Floating */}
            <motion.div
              initial="hidden"
              animate="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={popPunchVariants}
              custom={{ delay: 0.05, rotation: -6 }}
              className="relative z-10 -mr-1.5 h-[58px] w-[34px] shrink-0 sm:-mr-3 sm:h-[88px] sm:w-[52px] md:-mr-5 md:h-[120px] md:w-[72px]"
            >
              <motion.div
                animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-full w-full"
              >
                <Image
                  src="/images/groups-standings/rays-left.svg"
                  alt="left rays"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Title Banner Background: Spring Pop-in */}
            <motion.div
              initial="hidden"
              animate="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={popSpringVariants}
              custom={0.12}
              className="relative flex h-[78px] w-[300px] translate-x-0 items-center justify-center px-2 sm:h-[124px] sm:w-[560px] sm:translate-x-3 sm:px-10 md:h-[156px] md:w-[720px] md:translate-x-4 lg:w-[780px]"
            >
              <div className="relative flex h-full w-full items-center justify-center">
                <Image
                  src="/images/groups-standings/title-banner.svg"
                  alt="title banner"
                  fill
                  className="object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.4)]"
                  priority
                />
                {/* Text inside banner */}
                <h1
                  className="relative z-10 pt-1 pl-1 text-center text-[27px] leading-none tracking-normal uppercase select-none sm:pl-3 sm:text-[42px] md:text-[56px] lg:text-[62px]"
                  style={{
                    fontFamily: "var(--font-hollywood)",
                    backgroundImage: "linear-gradient(180deg, #CB0404 0%, #650202 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0px 2.5px 2px rgba(0,0,0,0.5))",
                  }}
                >
                  Group &amp; Standing
                </h1>
              </div>
            </motion.div>

            {/* Right Rays: Punchy Pop-in + Organic Floating */}
            <motion.div
              initial="hidden"
              animate="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={popPunchVariants}
              custom={{ delay: 0.18, rotation: 6 }}
              className="relative z-10 -ml-1.5 h-[58px] w-[34px] shrink-0 translate-x-0 sm:-ml-3 sm:h-[88px] sm:w-[52px] sm:translate-x-3 md:-ml-5 md:h-[120px] md:w-[72px] md:translate-x-4"
            >
              <motion.div
                animate={{ y: [4, -4, 4], rotate: [2, -2, 2] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="relative h-full w-full"
              >
                <Image
                  src="/images/groups-standings/rays-right.svg"
                  alt="right rays"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ── Conference Dropdown Button: Spring Pop-in ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={popSpringVariants}
          custom={0.22}
          className="relative z-50 mb-16 flex justify-center sm:mb-20 md:mb-24"
          ref={dropdownRef}
        >
          <div className="relative">
            <button
              type="button"
              id="conference-dropdown-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex h-[44px] w-[210px] cursor-pointer touch-manipulation items-center justify-center gap-2 px-4 drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] transition-all duration-75 select-none hover:scale-[1.03] focus:outline-none active:scale-[0.97] sm:h-[52px] sm:w-[260px] md:h-[56px] md:w-[290px]"
              style={{
                backgroundImage: "url('/images/groups-standings/dropdown-pill.svg')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span
                className="pt-0.5 text-[22px] tracking-wide uppercase select-none sm:text-[28px] md:text-[32px]"
                style={{
                  fontFamily: "var(--font-hollywood)",
                  color: "#877561",
                  WebkitTextStroke: "1.2px #FFFFFF",
                  textShadow: "0px 2px 3px rgba(0,0,0,0.45)",
                }}
              >
                {activeLabel}
              </span>
              <Image
                src="/images/groups-standings/dropdown-arrow.svg"
                alt=""
                width={26}
                height={22}
                aria-hidden
                className={`pointer-events-none h-auto w-[18px] shrink-0 object-contain transition-transform duration-200 sm:w-[20px] md:w-[22px] ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="animate-in fade-in zoom-in-95 absolute top-[50px] left-1/2 z-50 w-[210px] -translate-x-1/2 overflow-hidden rounded-[16px] border-[3px] border-[#877561] bg-[#FAF5E8] shadow-[0_12px_28px_rgba(0,0,0,0.4)] duration-150 sm:top-[58px] sm:w-[260px] md:top-[62px] md:w-[290px]">
                {conferences.map((conf, idx) => (
                  <button
                    key={conf.id}
                    type="button"
                    onClick={() => {
                      setViewMode("conference");
                      setConferenceIdx(idx);
                      setDropdownOpen(false);
                    }}
                    className={`w-full cursor-pointer touch-manipulation border-b border-[#D8CBB7] px-4 py-2.5 text-center text-[20px] tracking-wide uppercase transition-colors select-none last:border-b-0 active:bg-[#658B9D] active:text-white sm:py-3 sm:text-[24px] md:text-[28px] ${
                      viewMode === "conference" && conferenceIdx === idx
                        ? "bg-[#658B9D] text-white"
                        : "text-[#877561] hover:bg-[#EFE7D4]"
                    }`}
                    style={{
                      fontFamily: "var(--font-hollywood)",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {conf.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("playoff");
                    setDropdownOpen(false);
                  }}
                  className={`w-full cursor-pointer touch-manipulation px-4 py-2.5 text-center text-[20px] tracking-wide uppercase transition-colors select-none active:bg-[#658B9D] active:text-white sm:py-3 sm:text-[24px] md:text-[28px] ${
                    viewMode === "playoff" ? "bg-[#658B9D] text-white" : "text-[#877561] hover:bg-[#EFE7D4]"
                  }`}
                  style={{
                    fontFamily: "var(--font-hollywood)",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  Playoff
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── View Content: Conference or Playoff (Edge-to-Edge Full Width) ──── */}
      <div className="relative z-10 w-full px-0">
        <AnimatePresence mode="wait">
          {viewMode === "conference" ? (
            <motion.div
              key={`conf-${conferenceIdx}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28 }}
              className="flex w-full flex-col gap-16 sm:gap-24 md:gap-28"
            >
              {/* ══════════════════════════════════════════════════════════
                  SECTION 1: CONFERENCE GROUP STAGE
              ══════════════════════════════════════════════════════════ */}
              <div className="relative w-full">
                {/* Overlapping Top Ribbon Badge: Spring Pop-in */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={popSpringVariants}
                  custom={0.15}
                  className="pointer-events-none absolute -top-[30px] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center sm:-top-[42px]"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-[54px] w-[240px] rotate-[2.1deg] items-center justify-center sm:h-[72px] sm:w-[330px] md:h-[78px] md:w-[360px]">
                      <Image
                        src="/images/groups-standings/ribbon.svg"
                        alt="ribbon"
                        fill
                        className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                        priority
                      />
                      <span
                        className="relative z-10 pb-1 text-center text-[26px] tracking-normal uppercase select-none sm:text-[36px] md:text-[42px]"
                        style={{
                          fontFamily: "var(--font-hollywood)",
                          color: "#799BA7",
                          WebkitTextStroke: "1.4px #FFFFFF",
                          textShadow: "0 2.5px 3px rgba(0,0,0,0.5)",
                          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.35))",
                        }}
                      >
                        {conferenceLabel}
                      </span>
                    </div>
                    {/* Sub-label: GROUP STAGE */}
                    <div
                      className="mt-0 rotate-[1.5deg] text-[22px] tracking-normal uppercase select-none sm:mt-0.5 sm:text-[26px] md:text-[30px]"
                      style={{
                        fontFamily: "var(--font-hollywood)",
                        color: "#799BA7",
                        WebkitTextStroke: "1.3px #FFFFFF",
                        textShadow: "0 2px 2.5px rgba(0,0,0,0.5)",
                        filter: "drop-shadow(0 1.5px 1.5px rgba(0,0,0,0.3))",
                      }}
                    >
                      GROUP STAGE
                    </div>
                  </div>
                </motion.div>

                {/* Wood + Cream Paper Board Container - Full Width (Mentok ke ujung) */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  viewport={{ once: true, amount: 0.05 }}
                  variants={popSpringVariants}
                  custom={0.06}
                  className="relative w-full overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
                >
                  {/* Top Wood Plank Bar */}
                  <WoodPlankBar position="top" />

                  {/* Cream Paper Body */}
                  <div
                    className="relative w-full overflow-hidden px-3 pt-16 pb-10 sm:px-6 sm:pt-20 sm:pb-14 md:px-10 lg:px-12"
                    style={{
                      background: "linear-gradient(180deg, #FFFFFF 0%, #FAF7F0 35%, #F4EDE1 100%)",
                    }}
                  >
                    <BoardContent
                      state={standings}
                      onRetry={reloadStandings}
                      render={() =>
                        activeConference && activeConference.groups.length > 0 ? (
                          <GroupStageGrid groups={activeConference.groups} />
                        ) : (
                          <BoardMessage>Grup belum tersedia.</BoardMessage>
                        )
                      }
                    />
                  </div>

                  {/* Bottom Wood Plank Bar */}
                  <WoodPlankBar position="bottom" />
                </motion.div>
              </div>

              {/* ══════════════════════════════════════════════════════════
                  SECTION 2: CONFERENCE STANDINGS
              ══════════════════════════════════════════════════════════ */}
              <div className="relative w-full">
                {/* Overlapping Top Ribbon Badge: Spring Pop-in */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={popSpringVariants}
                  custom={0.15}
                  className="pointer-events-none absolute -top-[30px] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center sm:-top-[42px]"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-[54px] w-[240px] rotate-[2.1deg] items-center justify-center sm:h-[72px] sm:w-[330px] md:h-[78px] md:w-[360px]">
                      <Image
                        src="/images/groups-standings/ribbon.svg"
                        alt="ribbon"
                        fill
                        className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                        priority
                      />
                      <span
                        className="relative z-10 pb-1 text-center text-[26px] tracking-normal uppercase select-none sm:text-[36px] md:text-[42px]"
                        style={{
                          fontFamily: "var(--font-hollywood)",
                          color: "#799BA7",
                          WebkitTextStroke: "1.4px #FFFFFF",
                          textShadow: "0 2.5px 3px rgba(0,0,0,0.5)",
                          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.35))",
                        }}
                      >
                        {conferenceLabel}
                      </span>
                    </div>
                    {/* Sub-label: STANDINGS */}
                    <div
                      className="mt-0 rotate-[1.5deg] text-[22px] tracking-normal uppercase select-none sm:mt-0.5 sm:text-[26px] md:text-[30px]"
                      style={{
                        fontFamily: "var(--font-hollywood)",
                        color: "#799BA7",
                        WebkitTextStroke: "1.3px #FFFFFF",
                        textShadow: "0 2px 2.5px rgba(0,0,0,0.5)",
                        filter: "drop-shadow(0 1.5px 1.5px rgba(0,0,0,0.3))",
                      }}
                    >
                      STANDINGS
                    </div>
                  </div>
                </motion.div>

                {/* Wood + Cream Paper Board Container - Full Width (Mentok ke ujung) */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  viewport={{ once: true, amount: 0.05 }}
                  variants={popSpringVariants}
                  custom={0.06}
                  className="relative w-full overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
                >
                  {/* Top Wood Plank Bar */}
                  <WoodPlankBar position="top" />

                  {/* Cream Paper Body */}
                  <div
                    className="relative w-full overflow-hidden px-3 pt-16 pb-10 sm:px-6 sm:pt-20 sm:pb-14 md:px-10"
                    style={{
                      background: "linear-gradient(180deg, #FFFFFF 0%, #FAF7F0 35%, #F4EDE1 100%)",
                    }}
                  >
                    <BoardContent
                      state={standings}
                      onRetry={reloadStandings}
                      render={() =>
                        activeConference && activeConference.standings.length > 0 ? (
                          <StandingsTable teams={activeConference.standings} />
                        ) : (
                          <BoardMessage>Klasemen belum tersedia.</BoardMessage>
                        )
                      }
                    />
                  </div>

                  {/* Bottom Wood Plank Bar */}
                  <WoodPlankBar position="bottom" />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* ══════════════════════════════════════════════════════════
                PLAYOFF VIEW
            ══════════════════════════════════════════════════════════ */
            <motion.div
              key="playoff"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28 }}
              className="relative w-full"
            >
              {/* Overlapping Top Ribbon Badge: Standing playoff with Pop-in */}
              <motion.div
                initial="hidden"
                animate="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={popSpringVariants}
                custom={0.15}
                className="pointer-events-none absolute -top-[28px] left-1/2 z-20 flex -translate-x-1/2 items-center justify-center sm:-top-[40px] md:-top-[46px]"
              >
                <div className="relative flex h-[52px] w-[280px] items-center justify-center px-4 sm:h-[70px] sm:w-[440px] md:h-[82px] md:w-[520px]">
                  <Image
                    src="/images/groups-standings/playoff-badge-bg.svg"
                    alt="Standing playoff badge"
                    fill
                    className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
                    priority
                  />
                  <span
                    className="relative z-10 pt-0.5 text-center text-[20px] tracking-wider text-[#EC5D12] uppercase select-none sm:text-[32px] md:text-[40px]"
                    style={{
                      fontFamily: "var(--font-hollywood)",
                      textShadow: "0 2px 3px rgba(0,0,0,0.5)",
                      filter: "drop-shadow(0px 1.5px 2px rgba(0,0,0,0.4))",
                    }}
                  >
                    Standing playoff
                  </span>
                </div>
              </motion.div>

              {/* Wood + Cream Paper Board Container - Full Width (Mentok ke ujung) */}
              <motion.div
                initial="hidden"
                animate="visible"
                viewport={{ once: true, amount: 0.05 }}
                variants={popSpringVariants}
                custom={0.06}
                className="relative w-full overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
              >
                <WoodPlankBar position="top" />

                <div
                  className="relative w-full overflow-hidden px-2 pt-12 pb-6 sm:px-6 sm:pt-16 sm:pb-8"
                  style={{
                    background: "linear-gradient(180deg, #FFFFFF 0%, #FAF7F0 35%, #F4EDE1 100%)",
                  }}
                >
                  <BoardContent
                    state={playoffs}
                    onRetry={reloadPlayoffs}
                    render={(data) =>
                      data ? (
                        <PlayoffBracket data={toBracket(data)} />
                      ) : (
                        <BoardMessage>Bracket playoff belum tersedia.</BoardMessage>
                      )
                    }
                  />
                </div>

                <WoodPlankBar position="bottom" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
