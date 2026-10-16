"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { popSpringVariants, popPunchVariants } from "@/lib/animations";
import { CONFERENCES, PLAYOFF_ROUNDS, getStandings } from "./mock-data";
import { GroupStageGrid, StandingsTable } from "./ConferenceTable";
import { PlayoffBracket } from "./PlayoffBracket";

type ViewMode = "conference" | "playoff";

function WoodPlankBar({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={`relative w-full h-[24px] sm:h-[30px] overflow-hidden ${
        position === "top"
          ? "border-b border-[#D8B98C]"
          : "border-t border-[#D8B98C]"
      }`}
      style={{
        background: "linear-gradient(180deg, #F9E8BD 0%, #EDCEAA 100%)",
      }}
    >
      {/* Halftone / Wood Grain Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.14] pointer-events-none mix-blend-multiply"
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

  const activeConference = CONFERENCES[conferenceIdx] || CONFERENCES[0];
  const standingsTeams = getStandings(activeConference);

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

  const activeLabel = viewMode === "playoff" ? "PLAYOFF" : activeConference.label.toUpperCase();

  return (
    <section
      className="relative w-full min-h-screen pb-20 overflow-x-hidden pt-[var(--navbar-height)]"
      style={{
        backgroundColor: "#E4571A",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='292.57' height='292.57'%3E%3Crect width='146.285' height='146.285' fill='%237F0303'/%3E%3Crect x='146.285' y='146.285' width='146.285' height='146.285' fill='%237F0303'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "292.57px 292.57px",
      }}
    >
      {/* ── Subtle Top Vignette ────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.25) 0%, transparent 65%)",
          zIndex: 0,
        }}
        aria-hidden
      />

      {/* ── Header & Dropdown (Centered, max-w-1440px) ─────────────── */}
      <div className="relative z-40 mx-auto w-full max-w-[1440px] pt-6 sm:pt-10 md:pt-14 px-4 sm:px-6 md:px-8">
        {/* ── Page Header: GROUP & STANDING ────────────────────────── */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative flex items-center justify-center">
            {/* Left Rays: Punchy Pop-in + Organic Floating */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={popPunchVariants}
              custom={{ delay: 0.05, rotation: -6 }}
              className="relative -mr-3 sm:-mr-6 md:-mr-10 z-10 w-[34px] sm:w-[52px] md:w-[72px] h-[58px] sm:h-[88px] md:h-[120px] shrink-0"
            >
              <motion.div
                animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full"
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
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={popSpringVariants}
              custom={0.12}
              className="relative w-[280px] sm:w-[520px] md:w-[680px] lg:w-[740px] h-[72px] sm:h-[115px] md:h-[146px] flex items-center justify-center px-2 sm:px-8 translate-x-0 sm:translate-x-3 md:translate-x-4"
            >
              <div className="w-full h-full relative flex items-center justify-center">
                <Image
                  src="/images/groups-standings/title-banner.svg"
                  alt="title banner"
                  fill
                  className="object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.4)]"
                  priority
                />
                {/* Text inside banner */}
                <h1
                  className="relative z-10 text-2xl sm:text-5xl md:text-[68px] lg:text-[76px] leading-none tracking-normal uppercase text-center select-none pt-1 pl-1 sm:pl-3"
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
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={popPunchVariants}
              custom={{ delay: 0.18, rotation: 6 }}
              className="relative -ml-3 sm:-ml-6 md:-ml-10 z-10 w-[34px] sm:w-[52px] md:w-[72px] h-[58px] sm:h-[88px] md:h-[120px] shrink-0 translate-x-0 sm:translate-x-3 md:translate-x-4"
            >
              <motion.div
                animate={{ y: [4, -4, 4], rotate: [2, -2, 2] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="relative w-full h-full"
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
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={popSpringVariants}
          custom={0.22}
          className="flex justify-center mb-16 sm:mb-20 md:mb-24 relative z-50"
          ref={dropdownRef}
        >
          <div className="relative">
            <button
              type="button"
              id="conference-dropdown-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-[280px] sm:w-[340px] md:w-[380px] h-[58px] sm:h-[66px] md:h-[72px] flex items-center justify-center gap-3 px-6 transition-all duration-75 focus:outline-none cursor-pointer drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] hover:scale-[1.03] active:scale-[0.97] touch-manipulation select-none"
              style={{
                backgroundImage: "url('/images/groups-standings/dropdown-pill.svg')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span
                className="text-[30px] sm:text-[38px] md:text-[44px] tracking-wide uppercase select-none pt-0.5"
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
                className={`object-contain transition-transform duration-200 pointer-events-none shrink-0 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-[66px] sm:top-[74px] md:top-[80px] z-50 w-[280px] sm:w-[340px] md:w-[380px] bg-[#FAF5E8] border-[3px] border-[#877561] rounded-[16px] shadow-[0_12px_28px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                {CONFERENCES.map((conf, idx) => (
                  <button
                    key={conf.label}
                    type="button"
                    onClick={() => {
                      setViewMode("conference");
                      setConferenceIdx(idx);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-center py-3.5 sm:py-4 px-4 text-[26px] sm:text-[32px] md:text-[36px] tracking-wide uppercase transition-colors cursor-pointer border-b border-[#D8CBB7] last:border-b-0 touch-manipulation select-none active:bg-[#658B9D] active:text-white ${
                      viewMode === "conference" && conferenceIdx === idx
                        ? "bg-[#658B9D] text-white"
                        : "text-[#877561] hover:bg-[#EFE7D4]"
                    }`}
                    style={{
                      fontFamily: "var(--font-hollywood)",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {conf.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("playoff");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-center py-3.5 sm:py-4 px-4 text-[26px] sm:text-[32px] md:text-[36px] tracking-wide uppercase transition-colors cursor-pointer touch-manipulation select-none active:bg-[#658B9D] active:text-white ${
                    viewMode === "playoff"
                      ? "bg-[#658B9D] text-white"
                      : "text-[#877561] hover:bg-[#EFE7D4]"
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
              className="flex flex-col gap-16 sm:gap-24 md:gap-28 w-full"
            >
              {/* ══════════════════════════════════════════════════════════
                  SECTION 1: CONFERENCE GROUP STAGE
              ══════════════════════════════════════════════════════════ */}
              <div className="relative w-full">
                {/* Overlapping Top Ribbon Badge: Spring Pop-in */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.2 }}
                  variants={popSpringVariants}
                  custom={0.15}
                  className="absolute left-1/2 -translate-x-1/2 -top-[30px] sm:-top-[42px] z-20 flex flex-col items-center pointer-events-none"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative w-[240px] sm:w-[330px] md:w-[360px] h-[54px] sm:h-[72px] md:h-[78px] flex items-center justify-center rotate-[2.1deg]">
                      <Image
                        src="/images/groups-standings/ribbon.svg"
                        alt="ribbon"
                        fill
                        className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                        priority
                      />
                      <span
                        className="relative z-10 text-[26px] sm:text-[36px] md:text-[42px] tracking-normal uppercase select-none text-center pb-1"
                        style={{
                          fontFamily: "var(--font-hollywood)",
                          color: "#799BA7",
                          WebkitTextStroke: "1.4px #FFFFFF",
                          textShadow: "0 2.5px 3px rgba(0,0,0,0.5)",
                          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.35))",
                        }}
                      >
                        {activeConference.label}
                      </span>
                    </div>
                    {/* Sub-label: GROUP STAGE */}
                    <div
                      className="text-xs sm:text-[18px] md:text-[21px] uppercase tracking-normal select-none -mt-1 sm:-mt-1.5 rotate-[1.5deg]"
                      style={{
                        fontFamily: "var(--font-hollywood)",
                        color: "#799BA7",
                        WebkitTextStroke: "1.1px #FFFFFF",
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
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.08 }}
                  variants={popSpringVariants}
                  custom={0.06}
                  className="w-full relative shadow-[0_12px_32px_rgba(0,0,0,0.3)] overflow-hidden"
                >
                  {/* Top Wood Plank Bar */}
                  <WoodPlankBar position="top" />

                  {/* Cream Paper Body */}
                  <div
                    className="w-full pt-14 sm:pt-18 pb-10 sm:pb-14 px-3 sm:px-6 md:px-10 lg:px-12 relative overflow-hidden"
                    style={{
                      background: "linear-gradient(180deg, #FFFFFF 0%, #FAF7F0 35%, #F4EDE1 100%)",
                    }}
                  >
                    <GroupStageGrid groups={activeConference.groups} />
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
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.2 }}
                  variants={popSpringVariants}
                  custom={0.15}
                  className="absolute left-1/2 -translate-x-1/2 -top-[30px] sm:-top-[42px] z-20 flex flex-col items-center pointer-events-none"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative w-[240px] sm:w-[330px] md:w-[360px] h-[54px] sm:h-[72px] md:h-[78px] flex items-center justify-center rotate-[2.1deg]">
                      <Image
                        src="/images/groups-standings/ribbon.svg"
                        alt="ribbon"
                        fill
                        className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                        priority
                      />
                      <span
                        className="relative z-10 text-[26px] sm:text-[36px] md:text-[42px] tracking-normal uppercase select-none text-center pb-1"
                        style={{
                          fontFamily: "var(--font-hollywood)",
                          color: "#799BA7",
                          WebkitTextStroke: "1.4px #FFFFFF",
                          textShadow: "0 2.5px 3px rgba(0,0,0,0.5)",
                          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.35))",
                        }}
                      >
                        {activeConference.label}
                      </span>
                    </div>
                    {/* Sub-label: STANDINGS */}
                    <div
                      className="text-xs sm:text-[18px] md:text-[21px] uppercase tracking-normal select-none -mt-1 sm:-mt-1.5 rotate-[1.5deg]"
                      style={{
                        fontFamily: "var(--font-hollywood)",
                        color: "#799BA7",
                        WebkitTextStroke: "1.1px #FFFFFF",
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
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.08 }}
                  variants={popSpringVariants}
                  custom={0.06}
                  className="w-full relative shadow-[0_12px_32px_rgba(0,0,0,0.3)] overflow-hidden"
                >
                  {/* Top Wood Plank Bar */}
                  <WoodPlankBar position="top" />

                  {/* Cream Paper Body */}
                  <div
                    className="w-full pt-14 sm:pt-18 pb-10 sm:pb-14 px-3 sm:px-6 md:px-10 relative overflow-hidden"
                    style={{
                      background: "linear-gradient(180deg, #FFFFFF 0%, #FAF7F0 35%, #F4EDE1 100%)",
                    }}
                  >
                    <StandingsTable teams={standingsTeams} groupLabel="GROUP A" />
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
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={popSpringVariants}
                custom={0.15}
                className="absolute left-1/2 -translate-x-1/2 -top-[28px] sm:-top-[40px] md:-top-[46px] z-20 flex items-center justify-center pointer-events-none"
              >
                <div className="relative w-[280px] sm:w-[440px] md:w-[520px] h-[52px] sm:h-[70px] md:h-[82px] flex items-center justify-center px-4">
                  <Image
                    src="/images/groups-standings/playoff-badge-bg.svg"
                    alt="Standing playoff badge"
                    fill
                    className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
                    priority
                  />
                  <span
                    className="relative z-10 text-[20px] sm:text-[32px] md:text-[40px] tracking-wider uppercase select-none text-[#EC5D12] text-center pt-0.5"
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
                whileInView="visible"
                viewport={{ once: false, amount: 0.08 }}
                variants={popSpringVariants}
                custom={0.06}
                className="w-full relative shadow-[0_12px_32px_rgba(0,0,0,0.3)] overflow-hidden"
              >
                <WoodPlankBar position="top" />

                <div
                  className="w-full pt-12 sm:pt-16 pb-6 sm:pb-8 px-2 sm:px-6 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, #FFFFFF 0%, #FAF7F0 35%, #F4EDE1 100%)",
                  }}
                >
                  <PlayoffBracket />
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
