"use client";

import React from "react";
import Image from "next/image";

import { motion } from "framer-motion";

import TwoSix from "@/public/images/announcement/26.svg";

export default function TwoSixSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
      className="pointer-events-none absolute inset-0"
    >
      <Image
        src={TwoSix}
        alt="26"
        className="pointer-events-none absolute top-1/2 left-1/2 h-auto w-[100vw] max-w-[100vw] -translate-x-1/2 -translate-y-1/2 sm:top-0 sm:w-[1440px] sm:max-w-[1440px] sm:translate-y-0"
      />
    </motion.div>
  );
}
