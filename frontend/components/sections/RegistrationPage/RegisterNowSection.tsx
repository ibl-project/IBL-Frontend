"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { popSpringVariants } from "@/lib/animations";

export const RegisterNowSection = () => {
  return (
    <section className="relative w-full flex flex-col items-center justify-center -mt-[10%] sm:-mt-[12%] lg:-mt-[135px] z-30 px-4 pb-8 lg:pb-0">
      <h2 className="sr-only">Formulir Pendaftaran Tim IBL 2K26</h2>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popSpringVariants}
        custom={0.15}
        whileHover={{ scale: 1.025, y: -3 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-[84%] max-w-[776px] aspect-[776/527] flex justify-center drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] cursor-pointer"
      >
        <Image 
          src="/images/registration/clipboard.svg" 
          alt="Clipboard Background" 
          width={776} 
          height={527} 
          className="w-full h-auto"
        />
        <a 
          href="https://intip.in/OPENREGISTRATIONTEAMIBL2K26" 
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-20"
          aria-label="Daftar Sekarang - Open Team Registration IBL 2K26"
        />
      </motion.div>
    </section>
  );
};
