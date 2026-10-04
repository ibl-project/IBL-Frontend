"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { popSpringVariants } from "@/lib/animations";

export const GuidebookSection = () => {
  return (
    <section className="relative w-full flex flex-col items-center justify-center -mt-[8%] sm:-mt-[10%] lg:-mt-[110px] z-20 px-4">
      
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popSpringVariants}
        custom={0.1}
        className="relative w-full max-w-[928px] aspect-[928/491] flex justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
      >
        <Image 
          src="/images/registration/ticket.svg" 
          alt="Ticket Background" 
          width={928} 
          height={491} 
          className="w-full h-auto"
        />
        
        {/* Content Overlaid on Ticket - Rotated to match the ticket's tilt */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-[18%] lg:px-[22%] pt-[6%] pb-[8%] gap-1 sm:gap-3 lg:gap-5 -rotate-[2deg]">
          <h2 className="text-[12px] sm:text-[16px] md:text-[20px] lg:text-[27px] text-[#309898] leading-snug drop-shadow-sm w-full" style={{ fontFamily: 'var(--font-drowner), sans-serif' }}>
            Lapangan sudah menanti!<br/>
            Kumpulkan tim terbaikmu dan daftarkan tim terbaikmu, bersaing dengan kompetitor terbaik, dan rebut gelar juara <span className="text-[#7F0303]">IBL2K26: Fastbreak Collector</span>.
          </h2>
          
          <motion.a 
            href="https://intip.in/GUIDEBOOKPENDAFTARANIBL2K26" 
            target="_blank"
            aria-label="Unduh Guidebook IBL 2K26"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.95, y: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="inline-flex items-center justify-center bg-[#309898] text-white px-4 py-2 sm:px-8 sm:py-3 lg:px-12 lg:py-4 rounded-[20px] font-bold text-[10px] sm:text-sm lg:text-xl hover:bg-[#257d7d] transition-colors shadow-lg border-b-[3px] lg:border-b-4 border-[#1c5d5d] active:border-b-0 active:translate-y-1 cursor-pointer"
          >
            Guidebook
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
};
