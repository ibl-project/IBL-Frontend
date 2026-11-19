"use client";

import React from "react";
import Image from "next/image";

import { motion } from "framer-motion";

export const LoadingScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0C0B0A] select-none"
    >
      <div className="flex flex-col items-center gap-[24px]">
        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <Image
            src="/images/LOGO_1.svg"
            alt="IBL Logo"
            width={120}
            height={126}
            priority
            className="h-auto w-[120px] drop-shadow-[0_0_15px_rgba(244,99,30,0.3)]"
          />
        </motion.div>

        {/* Loading Bar Track */}
        <div className="relative h-[6px] w-[240px] overflow-hidden rounded-full bg-[#2A2725]">
          {/* Loading Bar Progress */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #F4631E 0%, #893310 50%, #7E0202 100%)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
