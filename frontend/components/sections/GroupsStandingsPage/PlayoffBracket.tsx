"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  PLAYOFF_TOURNAMENT_DATA,
  type PlayoffTournamentData,
  type PlayoffMatchTeam,
} from "./mock-data";

interface PlayoffBracketProps {
  data?: PlayoffTournamentData;
}

/** Mini basketball emblem icon */
function TeamEmblem() {
  return (
    <div
      className="size-[23px] shrink-0 rounded-[3px] bg-[#7E0202] flex items-center justify-center shadow-sm"
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F2F2DD"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5 opacity-90"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l4.24 4.24" />
        <path d="M14.83 14.83l4.24 4.24" />
        <path d="M14.83 9.17l4.24-4.24" />
        <path d="M4.93 19.07l4.24-4.24" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </div>
  );
}

/** Team card component matching Figma: desktop w-[128.6px] h-[44.7px], mobile w-[117.5px] h-[40.8px] */
function TeamCard({
  team,
  align = "left",
  style,
  className = "",
  compact = false,
  large = false,
  staggerIndex,
  isFocused = true,
}: {
  team: PlayoffMatchTeam;
  align?: "left" | "right";
  style?: React.CSSProperties;
  className?: string;
  compact?: boolean;
  large?: boolean;
  staggerIndex?: number;
  isFocused?: boolean;
}) {
  const isLeft = align === "left";
  const cardWidth = style?.width || (compact ? "117.47px" : "128.64px");
  const cardHeight = style?.height || (compact ? "40.81px" : "44.69px");

  const staggerStyle: React.CSSProperties =
    staggerIndex !== undefined && isFocused
      ? {
          animation: `bracketCardEnter 340ms cubic-bezier(0.22, 1, 0.36, 1) ${staggerIndex * 35}ms both`,
        }
      : {};

  return (
    <div
      style={{
        width: cardWidth,
        height: cardHeight,
        backgroundColor: "#F2F2DD",
        borderColor: "#401212",
        borderWidth: compact ? "1.8px" : "2.19px",
        borderStyle: "solid",
        borderRadius: "3.65px",
        boxShadow: "2.5px 2px 2px 0px rgba(0,0,0,0.45)",
        ...staggerStyle,
        ...style,
      }}
      className={`absolute flex items-center px-1.5 sm:px-2 select-none transition-transform hover:scale-[1.02] cursor-default z-10 ${
        team.winner ? "ring-1 ring-[#E7AE30]/60" : ""
      } ${className}`}
    >
      {isLeft ? (
        // Left Wing Card: [Rank] [Team Name] [Score] [Emblem]
        <div className="flex items-center justify-between w-full gap-1">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
            <span
              className={`${large ? "text-[15px] sm:text-[16px]" : compact ? "text-[13px]" : "text-[15px]"} font-bold shrink-0 text-[#E7AE30] leading-none`}
              style={{ fontFamily: "var(--font-hollywood), var(--font-drowner)" }}
            >
              {team.seed}
            </span>
            <span
              className={`${large ? "text-[11px] sm:text-[12px]" : compact ? "text-[9px]" : "text-[10px]"} font-bold uppercase truncate text-[#650202] leading-tight`}
              style={{ fontFamily: "var(--font-poppins), sans-serif" }}
              title={team.name}
            >
              {team.name}
            </span>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {team.score !== undefined && (
              <span className={`${large ? "text-[12px] sm:text-[13px]" : compact ? "text-[10px]" : "text-[11px]"} font-extrabold text-[#7E0202] px-0.5`}>
                {team.score}
              </span>
            )}
            <TeamEmblem />
          </div>
        </div>
      ) : (
        // Right Wing Card: [Emblem] [Score] [Rank] [Team Name] (mirrored)
        <div className="flex items-center justify-between w-full gap-1">
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <TeamEmblem />
            {team.score !== undefined && (
              <span className={`${large ? "text-[12px] sm:text-[13px]" : compact ? "text-[10px]" : "text-[11px]"} font-extrabold text-[#7E0202] px-0.5`}>
                {team.score}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1 justify-end">
            <span
              className={`${large ? "text-[15px] sm:text-[16px]" : compact ? "text-[13px]" : "text-[15px]"} font-bold shrink-0 text-[#E7AE30] leading-none`}
              style={{ fontFamily: "var(--font-hollywood), var(--font-drowner)" }}
            >
              {team.seed}
            </span>
            <span
              className={`${large ? "text-[11px] sm:text-[12px]" : compact ? "text-[9px]" : "text-[10px]"} font-bold uppercase truncate text-[#650202] leading-tight text-right`}
              style={{ fontFamily: "var(--font-poppins), sans-serif" }}
              title={team.name}
            >
              {team.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Stage navigation button */
/** Stage navigation button matching retro arcade sticker typography */
function StagePill({
  id,
  label,
  width = 76,
  active = false,
  onClick,
  style,
}: {
  id?: string;
  label: string;
  width?: number;
  active?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      style={{
        width: `${width}px`,
        height: "32px",
        backgroundColor: active ? "#CB0404" : "#FAF5E8",
        borderColor: active ? "#7E0202" : "#3E1212",
        borderWidth: "1.8px",
        borderStyle: "solid",
        borderRadius: "4px",
        boxShadow: active
          ? "0 0 8px rgba(203,4,4,0.6), 2px 2px 2px 0px rgba(0,0,0,0.4)"
          : "2px 2px 2px 0px rgba(0,0,0,0.35)",
        ...style,
      }}
      className="flex items-center justify-center select-none cursor-pointer transition-all hover:brightness-105 active:scale-95 shrink-0"
    >
      <span
        className="text-[12px] sm:text-[13px] uppercase tracking-tight text-center leading-none select-none inline-block pt-0.5"
        style={{
          fontFamily: "var(--font-hollywood)",
          color: active ? "#FFFFFF" : "#CB0404",
          WebkitTextStroke: active ? "1.2px #7E0202" : "1.8px #FFFFFF",
          paintOrder: "stroke fill",
          filter: "drop-shadow(1px 2px 0px #000000)",
          textShadow: active
            ? "0 1.5px 2px rgba(0,0,0,0.8)"
            : "-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF, 0 2px 0 #000",
        }}
      >
        {label}
      </span>
    </button>
  );
}

/** Single Duel (Pair of teams) for mobile bracket */
function MatchDuel({
  teamA,
  teamB,
  cardWidth = 140,
  forkWidth = 20,
}: {
  teamA: PlayoffMatchTeam;
  teamB: PlayoffMatchTeam;
  cardWidth?: number;
  forkWidth?: number;
}) {
  const cardHeight = 41;
  const gap = 5;
  const duelHeight = cardHeight * 2 + gap; // 87px
  const yA = cardHeight / 2; // 20.5
  const yB = cardHeight + gap + cardHeight / 2; // 66.5
  const midY = (yA + yB) / 2; // 43.5

  return (
    <div
      className="relative select-none shrink-0"
      style={{ width: `${cardWidth + forkWidth}px`, height: `${duelHeight}px` }}
    >
      <TeamCard
        team={teamA}
        compact
        style={{ left: 0, top: 0, width: `${cardWidth}px` }}
      />
      <TeamCard
        team={teamB}
        compact
        style={{ left: 0, top: `${cardHeight + gap}px`, width: `${cardWidth}px` }}
      />
      {/* Bracket fork on the right */}
      <svg
        className="absolute pointer-events-none"
        style={{
          left: `${cardWidth}px`,
          top: 0,
          width: `${forkWidth}px`,
          height: `${duelHeight}px`,
          overflow: "visible",
        }}
        fill="none"
      >
        <path
          d={`M 0 ${yA} H ${forkWidth / 2} V ${yB} H 0`}
          stroke="#658B9D"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M ${forkWidth / 2} ${midY} H ${forkWidth}`}
          stroke="#658B9D"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Duel Box for Champion & 3rd Place */
function DuelBox({
  title,
  titleColor = "gold",
  titlePosition = "top",
  teamA,
  teamB,
  variant = "champion",
  style,
  className = "",
  boxWidth = 156,
  large = false,
  staggerIndex,
  isFocused = true,
}: {
  title: string;
  titleColor?: "gold" | "red";
  titlePosition?: "top" | "bottom";
  teamA: PlayoffMatchTeam;
  teamB: PlayoffMatchTeam;
  variant?: "champion" | "third";
  style?: React.CSSProperties;
  className?: string;
  boxWidth?: number;
  large?: boolean;
  staggerIndex?: number;
  isFocused?: boolean;
}) {
  const isChampion = variant === "champion";
  const innerCardWidth = boxWidth - 16;
  const titleEl = (
    <h3
      className={`text-[17px] tracking-wide uppercase text-center select-none ${
        titlePosition === "top" ? "mb-1.5" : "mt-1.5"
      }`}
      style={{
        fontFamily: "var(--font-hollywood)",
        backgroundImage:
          titleColor === "gold"
            ? "linear-gradient(180deg, #FDB813 0%, #976E0B 100%)"
            : undefined,
        WebkitBackgroundClip: titleColor === "gold" ? "text" : undefined,
        WebkitTextFillColor: titleColor === "gold" ? "transparent" : undefined,
        color: titleColor === "red" ? "#811F1F" : undefined,
        filter: "drop-shadow(0px 1.5px 2px rgba(0,0,0,0.6))",
      }}
    >
      {title}
    </h3>
  );

  const staggerStyle: React.CSSProperties =
    staggerIndex !== undefined && isFocused
      ? {
          animation: `bracketCardEnter 380ms cubic-bezier(0.22, 1, 0.36, 1) ${staggerIndex * 60}ms both`,
        }
      : {};

  return (
    <div
      style={{ ...staggerStyle, ...style }}
      className={`flex flex-col items-center select-none z-10 shrink-0 ${className}`}
    >
      {titlePosition === "top" && titleEl}
      <div
        style={{
          width: `${boxWidth}px`,
          background: isChampion
            ? "linear-gradient(180deg, #D8BA98 0%, #726250 100%)"
            : "linear-gradient(180deg, #CB0404 0%, #650202 100%)",
          border: "2px solid #F9E8BD",
          borderRadius: "6px",
          boxShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          padding: "6px 7px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <div className="relative h-[41px] mx-auto" style={{ width: `${innerCardWidth}px` }}>
          <TeamCard team={teamA} compact={!large} large={large} style={{ left: 0, top: 0, width: `${innerCardWidth}px` }} />
        </div>
        <div className="relative h-[41px] mx-auto" style={{ width: `${innerCardWidth}px` }}>
          <TeamCard team={teamB} compact={!large} large={large} style={{ left: 0, top: 0, width: `${innerCardWidth}px` }} />
        </div>
      </div>
      {titlePosition === "bottom" && titleEl}
    </div>
  );
}

export function PlayoffBracket({ data = PLAYOFF_TOURNAMENT_DATA }: PlayoffBracketProps) {
  const { left, right, final, thirdPlace } = data;
  const [activeStage, setActiveStage] = React.useState<"r16" | "qf" | "sf" | "final">("r16");
  const [dragOffset, setDragOffset] = React.useState<number>(0);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const touchStartX = React.useRef<number>(0);
  const touchStartY = React.useRef<number>(0);
  const touchStartTime = React.useRef<number>(0);
  const isHorizontalSwipe = React.useRef<boolean | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(360);

  React.useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || document.documentElement.clientWidth;
        if (w > 0) setContainerWidth(w);
      }
    };
    update();
    const t1 = setTimeout(update, 100);
    const t2 = setTimeout(update, 500);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", update);
    };
  }, []);

  const STAGES = [
    { id: "r16" as const, label: "ROUND OF 16" },
    { id: "qf" as const, label: "QUARTER FINAL" },
    { id: "sf" as const, label: "SEMI FINAL" },
    { id: "final" as const, label: "FINAL" },
  ];

  const STAGE_CONTAINER_HEIGHT = 735;
  const activeStageIndex = STAGES.findIndex((s) => s.id === activeStage);

  const handleTouchStart = (clientX: number, clientY: number) => {
    touchStartX.current = clientX;
    touchStartY.current = clientY;
    touchStartTime.current = Date.now();
    isHorizontalSwipe.current = null;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (clientX: number, clientY: number) => {
    if (!touchStartTime.current) return;

    const deltaX = clientX - touchStartX.current;
    const deltaY = clientY - touchStartY.current;

    // Detect primary direction on initial movement
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipe.current) {
      // Elastic resistance at boundary stages
      if (
        (activeStageIndex === 0 && deltaX > 0) ||
        (activeStageIndex === STAGES.length - 1 && deltaX < 0)
      ) {
        setDragOffset(deltaX * 0.25);
      } else {
        setDragOffset(deltaX);
      }
    }
  };

  const handleTouchEnd = (clientX: number, clientY: number) => {
    if (!touchStartTime.current) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const deltaX = clientX - touchStartX.current;
    const deltaY = clientY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;

    const isHorizontal = isHorizontalSwipe.current ?? (Math.abs(deltaX) > Math.abs(deltaY));
    const isQuickFlick = deltaTime < 320 && Math.abs(deltaX) > 28;
    const isPassThreshold = Math.abs(deltaX) > 48;

    if (isHorizontal && (isQuickFlick || isPassThreshold)) {
      if (deltaX < 0 && activeStageIndex < STAGES.length - 1) {
        setActiveStage(STAGES[activeStageIndex + 1].id);
      } else if (deltaX > 0 && activeStageIndex > 0) {
        setActiveStage(STAGES[activeStageIndex - 1].id);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    isHorizontalSwipe.current = null;
    touchStartTime.current = 0;
  };

  const handleTouchCancel = () => {
    setIsDragging(false);
    setDragOffset(0);
    isHorizontalSwipe.current = null;
    touchStartTime.current = 0;
  };

  const forkWidth = 20;
  const peekVisibleWidth = 52;
  const activeCardWidth = Math.max(210, containerWidth - 4 - forkWidth - peekVisibleWidth);
  const peekLeft = 4 + activeCardWidth + forkWidth;
  const xStart = 4 + activeCardWidth;
  const xMid = xStart + 10;
  const xEnd = peekLeft;

  // Final stage layout coordinates (Panel 3)
  const finalBoxWidth = Math.min(230, Math.max(175, containerWidth - 110));
  const finalBoxLeft = Math.min(
    containerWidth - finalBoxWidth - 14,
    Math.max(105, Math.round(containerWidth * 0.38))
  );
  const xMatchFork = finalBoxLeft - 18;
  const xFinalFork = Math.max(46, Math.round(finalBoxLeft * 0.56));
  const xSF = Math.max(24, Math.round(xFinalFork * 0.5));
  const xCardIn = finalBoxLeft + 4;

  const champY_A = 62.5;
  const champY_B = 108.5;
  const champY_Mid = 85.5;

  const thirdY_A = 181.5;
  const thirdY_B = 227.5;
  const thirdY_Mid = 204.5;

  const finalY_Mid = 145;
  const sfY_1 = 62.5;
  const sfY_2 = 227.5;

  return (
    <>
      {/* ── MOBILE BRACKET (< 768px, Continuous Sliding Rail FIFA-Style, No Scrollbars) ── */}
      <div className="block md:hidden w-full pb-4 pt-1">
        <style>{`
          @keyframes bracketCardEnter {
            0% {
              opacity: 0;
              transform: translateY(12px) scale(0.97);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>

        {/* Stage Navigation Pills (Grid of 4, 100% width, No horizontal scrollbar with Shared Layout Pill) */}
        <div className="grid grid-cols-4 gap-1 min-[360px]:gap-1.5 w-full mb-3 px-0.5 select-none relative">
          {STAGES.map((s) => {
            const active = activeStage === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStage(s.id)}
                className="relative h-[38px] sm:h-[42px] w-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer px-1 rounded-[5px] select-none"
                style={{
                  backgroundColor: "#FAF5E8",
                  borderColor: "#3E1212",
                  borderWidth: "1.8px",
                  borderStyle: "solid",
                  boxShadow: "2px 2px 2px 0px rgba(0,0,0,0.35)",
                }}
              >
                {active && (
                  <motion.div
                    layoutId="mobileActiveStagePill"
                    className="absolute inset-[-1.8px] rounded-[5px] pointer-events-none"
                    style={{
                      backgroundColor: "#CB0404",
                      borderColor: "#7E0202",
                      borderWidth: "1.8px",
                      borderStyle: "solid",
                      boxShadow: "0 0 8px rgba(203,4,4,0.6), 2px 2px 2px 0px rgba(0,0,0,0.4)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className="relative z-10 text-[11px] min-[360px]:text-[12px] min-[390px]:text-[13px] min-[420px]:text-[14px] uppercase tracking-tight text-center leading-none inline-block pt-0.5 truncate font-bold"
                  style={{
                    fontFamily: "var(--font-hollywood)",
                    color: active ? "#FFFFFF" : "#CB0404",
                    filter: active
                      ? "drop-shadow(0px 1.5px 2px rgba(0,0,0,0.7))"
                      : "drop-shadow(0px 1px 1px rgba(0,0,0,0.25))",
                    textShadow: active
                      ? "0 1px 2px rgba(0,0,0,0.8)"
                      : "0 1px 0 rgba(255,255,255,0.8)",
                    transition: "color 200ms ease",
                  }}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Static Height Stage Container with Touch-Pan-Y and Real-time Swipe */}
        <div
          ref={containerRef}
          onTouchStart={(e) => handleTouchStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handleTouchMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
          onTouchCancel={handleTouchCancel}
          onMouseDown={(e) => handleTouchStart(e.clientX, e.clientY)}
          onMouseMove={(e) => { if (isDragging) handleTouchMove(e.clientX, e.clientY); }}
          onMouseUp={(e) => { if (isDragging) handleTouchEnd(e.clientX, e.clientY); }}
          onMouseLeave={() => { if (isDragging) handleTouchCancel(); }}
          className="relative w-full overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing select-none"
          style={{
            height: `${STAGE_CONTAINER_HEIGHT}px`,
            touchAction: "pan-y",
          }}
        >
          {/* Continuous Sliding Rail (Real-time drag + FIFA World Cup snapping animation) */}
          <div
            className="flex w-full items-start"
            style={{
              transform: isDragging && dragOffset !== 0
                ? `translateX(calc(-${activeStageIndex * 100}% + ${dragOffset}px))`
                : `translateX(-${activeStageIndex * 100}%)`,
              transition: isDragging ? "none" : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* ══════════════════════════════════════════════════════════
                STAGE 1: ROUND OF 16 (Panel 0)
            ══════════════════════════════════════════════════════════ */}
            <div
              className="w-full shrink-0 relative h-[735px] overflow-hidden select-none"
              style={{
                opacity: activeStageIndex === 0 ? 1 : 0.35,
                transform: activeStageIndex === 0 ? "scale(1)" : "scale(0.97)",
                filter: activeStageIndex === 0 ? "blur(0px)" : "blur(0.8px)",
                transition: "opacity 380ms cubic-bezier(0.22, 1, 0.36, 1), transform 380ms cubic-bezier(0.22, 1, 0.36, 1), filter 380ms cubic-bezier(0.22, 1, 0.36, 1)",
                transformOrigin: "center left",
              }}
            >
              {/* Connectors from R16 to QF (Animated SVG stroke flow) */}
              <svg
                className="absolute inset-0 pointer-events-none z-0"
                width="100%"
                height="100%"
                fill="none"
                stroke="#401212"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 300,
                  strokeDashoffset: activeStageIndex === 0 ? 0 : 300,
                  transition: "stroke-dashoffset 420ms cubic-bezier(0.4, 0, 0.2, 1) 140ms",
                }}
              >
                {/* Pair 0 */}
                <path d={`M ${xStart} 19 H ${xMid} V 61 H ${xStart} M ${xMid} 40 H ${xEnd - 5} V 64 H ${xEnd}`} />
                <path d={`M ${xStart} 109 H ${xMid} V 151 H ${xStart} M ${xMid} 130 H ${xEnd - 5} V 106 H ${xEnd}`} />
                {/* Pair 1 */}
                <path d={`M ${xStart} 199 H ${xMid} V 241 H ${xStart} M ${xMid} 220 H ${xEnd - 5} V 244 H ${xEnd}`} />
                <path d={`M ${xStart} 289 H ${xMid} V 331 H ${xStart} M ${xMid} 310 H ${xEnd - 5} V 286 H ${xEnd}`} />
                {/* Pair 2 */}
                <path d={`M ${xStart} 379 H ${xMid} V 421 H ${xStart} M ${xMid} 400 H ${xEnd - 5} V 424 H ${xEnd}`} />
                <path d={`M ${xStart} 469 H ${xMid} V 511 H ${xStart} M ${xMid} 490 H ${xEnd - 5} V 466 H ${xEnd}`} />
                {/* Pair 3 */}
                <path d={`M ${xStart} 559 H ${xMid} V 601 H ${xStart} M ${xMid} 580 H ${xEnd - 5} V 604 H ${xEnd}`} />
                <path d={`M ${xStart} 649 H ${xMid} V 691 H ${xStart} M ${xMid} 670 H ${xEnd - 5} V 646 H ${xEnd}`} />
              </svg>

              {/* ACTIVE COLUMN: ROUND OF 16 (Full view & Gede, left: 4px) */}
              <TeamCard team={left.r16[0]?.teamA || { name: "TBD", seed: 1 }} large isFocused={activeStageIndex === 0} staggerIndex={0} style={{ left: "4px", top: "0px", width: `${activeCardWidth}px`, height: "38px" }} />
              <TeamCard team={left.r16[0]?.teamB || { name: "TBD", seed: 16 }} large isFocused={activeStageIndex === 0} staggerIndex={0} style={{ left: "4px", top: "42px", width: `${activeCardWidth}px`, height: "38px" }} />

              <TeamCard team={left.r16[1]?.teamA || { name: "TBD", seed: 8 }} large isFocused={activeStageIndex === 0} staggerIndex={1} style={{ left: "4px", top: "90px", width: `${activeCardWidth}px`, height: "38px" }} />
              <TeamCard team={left.r16[1]?.teamB || { name: "TBD", seed: 9 }} large isFocused={activeStageIndex === 0} staggerIndex={1} style={{ left: "4px", top: "132px", width: `${activeCardWidth}px`, height: "38px" }} />

              <TeamCard team={left.r16[2]?.teamA || { name: "TBD", seed: 4 }} large isFocused={activeStageIndex === 0} staggerIndex={2} style={{ left: "4px", top: "180px", width: `${activeCardWidth}px`, height: "38px" }} />
              <TeamCard team={left.r16[2]?.teamB || { name: "TBD", seed: 13 }} large isFocused={activeStageIndex === 0} staggerIndex={2} style={{ left: "4px", top: "222px", width: `${activeCardWidth}px`, height: "38px" }} />

              <TeamCard team={left.r16[3]?.teamA || { name: "TBD", seed: 5 }} large isFocused={activeStageIndex === 0} staggerIndex={3} style={{ left: "4px", top: "270px", width: `${activeCardWidth}px`, height: "38px" }} />
              <TeamCard team={left.r16[3]?.teamB || { name: "TBD", seed: 12 }} large isFocused={activeStageIndex === 0} staggerIndex={3} style={{ left: "4px", top: "312px", width: `${activeCardWidth}px`, height: "38px" }} />

              <TeamCard team={right.r16[0]?.teamA || { name: "TBD", seed: 2 }} large isFocused={activeStageIndex === 0} staggerIndex={4} style={{ left: "4px", top: "360px", width: `${activeCardWidth}px`, height: "38px" }} />
              <TeamCard team={right.r16[0]?.teamB || { name: "TBD", seed: 15 }} large isFocused={activeStageIndex === 0} staggerIndex={4} style={{ left: "4px", top: "402px", width: `${activeCardWidth}px`, height: "38px" }} />

              <TeamCard team={right.r16[1]?.teamA || { name: "TBD", seed: 7 }} large isFocused={activeStageIndex === 0} staggerIndex={5} style={{ left: "4px", top: "450px", width: `${activeCardWidth}px`, height: "38px" }} />
              <TeamCard team={right.r16[1]?.teamB || { name: "TBD", seed: 10 }} large isFocused={activeStageIndex === 0} staggerIndex={5} style={{ left: "4px", top: "492px", width: `${activeCardWidth}px`, height: "38px" }} />

              <TeamCard team={right.r16[2]?.teamA || { name: "TBD", seed: 3 }} large isFocused={activeStageIndex === 0} staggerIndex={6} style={{ left: "4px", top: "540px", width: `${activeCardWidth}px`, height: "38px" }} />
              <TeamCard team={right.r16[2]?.teamB || { name: "TBD", seed: 14 }} large isFocused={activeStageIndex === 0} staggerIndex={6} style={{ left: "4px", top: "582px", width: `${activeCardWidth}px`, height: "38px" }} />

              <TeamCard team={right.r16[3]?.teamA || { name: "TBD", seed: 6 }} large isFocused={activeStageIndex === 0} staggerIndex={7} style={{ left: "4px", top: "630px", width: `${activeCardWidth}px`, height: "38px" }} />
              <TeamCard team={right.r16[3]?.teamB || { name: "TBD", seed: 11 }} large isFocused={activeStageIndex === 0} staggerIndex={7} style={{ left: "4px", top: "672px", width: `${activeCardWidth}px`, height: "38px" }} />

              {/* PEEKING COLUMN: QUARTER FINAL (Clickable to advance) */}
              <div onClick={() => setActiveStage("qf")} className="cursor-pointer group select-none">
                <TeamCard team={left.qf[0]?.teamA || { name: "TBD", seed: 1 }} compact style={{ left: `${peekLeft}px`, top: "45px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                <TeamCard team={left.qf[0]?.teamB || { name: "TBD", seed: 8 }} compact style={{ left: `${peekLeft}px`, top: "87px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />

                <TeamCard team={left.qf[1]?.teamA || { name: "TBD", seed: 4 }} compact style={{ left: `${peekLeft}px`, top: "225px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                <TeamCard team={left.qf[1]?.teamB || { name: "TBD", seed: 5 }} compact style={{ left: `${peekLeft}px`, top: "267px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />

                <TeamCard team={right.qf[0]?.teamA || { name: "TBD", seed: 2 }} compact style={{ left: `${peekLeft}px`, top: "405px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                <TeamCard team={right.qf[0]?.teamB || { name: "TBD", seed: 7 }} compact style={{ left: `${peekLeft}px`, top: "447px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />

                <TeamCard team={right.qf[1]?.teamA || { name: "TBD", seed: 3 }} compact style={{ left: `${peekLeft}px`, top: "585px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                <TeamCard team={right.qf[1]?.teamB || { name: "TBD", seed: 6 }} compact style={{ left: `${peekLeft}px`, top: "627px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                STAGE 2: QUARTER FINAL (Panel 1, Centered vertically in static 735px)
            ══════════════════════════════════════════════════════════ */}
            <div
              className="w-full shrink-0 relative h-[735px] overflow-hidden select-none"
              style={{
                opacity: activeStageIndex === 1 ? 1 : 0.35,
                transform: activeStageIndex === 1 ? "scale(1)" : "scale(0.97)",
                filter: activeStageIndex === 1 ? "blur(0px)" : "blur(0.8px)",
                transition: "opacity 380ms cubic-bezier(0.22, 1, 0.36, 1), transform 380ms cubic-bezier(0.22, 1, 0.36, 1), filter 380ms cubic-bezier(0.22, 1, 0.36, 1)",
                transformOrigin: "center left",
              }}
            >
              <div className="relative w-full h-[385px] top-1/2 -translate-y-1/2">
                {/* Connectors from QF to SF (Animated SVG stroke flow) */}
                <svg
                  className="absolute inset-0 pointer-events-none z-0"
                  width="100%"
                  height="100%"
                  fill="none"
                  stroke="#401212"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 300,
                    strokeDashoffset: activeStageIndex === 1 ? 0 : 300,
                    transition: "stroke-dashoffset 420ms cubic-bezier(0.4, 0, 0.2, 1) 140ms",
                  }}
                >
                  <path d={`M ${xStart} 19 H ${xMid} V 61 H ${xStart} M ${xMid} 40 H ${xEnd - 5} V 64 H ${xEnd}`} />
                  <path d={`M ${xStart} 109 H ${xMid} V 151 H ${xStart} M ${xMid} 130 H ${xEnd - 5} V 106 H ${xEnd}`} />
                  <path d={`M ${xStart} 199 H ${xMid} V 241 H ${xStart} M ${xMid} 220 H ${xEnd - 5} V 244 H ${xEnd}`} />
                  <path d={`M ${xStart} 289 H ${xMid} V 331 H ${xStart} M ${xMid} 310 H ${xEnd - 5} V 286 H ${xEnd}`} />
                </svg>

                {/* ACTIVE COLUMN: QUARTER FINAL (Full view & Gede, left: 4px) */}
                <TeamCard team={left.qf[0]?.teamA || { name: "TBD", seed: 1 }} large isFocused={activeStageIndex === 1} staggerIndex={0} style={{ left: "4px", top: "0px", width: `${activeCardWidth}px`, height: "38px" }} />
                <TeamCard team={left.qf[0]?.teamB || { name: "TBD", seed: 8 }} large isFocused={activeStageIndex === 1} staggerIndex={0} style={{ left: "4px", top: "42px", width: `${activeCardWidth}px`, height: "38px" }} />

                <TeamCard team={left.qf[1]?.teamA || { name: "TBD", seed: 4 }} large isFocused={activeStageIndex === 1} staggerIndex={1} style={{ left: "4px", top: "90px", width: `${activeCardWidth}px`, height: "38px" }} />
                <TeamCard team={left.qf[1]?.teamB || { name: "TBD", seed: 5 }} large isFocused={activeStageIndex === 1} staggerIndex={1} style={{ left: "4px", top: "132px", width: `${activeCardWidth}px`, height: "38px" }} />

                <TeamCard team={right.qf[0]?.teamA || { name: "TBD", seed: 2 }} large isFocused={activeStageIndex === 1} staggerIndex={2} style={{ left: "4px", top: "180px", width: `${activeCardWidth}px`, height: "38px" }} />
                <TeamCard team={right.qf[0]?.teamB || { name: "TBD", seed: 7 }} large isFocused={activeStageIndex === 1} staggerIndex={2} style={{ left: "4px", top: "222px", width: `${activeCardWidth}px`, height: "38px" }} />

                <TeamCard team={right.qf[1]?.teamA || { name: "TBD", seed: 3 }} large isFocused={activeStageIndex === 1} staggerIndex={3} style={{ left: "4px", top: "270px", width: `${activeCardWidth}px`, height: "38px" }} />
                <TeamCard team={right.qf[1]?.teamB || { name: "TBD", seed: 6 }} large isFocused={activeStageIndex === 1} staggerIndex={3} style={{ left: "4px", top: "312px", width: `${activeCardWidth}px`, height: "38px" }} />

                {/* PEEKING COLUMN: SEMI FINAL (Clickable to advance) */}
                <div onClick={() => setActiveStage("sf")} className="cursor-pointer group select-none">
                  <TeamCard team={left.sf.teamA} compact style={{ left: `${peekLeft}px`, top: "45px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                  <TeamCard team={left.sf.teamB} compact style={{ left: `${peekLeft}px`, top: "87px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />

                  <TeamCard team={right.sf.teamA} compact style={{ left: `${peekLeft}px`, top: "225px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                  <TeamCard team={right.sf.teamB} compact style={{ left: `${peekLeft}px`, top: "267px", width: "150px", height: "38px" }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                STAGE 3: SEMI FINAL (Panel 2, Centered vertically in static 735px)
            ══════════════════════════════════════════════════════════ */}
            <div
              className="w-full shrink-0 relative h-[735px] overflow-hidden select-none"
              style={{
                opacity: activeStageIndex === 2 ? 1 : 0.35,
                transform: activeStageIndex === 2 ? "scale(1)" : "scale(0.97)",
                filter: activeStageIndex === 2 ? "blur(0px)" : "blur(0.8px)",
                transition: "opacity 380ms cubic-bezier(0.22, 1, 0.36, 1), transform 380ms cubic-bezier(0.22, 1, 0.36, 1), filter 380ms cubic-bezier(0.22, 1, 0.36, 1)",
                transformOrigin: "center left",
              }}
            >
              <div className="relative w-full h-[240px] top-1/2 -translate-y-1/2">
                {/* Connectors from SF to Finals (Animated SVG stroke flow) */}
                <svg
                  className="absolute inset-0 pointer-events-none z-0"
                  width="100%"
                  height="100%"
                  fill="none"
                  stroke="#401212"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 300,
                    strokeDashoffset: activeStageIndex === 2 ? 0 : 300,
                    transition: "stroke-dashoffset 420ms cubic-bezier(0.4, 0, 0.2, 1) 140ms",
                  }}
                >
                  {/* SF1 (midY 55) steps to Final Card A (midY 87) */}
                  <path d={`M ${xStart} 34 H ${xMid} V 76 H ${xStart} M ${xMid} 55 H ${xEnd - 5} V 87 H ${xEnd}`} />
                  {/* SF2 (midY 165) steps to Final Card B (midY 129) */}
                  <path d={`M ${xStart} 144 H ${xMid} V 186 H ${xStart} M ${xMid} 165 H ${xEnd - 5} V 129 H ${xEnd}`} />
                </svg>

                {/* ACTIVE COLUMN: SEMI FINAL (Full view & Gede, left: 4px) */}
                <TeamCard team={left.sf.teamA} large isFocused={activeStageIndex === 2} staggerIndex={0} style={{ left: "4px", top: "15px", width: `${activeCardWidth}px`, height: "38px" }} />
                <TeamCard team={left.sf.teamB} large isFocused={activeStageIndex === 2} staggerIndex={0} style={{ left: "4px", top: "57px", width: `${activeCardWidth}px`, height: "38px" }} />

                <TeamCard team={right.sf.teamA} large isFocused={activeStageIndex === 2} staggerIndex={1} style={{ left: "4px", top: "125px", width: `${activeCardWidth}px`, height: "38px" }} />
                <TeamCard team={right.sf.teamB} large isFocused={activeStageIndex === 2} staggerIndex={1} style={{ left: "4px", top: "167px", width: `${activeCardWidth}px`, height: "38px" }} />

                {/* PEEKING COLUMN: FINAL MATCH (Centered between SFs, Clickable to advance) */}
                <div onClick={() => setActiveStage("final")} className="cursor-pointer group select-none">
                  <div
                    style={{ left: `${peekLeft}px`, top: "46px" }}
                    className="absolute select-none pointer-events-none"
                  >
                    <span
                      className="text-[11px] font-bold uppercase text-[#7E0202] tracking-wider"
                      style={{ fontFamily: "var(--font-hollywood)" }}
                    >
                      FINAL
                    </span>
                  </div>
                  <TeamCard
                    team={final.teamA}
                    compact
                    style={{ left: `${peekLeft}px`, top: "68px", width: "150px", height: "38px" }}
                    className="opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <TeamCard
                    team={final.teamB}
                    compact
                    style={{ left: `${peekLeft}px`, top: "110px", width: "150px", height: "38px" }}
                    className="opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                STAGE 4: FINAL (Panel 3, Centered vertically in static 735px)
            ══════════════════════════════════════════════════════════ */}
            <div
              className="w-full shrink-0 relative h-[735px] overflow-hidden select-none"
              style={{
                opacity: activeStageIndex === 3 ? 1 : 0.35,
                transform: activeStageIndex === 3 ? "scale(1)" : "scale(0.97)",
                filter: activeStageIndex === 3 ? "blur(0px)" : "blur(0.8px)",
                transition: "opacity 380ms cubic-bezier(0.22, 1, 0.36, 1), transform 380ms cubic-bezier(0.22, 1, 0.36, 1), filter 380ms cubic-bezier(0.22, 1, 0.36, 1)",
                transformOrigin: "center left",
              }}
            >
              <div className="relative w-full h-[325px] top-1/2 -translate-y-1/2">
                {/* Connectors from Semi-Final to Final & 3rd Place (Animated SVG stroke flow) */}
                <svg
                  className="absolute inset-0 pointer-events-none z-0"
                  width="100%"
                  height="100%"
                  fill="none"
                  stroke="#401212"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 300,
                    strokeDashoffset: activeStageIndex === 3 ? 0 : 300,
                    transition: "stroke-dashoffset 420ms cubic-bezier(0.4, 0, 0.2, 1) 140ms",
                  }}
                >
                  {/* SF1 and SF2 incoming branches to left vertical trunk */}
                  <path d={`M 0 ${sfY_1} H ${xSF} V ${sfY_2} H 0`} />

                  {/* Midpoint trunk from SF to Final split */}
                  <path d={`M ${xSF} ${finalY_Mid} H ${xFinalFork}`} />

                  {/* Vertical trunk connecting Champion and 3rd Place branches */}
                  <path d={`M ${xFinalFork} ${champY_Mid} V ${thirdY_Mid}`} />

                  {/* Champion fork and lines entering Champion Card A & B */}
                  <path d={`M ${xFinalFork} ${champY_Mid} H ${xMatchFork} M ${xCardIn} ${champY_A} H ${xMatchFork} V ${champY_B} H ${xCardIn}`} />

                  {/* 3rd Place fork and lines entering 3rd Place Card A & B */}
                  <path d={`M ${xFinalFork} ${thirdY_Mid} H ${xMatchFork} M ${xCardIn} ${thirdY_A} H ${xMatchFork} V ${thirdY_B} H ${xCardIn}`} />
                </svg>

                {/* PEEKING COLUMN (LEFT): SEMI FINALISTS (Clickable to go back to SF) */}
                <div
                  onClick={() => setActiveStage("sf")}
                  className="cursor-pointer group select-none"
                  title="Kembali ke Semi Final"
                >
                  {/* SF1 Duel Peeking */}
                  <TeamCard
                    team={left.sf.teamA}
                    compact
                    style={{ left: "-82px", top: "24.5px", width: "110px", height: "38px" }}
                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                  <TeamCard
                    team={left.sf.teamB}
                    compact
                    style={{ left: "-82px", top: "64.5px", width: "110px", height: "38px" }}
                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                  />

                  {/* SF2 Duel Peeking */}
                  <TeamCard
                    team={right.sf.teamA}
                    compact
                    style={{ left: "-82px", top: "189.5px", width: "110px", height: "38px" }}
                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                  <TeamCard
                    team={right.sf.teamB}
                    compact
                    style={{ left: "-82px", top: "229.5px", width: "110px", height: "38px" }}
                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* CHAMPION DUEL BOX */}
                <DuelBox
                  title="Champion"
                  titleColor="gold"
                  titlePosition="top"
                  teamA={final.teamA}
                  teamB={final.teamB}
                  variant="champion"
                  boxWidth={finalBoxWidth}
                  large
                  isFocused={activeStageIndex === 3}
                  staggerIndex={0}
                  style={{
                    position: "absolute",
                    left: `${finalBoxLeft}px`,
                    top: "10px",
                  }}
                />

                {/* 3RD PLACE DUEL BOX */}
                <DuelBox
                  title="3rd Place"
                  titleColor="red"
                  titlePosition="bottom"
                  teamA={thirdPlace.teamA}
                  teamB={thirdPlace.teamB}
                  variant="third"
                  boxWidth={finalBoxWidth}
                  large
                  isFocused={activeStageIndex === 3}
                  staggerIndex={1}
                  style={{
                    position: "absolute",
                    left: `${finalBoxLeft}px`,
                    top: "155px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP BRACKET (>= 768px, Wide Symmetric Layout) ──────────────── */}
      <div className="hidden md:block w-full overflow-x-auto pb-6 pt-2">
        <div className="relative mx-auto w-[1140px] min-w-[1140px] h-[540px]">
          {/* ── STAGE BUTTONS RAIL (TOP) ───────────────────────────────── */}
          <div
            className="absolute top-0 left-0 w-full z-20"
            style={{ height: "32px" }}
          >
            <StagePill label="Round Of 16" width={84} style={{ position: "absolute", left: "33.3px", top: 0 }} />
            <StagePill label="Quarter Final" width={100} style={{ position: "absolute", left: "199.6px", top: 0 }} />
            <StagePill label="Semi Final" width={84} style={{ position: "absolute", left: "369.7px", top: 0 }} />
            <StagePill label="Final" width={80} style={{ position: "absolute", left: "531.1px", top: 0 }} />
            <StagePill label="Semi Final" width={84} style={{ position: "absolute", left: "680.8px", top: 0 }} />
            <StagePill label="Quarter Final" width={100} style={{ position: "absolute", left: "839.6px", top: 0 }} />
            <StagePill label="Round Of 16" width={84} style={{ position: "absolute", left: "1022px", top: 0 }} />
          </div>

          {/* ── MAIN BRACKET BOARD AREA (below stage pills) ───────────── */}
          <div className="absolute top-[52px] left-0 w-full h-[470px]">
            {/* ============================================================
                LEFT WING
            ============================================================ */}

            {/* Left Round of 16 Cards (8 cards, 4 duels) */}
            {left.r16.map((duel, i) => {
              const topA = i * 116.07;
              const topB = topA + 57.67;
              return (
                <React.Fragment key={duel.id}>
                  <TeamCard
                    team={duel.teamA}
                    align="left"
                    style={{ left: "11px", top: `${topA}px` }}
                  />
                  <TeamCard
                    team={duel.teamB}
                    align="left"
                    style={{ left: "11px", top: `${topB}px` }}
                  />
                </React.Fragment>
              );
            })}

            {/* Left R16 Connector Track */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                left: "124.11px",
                top: "22.74px",
                width: "68.57px",
                height: "408.41px",
              }}
            >
              <Image
                src="/images/groups-standings/rail-track-left-r16.svg"
                alt="rail track left r16"
                fill
                className="object-contain"
              />
            </div>

            {/* Left Quarter Final Cards (4 cards, 2 duels) */}
            <TeamCard
              team={left.qf[0]?.teamA || { name: "TBD", seed: 1 }}
              align="left"
              style={{ left: "185.32px", top: "64.97px" }}
            />
            <TeamCard
              team={left.qf[0]?.teamB || { name: "TBD", seed: 4 }}
              align="left"
              style={{ left: "185.32px", top: "108.04px" }}
            />
            <TeamCard
              team={left.qf[1]?.teamA || { name: "TBD", seed: 2 }}
              align="left"
              style={{ left: "185.32px", top: "299.3px" }}
            />
            <TeamCard
              team={left.qf[1]?.teamB || { name: "TBD", seed: 3 }}
              align="left"
              style={{ left: "185.32px", top: "342.37px" }}
            />

            {/* Left QF Connector Track */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                left: "292.2px",
                top: "82.33px",
                width: "64.87px",
                height: "289.22px",
              }}
            >
              <Image
                src="/images/groups-standings/rail-track-left-r8.svg"
                alt="rail track left r8"
                fill
                className="object-contain"
              />
            </div>

            {/* Left Semi Final Cards (2 cards, 1 duel) */}
            <TeamCard
              team={left.sf.teamA}
              align="left"
              style={{ left: "347.42px", top: "186.3px" }}
            />
            <TeamCard
              team={left.sf.teamB}
              align="left"
              style={{ left: "347.42px", top: "229.37px" }}
            />

            {/* Left SF Connector Track */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                left: "456.2px",
                top: "201.07px",
                width: "31.78px",
                height: "59.48px",
              }}
            >
              <Image
                src="/images/groups-standings/rail-track-left-r4.svg"
                alt="rail track left r4"
                fill
                className="object-contain"
              />
            </div>

            {/* ============================================================
                CENTER COLUMN: CHAMPION & 3RD PLACE
            ============================================================ */}

            {/* Champion Box (Top) */}
            <div
              className="absolute z-10 flex flex-col items-center"
              style={{
                left: "482.4px",
                top: "35px",
                width: "177.38px",
              }}
            >
              {/* Champion Title */}
              <h3
                className="text-[26px] tracking-wide uppercase select-none leading-tight mb-0.5 text-center"
                style={{
                  fontFamily: "var(--font-hollywood)",
                  backgroundImage: "linear-gradient(180deg, #FDB813 0%, #976E0B 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.6))",
                }}
              >
                Champion
              </h3>

              {/* Container Box */}
              <div
                style={{
                  width: "177.38px",
                  height: "106px",
                  background: "linear-gradient(180deg, #D8BA98 0%, #726250 100%)",
                  borderColor: "#F9E8BD",
                  borderWidth: "2.19px",
                  borderStyle: "solid",
                  borderRadius: "4px",
                  boxShadow: "3.65px 2.92px 2.92px 0px rgba(0,0,0,0.5)",
                }}
                className="relative flex flex-col items-center justify-center gap-1.5 p-2"
              >
                <TeamCard
                  team={final.teamA}
                  align="left"
                  style={{ position: "relative", left: "0", top: "0" }}
                />
                <TeamCard
                  team={final.teamB}
                  align="left"
                  style={{ position: "relative", left: "0", top: "0" }}
                />
              </div>
            </div>

            {/* Final Connection Track */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                left: "487.28px",
                top: "155.81px",
                width: "152.18px",
                height: "135.78px",
              }}
            >
              <Image
                src="/images/groups-standings/rail-track-final.svg"
                alt="rail track final"
                fill
                className="object-contain"
              />
            </div>

            {/* 3rd Place Box (Bottom) */}
            <div
              className="absolute z-10 flex flex-col items-center"
              style={{
                left: "478.7px",
                top: "275px",
                width: "178.3px",
              }}
            >
              {/* Container Box */}
              <div
                style={{
                  width: "178.3px",
                  height: "106px",
                  background: "linear-gradient(180deg, #CB0404 0%, #650202 100%)",
                  borderColor: "#F9E8BD",
                  borderWidth: "2.19px",
                  borderStyle: "solid",
                  borderRadius: "4px",
                  boxShadow: "3.65px 2.92px 2.92px 0px rgba(0,0,0,0.5)",
                }}
                className="relative flex flex-col items-center justify-center gap-1.5 p-2"
              >
                <TeamCard
                  team={thirdPlace.teamA}
                  align="left"
                  style={{ position: "relative", left: "0", top: "0" }}
                />
                <TeamCard
                  team={thirdPlace.teamB}
                  align="left"
                  style={{ position: "relative", left: "0", top: "0" }}
                />
              </div>

              {/* 3rd Place Title */}
              <h3
                className="text-[24px] tracking-wide uppercase select-none leading-tight mt-1 text-center"
                style={{
                  fontFamily: "var(--font-hollywood)",
                  color: "#811F1F",
                  textShadow: "0px 2px 2px rgba(0,0,0,0.5)",
                }}
              >
                3rd Place
              </h3>
            </div>

            {/* ============================================================
                RIGHT WING
            ============================================================ */}

            {/* Right SF Connector Track */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                left: "638.75px",
                top: "200.01px",
                width: "41.25px",
                height: "59.48px",
              }}
            >
              <Image
                src="/images/groups-standings/rail-track-right-r4.svg"
                alt="rail track right r4"
                fill
                className="object-contain"
              />
            </div>

            {/* Right Semi Final Cards (2 cards, 1 duel) */}
            <TeamCard
              team={right.sf.teamA}
              align="right"
              style={{ left: "658.51px", top: "186.3px" }}
            />
            <TeamCard
              team={right.sf.teamB}
              align="right"
              style={{ left: "658.51px", top: "229.37px" }}
            />

            {/* Right QF Connector Track */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                left: "782.13px",
                top: "88.76px",
                width: "64.87px",
                height: "289.22px",
              }}
            >
              <Image
                src="/images/groups-standings/rail-track-right-r8.svg"
                alt="rail track right r8"
                fill
                className="object-contain"
              />
            </div>

            {/* Right Quarter Final Cards (4 cards, 2 duels) */}
            <TeamCard
              team={right.qf[0]?.teamA || { name: "TBD", seed: 1 }}
              align="right"
              style={{ left: "825.33px", top: "72.18px" }}
            />
            <TeamCard
              team={right.qf[0]?.teamB || { name: "TBD", seed: 4 }}
              align="right"
              style={{ left: "825.33px", top: "115.25px" }}
            />
            <TeamCard
              team={right.qf[1]?.teamA || { name: "TBD", seed: 2 }}
              align="right"
              style={{ left: "825.33px", top: "305.78px" }}
            />
            <TeamCard
              team={right.qf[1]?.teamB || { name: "TBD", seed: 3 }}
              align="right"
              style={{ left: "825.33px", top: "348.85px" }}
            />

            {/* Right R16 Connector Track */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                left: "947.44px",
                top: "29.16px",
                width: "67.65px",
                height: "408.41px",
              }}
            >
              <Image
                src="/images/groups-standings/rail-track-right-r16.svg"
                alt="rail track right r16"
                fill
                className="object-contain"
              />
            </div>

            {/* Right Round of 16 Cards (8 cards, 4 duels) */}
            {right.r16.map((duel, i) => {
              const topA = i * 116.07 + 6.48;
              const topB = topA + 57.67;
              return (
                <React.Fragment key={duel.id}>
                  <TeamCard
                    team={duel.teamA}
                    align="right"
                    style={{ left: "999.65px", top: `${topA}px` }}
                  />
                  <TeamCard
                    team={duel.teamB}
                    align="right"
                    style={{ left: "999.65px", top: `${topB}px` }}
                  />
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
