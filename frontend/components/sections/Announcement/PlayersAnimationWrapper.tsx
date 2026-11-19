"use client";

import React from "react";
import Image from "next/image";

import { motion } from "framer-motion";

import Icaz from "@/public/images/announcement/icaz.svg";
import KobeBryant2 from "@/public/images/announcement/Kobe Bryant 2.svg";
import KobeBryant from "@/public/images/announcement/Kobe Bryant.svg";
import LeBronJames1 from "@/public/images/announcement/LeBron James 1.svg";
import LeBronJames2 from "@/public/images/announcement/LeBron James 2.svg";
import LukaDoncic from "@/public/images/announcement/Luka Doncic.svg";
import Michael from "@/public/images/announcement/michael.svg";
import Nikola from "@/public/images/announcement/nikola.svg";
import Star from "@/public/images/announcement/star.svg";

export default function PlayersAnimationWrapper() {
  return (
    <div className="pointer-events-none relative left-1/2 h-0 w-[1440px] -translate-x-1/2">
      {/* SVG Kiri — slide in from left after 0.9s delay */}
      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0"
      >
        <Image src={KobeBryant2} alt="Kobe Bryant 2" className="absolute top-0 left-0 z-5 max-w-none" />
        <Image src={LeBronJames1} alt="LeBron James 1" className="absolute top-[14px] z-[2] max-w-none" />
        <Image src={Star} alt="Star" className="absolute top-[138px] left-[320px] z-15 max-w-none" />
        <Image src={Nikola} alt="Nikola" className="absolute top-[551px] left-[183px] z-6 max-w-none" />
        <Image src={LukaDoncic} alt="Luka Doncic" className="absolute top-[666px] left-0 z-10 max-w-none" />
      </motion.div>

      {/* SVG Kanan — slide in from right after 0.9s delay */}
      <motion.div
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0"
      >
        <Image src={KobeBryant} alt="Kobe Bryant" className="absolute top-0 right-0 z-4 max-w-none" />
        <Image src={Michael} alt="Michael" className="absolute top-[75px] right-0 max-w-none" />
        <Image src={Star} alt="Star" className="absolute top-[379px] right-[202px] max-w-none -scale-x-100" />
        <Image src={Icaz} alt="Icaz" className="absolute top-[429px] right-0 z-5 max-w-none" />
        <Image src={LeBronJames2} alt="LeBron James 2" className="absolute top-[633px] right-0 z-10 max-w-none" />
      </motion.div>
    </div>
  );
}
