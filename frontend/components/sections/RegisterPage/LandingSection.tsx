"use client";

import React from "react";
import Image from "next/image";

import { motion, Variants } from "framer-motion";

import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import orangKanan from "@/public/images/orang kanan.svg";
import orangKiri from "@/public/images/orang kiri.svg";
import vectorBiru from "@/public/images/vector biru.svg";
import vectorHitam from "@/public/images/vector hitam.svg";

// Builder varian: animasi entrance selalu jalan; "breathing" (scale loop `repeat:
// Infinity`) hanya aktif saat `breathe=true` (desktop). Pada layar kecil kita
// matikan loop tak terhingga ini untuk meringankan beban compositing/GPU di WebKit
// (Safari/iOS WKWebView) tanpa mengubah tampilan akhir elemen.
const makeVectorVariants = (breathe: boolean, breathDuration: number): Variants => ({
  hidden: { opacity: 0, y: -30, scale: 1 },
  visible: {
    opacity: 1,
    y: 0,
    scale: breathe ? [1, 1.05, 1] : 1,
    transition: {
      opacity: { duration: 0.6, ease: "easeInOut" },
      y: { duration: 0.6, ease: "easeInOut" },
      ...(breathe
        ? {
            scale: {
              duration: breathDuration,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            },
          }
        : {}),
    },
  },
});

const makeOrangVariants = (breathe: boolean, breathDuration: number, fromX: number, delay: number): Variants => ({
  hidden: { opacity: 0, x: fromX, scale: 1 },
  visible: {
    opacity: 1,
    x: 0,
    scale: breathe ? [1, 1.07, 1] : 1,
    transition: {
      opacity: { duration: 0.8, ease: "easeOut" },
      x: { type: "spring", stiffness: 60, damping: 15, delay },
      ...(breathe
        ? {
            scale: {
              duration: breathDuration,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            },
          }
        : {}),
    },
  },
});

export const LandingSection = () => {
  // Loop breathing hanya di desktop (>= 1024px). SSR/mobile => false.
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.35 } },
  };

  const vectorHitamVariants = makeVectorVariants(isDesktop, 5);
  const vectorBiruVariants = makeVectorVariants(isDesktop, 5.5);
  const orangKiriVariants = makeOrangVariants(isDesktop, 4, -120, 0.2);
  const orangKananVariants = makeOrangVariants(isDesktop, 4.5, 120, 0.3);

  // Mobile: render statik (tanpa framer-motion) untuk meminimalkan GPU compositing
  // layer yang memicu crash jetsam WebKit di ambang memori. Desktop: animasi penuh.
  if (!isDesktop) {
    return (
      <div className="relative flex w-[1440px] items-center">
        <div className="absolute top-0 z-2">
          <Image src={vectorHitam} alt="Decorative Vector Hitam" loading="lazy" />
        </div>
        <div className="absolute top-0 z-1">
          <Image src={vectorBiru} alt="Decorative Vector Biru" loading="lazy" />
        </div>
        <div className="absolute top-[341px] z-5 flex w-full justify-center gap-[7px]">
          <div className="flex items-center justify-center">
            <Image src={orangKiri} alt="Ilustrasi pemain basket kiri" loading="lazy" />
          </div>
          <div className="flex items-center justify-center">
            <Image src={orangKanan} alt="Ilustrasi pemain basket kanan" loading="lazy" />
          </div>
        </div>
        <div className="absolute top-[719px] flex w-full justify-center gap-[47px]">
          <Image src="/texts/IBL.svg" alt="IBL" width={666} height={199} priority />
          <Image src="/texts/2K26.svg" alt="2K26" width={666} height={199} loading="lazy" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative flex w-[1440px] items-center"
    >
      {/* Vector Hitam */}
      <motion.div variants={vectorHitamVariants} className="absolute top-0 z-2">
        <Image src={vectorHitam} alt="Decorative Vector Hitam" />
      </motion.div>

      {/* Vector Biru */}
      <motion.div variants={vectorBiruVariants} className="absolute top-0 z-1">
        <Image src={vectorBiru} alt="Decorative Vector Biru" />
      </motion.div>

      {/* Orang */}
      <div className="absolute top-[341px] z-5 flex w-full justify-center gap-[7px]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={orangKiriVariants}
          className="flex items-center justify-center"
        >
          <Image src={orangKiri} alt="Ilustrasi pemain basket kiri" />
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={orangKananVariants}
          className="flex items-center justify-center"
        >
          <Image src={orangKanan} alt="Ilustrasi pemain basket kanan" />
        </motion.div>
      </div>

      {/* Logo IBL */}
      <div className="absolute top-[719px] flex w-full justify-center gap-[47px]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Image src="/texts/IBL.svg" alt="IBL" width={666} height={199} priority />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
        >
          <Image
            src="/texts/2K26.svg" // Ganti dengan path gambar aslimu nanti
            alt="2K26"
            width={666}
            height={199}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
