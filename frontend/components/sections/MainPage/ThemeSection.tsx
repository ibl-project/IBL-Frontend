"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import ThemeBgImg from "@/public/images/theme/fix/theme-bg.png";
import ThemeImg from "@/public/images/theme/fix/theme.png";
import IblPopImg from "@/public/images/theme/fix/ibl-pop.png";
import ThemeDetailImg from "@/public/images/theme/fix/theme-detail.png";
import { popSpringVariants, popPunchVariants } from "@/lib/animations";

/**
 * Patokan koordinat Desktop 1440px:
 * Jarak absolut dari top halaman (0px):
 * - theme-bg     : top 1094px  (relatif ke ThemeSection: 1094 - 1280 = -186px)
 * - theme        : top 1245px  (relatif ke ThemeSection: 1245 - 1280 = -35px)
 * - ibl-pop      : top 1341px  (relatif ke ThemeSection: 1341 - 1280 = +61px)
 * - theme-detail : top 1565px  (relatif ke ThemeSection: 1565 - 1280 = +285px)
 *
 * Section Frame:
 * Base width: 1440px
 * Base height: 1200px (aspectRatio: 1440 / 1200)
 */
export const ThemeSection = () => {
  return (
    <section
      className="relative w-full max-w-[1440px] mx-auto select-none md:scale-[0.75] md:origin-center"
      style={{
        aspectRatio: "1440 / 1200",
      }}
    >
      <h2 className="sr-only">Theme IBL</h2>

      {/* 
        1. Theme Background / Clipboard Board (theme-bg.png)
        - Figma absolute top: 1094px (relatif: -186px)
        - 1x size: 923px x 438.5px
        - z-index: 10 (Lowest - Pops in 1st)
      */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popSpringVariants}
        custom={0.08}
        className="absolute pointer-events-none z-10"
        style={{
          width: "calc(100% * 923 / 1440)",
          height: "calc(100% * 438.5 / 1200)",
          left: "calc(100% * 161.5 / 1440)",
          top: "calc(100% * -186 / 1200)",
        }}
      >
        <Image
          src={ThemeBgImg}
          alt="Theme Background"
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* 
        2. Theme Detail Cards (theme-detail.png)
        - Figma absolute top: 1565px (relatif: +285px)
        - 1x size: 1394px x 841px
        - z-index: 20 (Pops in 2nd + FLOATING ANIMATION)
      */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popSpringVariants}
        custom={0.24}
        className="absolute pointer-events-none z-20 left-1/2 -translate-x-1/2"
        style={{
          width: "calc(100% * 1394 / 1440)",
          height: "calc(100% * 841 / 1200)",
          top: "calc(100% * 285 / 1200)",
        }}
      >
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full"
        >
          <Image
            src={ThemeDetailImg}
            alt="Theme Detail: Fastbreak, Fastbreak Collector, Collector"
            className="w-full h-full object-contain"
          />
        </motion.div>
      </motion.div>

      {/* 
        3. Theme Title (theme.png)
        - Figma absolute top: 1245px (relatif: -35px)
        - 1x size: 609.5px x 225.5px
        - z-index: 22 (Pops in 3rd)
      */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popPunchVariants}
        custom={{ delay: 0.38, rotation: -2 }}
        className="absolute pointer-events-none z-22 left-1/2 -translate-x-1/2"
        style={{
          width: "calc(100% * 609.5 / 1440)",
          height: "calc(100% * 225.5 / 1200)",
          top: "calc(100% * -35 / 1200)",
        }}
      >
        <Image
          src={ThemeImg}
          alt="THEME"
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* 
        4. IBL Pop Badge (ibl-pop.png)
        - Figma absolute top: 1341px (relatif: +61px), left: 908px
        - 1x size: 382px x 264px
        - z-index: 25 (Highest - Pops in 4th on top of board & title)
      */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popPunchVariants}
        custom={{ delay: 0.52, rotation: 5 }}
        className="absolute pointer-events-none z-25"
        style={{
          width: "calc(100% * 382 / 1440)",
          height: "calc(100% * 264 / 1200)",
          right: "calc(100% * 256.45 / 1440)",
          top: "calc(100% * 71 / 1200)",
        }}
      >
        <Image
          src={IblPopImg}
          alt="IBL Pop"
          className="w-full h-full object-contain"
        />
      </motion.div>
    </section>
  );
};
