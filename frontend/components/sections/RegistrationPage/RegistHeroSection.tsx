"use client";

import React from "react";
import Image from "next/image";

import { motion } from "framer-motion";

import { popSpringVariants } from "@/lib/animations";
import openTeamRegistrationImg from "@/public/images/registration/Open-Team-Registration.webp";

export const RegistHeroSection = () => {
  return (
    <section className="relative z-30 flex w-full flex-col items-center px-4 pt-4 md:pt-[11px]">
      {/* Semantic H1 for SEO and Screen Readers */}
      <h1 className="sr-only">Open Team Registration - ITS Basketball League 2026 (IBL 2K26)</h1>

      {/* Teal Banner / Title */}
      <div className="relative flex w-full max-w-[928px] flex-col items-center justify-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={popSpringVariants}
          custom={0.08}
          className="relative mb-10 flex aspect-[763/288] w-[82%] max-w-[763px] items-center justify-center"
        >
          <Image
            src="/images/registration/text-ornament.svg"
            alt="Teal Banner"
            width={763}
            height={288}
            className="h-auto w-full drop-shadow-2xl"
          />
          {/* Overlay Open Team Registration (Static Import) with punchy staggered pop */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center pt-[1%]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={popSpringVariants}
              custom={0.22}
              className="relative aspect-[579/169] w-[76%] max-w-[579px]"
            >
              <Image
                src={openTeamRegistrationImg}
                alt="Open Team Registration"
                fill
                priority
                sizes="(max-width: 768px) 80vw, 579px"
                className="object-contain"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
