"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import TimelineTitleSvg from "@/public/images/timeline/timeline-title-287-1145.svg";
import TimelineDetailDesktopImg from "@/public/images/timeline/Timeline_Detail.png";
import { popSpringVariants } from "@/lib/animations";

export const TimelineSection = () => {
  return (
    <section className="w-full max-w-[1440px] mx-auto flex flex-col items-center px-0 py-0 select-none">
      {/* 
        1. Timeline Title SVG
        - Size: 685.96px x 201.69px (1440px scale)
        - Gap to detail: 27.31px
        - Pops in 1st (0.12s delay)
      */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popSpringVariants}
        custom={0.12}
        className="relative flex-shrink-0"
        style={{
          width: "calc(100% * 685.96 / 1440)",
          aspectRatio: "685.96 / 201.69",
          marginBottom: "calc(100% * 27.31 / 1440)",
        }}
      >
        <Image
          src={TimelineTitleSvg}
          alt="TIMELINE"
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* 
        2. Timeline Detail Image - Unified Proportional Scaling across ALL viewports
        - Size: 1116.04px x 618px (1440px scale)
        - Pops in 2nd (0.30s delay) + FLOATING ANIMATION
      */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popSpringVariants}
        custom={0.30}
        className="relative flex-shrink-0 timeline-detail-container max-md:mb-[var(--timeline-detail-mb-mobile,0px)]"
        style={{
          width: "calc(100% * 1116.04 / 1440)",
          aspectRatio: "1116.04 / 618",
        }}
      >
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 5.0, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full"
        >
          <Image
            src={TimelineDetailDesktopImg}
            alt="Timeline Detail IBL 2K26"
            className="w-full h-full object-contain"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
