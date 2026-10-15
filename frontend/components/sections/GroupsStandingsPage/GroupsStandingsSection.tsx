"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CONFERENCES, PLAYOFF_ROUNDS, getStandings } from "./mock-data";
import { GroupStageGrid, StandingsTable } from "./ConferenceTable";
import { PlayoffBracket } from "./PlayoffBracket";

type ViewMode = "conference" | "playoff";

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
      className="relative w-full min-h-screen pb-20"
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

      <div className="relative z-10 mx-auto w-full max-w-[1440px] pt-14 sm:pt-20 md:pt-24 px-2 sm:px-6 md:px-8">
        {/* ── Page Header: GROUP & STANDING ────────────────────────── */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative flex items-center justify-center">
            {/* Left Rays */}
            <div className="relative -mr-3 sm:-mr-6 md:-mr-10 z-10 w-[34px] sm:w-[52px] md:w-[72px] h-[58px] sm:h-[88px] md:h-[120px] shrink-0">
              <Image
                src="/images/groups-standings/rays-left.svg"
                alt="left rays"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Title Banner Background (Responsive + Shifted slightly right on tablet/desktop) */}
            <div className="relative w-[280px] sm:w-[520px] md:w-[680px] lg:w-[740px] h-[72px] sm:h-[115px] md:h-[146px] flex items-center justify-center px-2 sm:px-8 translate-x-0 sm:translate-x-3 md:translate-x-4">
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

            {/* Right Rays */}
            <div className="relative -ml-3 sm:-ml-6 md:-ml-10 z-10 w-[34px] sm:w-[52px] md:w-[72px] h-[58px] sm:h-[88px] md:h-[120px] shrink-0 translate-x-0 sm:translate-x-3 md:translate-x-4">
              <Image
                src="/images/groups-standings/rays-right.svg"
                alt="right rays"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* ── Conference Dropdown Button ──────────────────────────── */}
        <div className="flex justify-center mb-10 sm:mb-12 relative z-50" ref={dropdownRef}>
          <button
            id="conference-dropdown-btn"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-[280px] sm:w-[340px] md:w-[380px] h-[58px] sm:h-[66px] md:h-[72px] flex items-center justify-center gap-3 px-6 transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none cursor-pointer drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
            style={{
              backgroundImage: "url('/images/groups-standings/dropdown-pill.svg')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
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
              className="absolute top-[66px] sm:top-[74px] md:top-[80px] z-50 w-[280px] sm:w-[340px] md:w-[380px] bg-[#FAF5E8] border-[3px] border-[#877561] rounded-[16px] shadow-[0_12px_28px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              {CONFERENCES.map((conf, idx) => (
                <button
                  key={conf.label}
                  onClick={() => {
                    setViewMode("conference");
                    setConferenceIdx(idx);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-center py-3.5 sm:py-4 px-4 text-[26px] sm:text-[32px] md:text-[36px] tracking-wide uppercase transition-colors cursor-pointer border-b border-[#D8CBB7] last:border-b-0 ${
                    viewMode === "conference" && conferenceIdx === idx
                      ? "bg-[#658B9D] text-white"
                      : "text-[#877561] hover:bg-[#EFE7D4]"
                  }`}
                  style={{
                    fontFamily: "var(--font-hollywood)",
                  }}
                >
                  {conf.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setViewMode("playoff");
                  setDropdownOpen(false);
                }}
                className={`w-full text-center py-3.5 sm:py-4 px-4 text-[26px] sm:text-[32px] md:text-[36px] tracking-wide uppercase transition-colors cursor-pointer ${
                  viewMode === "playoff"
                    ? "bg-[#658B9D] text-white"
                    : "text-[#877561] hover:bg-[#EFE7D4]"
                }`}
                style={{
                  fontFamily: "var(--font-hollywood)",
                }}
              >
                Playoff
              </button>
            </div>
          )}
        </div>

        {/* ── View Content: Conference or Playoff ──────────────────── */}
        {viewMode === "conference" ? (
          <div className="flex flex-col gap-14">
            {/* ══════════════════════════════════════════════════════════
                SECTION 1: CONFERENCE GROUP STAGE
            ══════════════════════════════════════════════════════════ */}
            <div className="relative w-full">
              {/* Overlapping Top Ribbon Badge */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-[28px] sm:-top-[35px] z-20 flex flex-col items-center">
                <div className="relative w-[230px] sm:w-[326px] h-[50px] sm:h-[71px] flex items-center justify-center">
                  <Image
                    src="/images/groups-standings/ribbon.svg"
                    alt="ribbon"
                    fill
                    className="object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]"
                    priority
                  />
                  <span
                    className="relative z-10 text-xl sm:text-[34px] tracking-wide uppercase select-none text-white text-center pb-1"
                    style={{
                      fontFamily: "var(--font-hollywood)",
                      textShadow: "0 2px 3px rgba(0,0,0,0.6)",
                    }}
                  >
                    {activeConference.label}
                  </span>
                </div>
                {/* Sub-label: GROUP STAGE */}
                <div
                  className="text-xs sm:text-lg font-bold uppercase tracking-widest text-[#4A6E7E] -mt-0.5 select-none"
                  style={{
                    fontFamily: "var(--font-hollywood)",
                    textShadow: "0 1px 1px rgba(255,255,255,0.8)",
                  }}
                >
                  GROUP STAGE
                </div>
              </div>

              {/* Cream Parchment Board Container */}
              <div
                className="w-full bg-[#FAF5E8] rounded-[18px] sm:rounded-[24px] border-[2.5px] sm:border-[3px] border-[#DCD0B9] pt-12 sm:pt-16 pb-8 sm:pb-12 px-1.5 sm:px-6 md:px-12 shadow-[0_12px_32px_rgba(0,0,0,0.25)] relative overflow-hidden"
              >
                {/* Decorative border highlight */}
                <div className="absolute inset-0 border border-white/60 rounded-[16px] sm:rounded-[22px] pointer-events-none" />

                <GroupStageGrid groups={activeConference.groups} />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                SECTION 2: CONFERENCE STANDINGS
            ══════════════════════════════════════════════════════════ */}
            <div className="relative w-full">
              {/* Overlapping Top Ribbon Badge */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-[28px] sm:-top-[35px] z-20 flex flex-col items-center">
                <div className="relative w-[230px] sm:w-[326px] h-[50px] sm:h-[71px] flex items-center justify-center">
                  <Image
                    src="/images/groups-standings/ribbon.svg"
                    alt="ribbon"
                    fill
                    className="object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]"
                    priority
                  />
                  <span
                    className="relative z-10 text-xl sm:text-[34px] tracking-wide uppercase select-none text-white text-center pb-1"
                    style={{
                      fontFamily: "var(--font-hollywood)",
                      textShadow: "0 2px 3px rgba(0,0,0,0.6)",
                    }}
                  >
                    {activeConference.label}
                  </span>
                </div>
                {/* Sub-label: STANDINGS */}
                <div
                  className="text-xs sm:text-lg font-bold uppercase tracking-widest text-[#4A6E7E] -mt-0.5 select-none"
                  style={{
                    fontFamily: "var(--font-hollywood)",
                    textShadow: "0 1px 1px rgba(255,255,255,0.8)",
                  }}
                >
                  STANDINGS
                </div>
              </div>

              {/* Cream Parchment Board Container */}
              <div
                className="w-full bg-[#FAF5E8] rounded-[18px] sm:rounded-[24px] border-[2.5px] sm:border-[3px] border-[#DCD0B9] pt-12 sm:pt-16 pb-8 sm:pb-12 px-1.5 sm:px-6 md:px-12 shadow-[0_12px_32px_rgba(0,0,0,0.25)] relative overflow-hidden"
              >
                {/* Decorative border highlight */}
                <div className="absolute inset-0 border border-white/60 rounded-[16px] sm:rounded-[22px] pointer-events-none" />

                <StandingsTable teams={standingsTeams} groupLabel="TIM" />
              </div>
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════
              PLAYOFF VIEW
          ══════════════════════════════════════════════════════════ */
          <div className="relative w-full">
            {/* Overlapping Top Ribbon Badge: Standing playoff */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-[28px] sm:-top-[40px] md:-top-[46px] z-20 flex items-center justify-center">
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
            </div>

            {/* Cream Parchment Board Container (Static) */}
            <div
              className="w-full bg-[#FAF5E8] rounded-[18px] sm:rounded-[24px] border-[2.5px] sm:border-[3px] border-[#DCD0B9] pt-10 sm:pt-14 pb-6 sm:pb-8 px-1 sm:px-6 shadow-[0_12px_32px_rgba(0,0,0,0.25)] relative overflow-hidden"
            >
              {/* Decorative border highlight */}
              <div className="absolute inset-0 border border-white/60 rounded-[16px] sm:rounded-[22px] pointer-events-none" />

              <PlayoffBracket />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
