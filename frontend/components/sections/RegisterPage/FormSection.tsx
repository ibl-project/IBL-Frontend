"use client";

import React from "react";
import Image from "next/image";

import { motion } from "framer-motion";

import sinarAtas from "@/public/images/Sinar Atas.svg";
// Direct imports for background graphics to preserve native dimensions
import starBg from "@/public/images/star bg.webp";

import { FormClosed } from "./FormClosed";

export const FormSection = () => {
  return (
    <div className="pointer-events-none absolute top-0 left-0 h-[3323px] w-[1440px] select-none">
      {/* Background graphics (no-wrap next/image with imported dimensions) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ type: "spring", stiffness: 60, damping: 14 }}
        className="pointer-events-none absolute top-[1345px] left-0 z-0"
      >
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
        >
          <Image src={starBg} alt="" priority />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.05 }}
        className="pointer-events-none absolute top-[1472px] left-0 z-0"
      >
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
        >
          <Image src={sinarAtas} alt="" priority />
        </motion.div>
      </motion.div>

      {/* Form Content container to enable input pointer-events */}
      <div className="pointer-events-auto relative z-10 h-full w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pointer-events-auto absolute left-1/2 z-30 -translate-x-1/2"
          style={{
            top: "1677px",
            width: "883px",
          }}
        >
          {/* Registration closed on 2026-07-10. The full form (hooks/useRegistrationForm.ts plus
              FormNavigation, FormStepFields, FormSuccessScreen, UploadStep, PortfolioReminderModal,
              SubmitLoadingScreen and ValidationErrorToast in this folder) is parked, not dead.
              To reopen it, revert this file's change in commit acb141e. */}
          <FormClosed />
        </motion.div>
      </div>
    </div>
  );
};
