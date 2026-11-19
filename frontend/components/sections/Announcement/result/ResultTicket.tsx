"use client";

import React from "react";
import Image, { type ImageProps } from "next/image";

import { motion } from "framer-motion";

import TicketCongrats from "@/public/images/announcement/Ticket_Congrats.svg";

interface ResultTicketProps {
  headerText?: string;
  stickerSrc: ImageProps["src"];
  stickerAlt: string;
  stickerClass?: string; // e.g., "w-[260px] sm:w-[280px] mb-[-40px] z-10 relative"
  ticketMarginBottomClass?: string; // e.g., "mb-28" or ""
  contentStyle: React.CSSProperties;
  children: React.ReactNode;
  footerNode?: React.ReactNode;
}

export default function ResultTicket({
  headerText,
  stickerSrc,
  stickerAlt,
  stickerClass = "w-[320px] sm:w-[350px] h-auto flex items-center justify-center mb-[-36px] z-10 relative",
  ticketMarginBottomClass = "",
  contentStyle,
  children,
  footerNode,
}: ResultTicketProps) {
  return (
    <div className="flex max-w-full flex-col items-center justify-center select-none">
      {/* Dynamic Sticker (Animated Pop-in) */}
      <motion.div
        className={stickerClass}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
      >
        <Image src={stickerSrc} alt={stickerAlt} className="h-auto w-full" priority />
      </motion.div>

      {/* Ticket wrapper (Animated Slide-up) */}
      <motion.div
        className={`relative z-0 aspect-[575/363] w-[575px] max-w-[95vw] ${ticketMarginBottomClass}`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4, delay: 0.2, duration: 0.8 }}
      >
        <Image src={TicketCongrats} alt="Ticket Congrats" fill className="object-contain" priority />

        {/* Conditional Ticket Header Title */}
        {headerText && (
          <div
            className="absolute text-center font-hollywood uppercase select-none"
            style={{
              fontFamily: "var(--font-hollywood), sans-serif",
              fontSize: "clamp(20px, 4.5vw, 30px)",
              lineHeight: "1.15",
              width: "clamp(160px, 55vw, 259px)",
              height: "auto",
              letterSpacing: "-0.02em",
              background: "linear-gradient(180deg, #390100 30.77%, #770202 65.87%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              WebkitTextStroke: "1px #FFFFFF",
              textShadow: "0px 4px 4px rgba(0, 0, 0, 0.67)",
              top: "19.7%", // Mathematically centered on the orange header stripe
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {headerText}
          </div>
        )}

        {/* Text content area */}
        <div
          className="absolute z-10 flex flex-col items-center justify-center text-center font-drowner text-black"
          style={{
            left: "50%",
            top: "52.9%",
            transform: "translate(-50%, -50%)",
            ...contentStyle,
          }}
        >
          {children}
        </div>

        {/* Render optional footer node (Animated Delayed Fade) */}
        {footerNode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0"
          >
            <div className="pointer-events-auto contents">{footerNode}</div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
