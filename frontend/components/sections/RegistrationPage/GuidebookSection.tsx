"use client";

import React from "react";
import Image from "next/image";

import { motion } from "framer-motion";

import { popSpringVariants } from "@/lib/animations";

export const GuidebookSection = () => {
  return (
    <section className="relative z-20 -mt-[8%] flex w-full flex-col items-center justify-center px-4 sm:-mt-[10%] lg:-mt-[110px]">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popSpringVariants}
        custom={0.1}
        className="relative flex aspect-[928/491] w-full max-w-[928px] justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
      >
        <Image
          src="/images/registration/ticket.svg"
          alt="Ticket Background"
          width={928}
          height={491}
          className="h-auto w-full"
        />

        {/* Content Overlaid on Ticket - Rotated to match the ticket's tilt */}
        <div className="absolute inset-0 flex -rotate-[2deg] flex-col items-center justify-center gap-1 px-[18%] pt-[6%] pb-[8%] text-center sm:gap-3 lg:gap-5 lg:px-[22%]">
          <h2
            className="w-full text-[12px] leading-snug text-[#309898] drop-shadow-sm sm:text-[16px] md:text-[20px] lg:text-[27px]"
            style={{ fontFamily: "var(--font-drowner), sans-serif" }}
          >
            Lapangan sudah menanti!
            <br />
            Kumpulkan tim terbaikmu dan daftarkan tim terbaikmu, bersaing dengan kompetitor terbaik, dan rebut gelar
            juara <span className="text-[#7F0303]">IBL2K26: Fastbreak Collector</span>.
          </h2>

          <motion.a
            href="https://intip.in/GUIDEBOOKPENDAFTARANIBL2K26"
            target="_blank"
            aria-label="Unduh Guidebook IBL 2K26"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.95, y: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="inline-flex cursor-pointer items-center justify-center rounded-[20px] border-b-[3px] border-[#1c5d5d] bg-[#309898] px-4 py-2 text-[10px] font-bold text-white shadow-lg transition-colors hover:bg-[#257d7d] active:translate-y-1 active:border-b-0 sm:px-8 sm:py-3 sm:text-sm lg:border-b-4 lg:px-12 lg:py-4 lg:text-xl"
          >
            Guidebook
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
};
