"use client";

import React from "react";
import Image from "next/image";

import { motion } from "framer-motion";

import Announcement from "@/public/images/announcement/Announcement Future Crew.svg";

import NRPSearchForm from "./NRPSearchForm";

export default function LandingSection() {
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0,
      }}
      className="absolute top-[233.5px] left-1/2 z-[100] flex w-full max-w-[90vw] -translate-x-1/2 flex-col items-center gap-8 sm:w-auto sm:max-w-none md:gap-[65.5px]"
    >
      <Image src={Announcement} alt="Announcement Future Crew IBL 2026" className="h-auto w-full sm:w-auto" />
      <NRPSearchForm />
    </motion.div>
  );
}
