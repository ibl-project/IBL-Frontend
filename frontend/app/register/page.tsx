"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { LandingSection } from "@/components/sections/RegisterPage/LandingSection";
import { MidSection } from "@/components/sections/RegisterPage/MidSection";
import { FormSection } from "@/components/sections/RegisterPage/FormSection";
import { useScaleRatio } from "@/lib/hooks/useScaleRatio";

export default function Register() {
  const [isLoading, setIsLoading] = useState(true);
  const scale = useScaleRatio(1440);

  useEffect(() => {
    // Minimum delay of 1.2s for smooth loading animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      {!isLoading && (
        <main
          className="w-full relative overflow-hidden"
          style={{
            width: "100%",
            aspectRatio: "2880 / 6646",
          }}
        >
          {/*
            Background dirender via next/image (bukan CSS background-image) supaya
            WebKit (Safari / iOS WKWebView) tidak harus men-decode aset 2880x6646
            (~19 MP / ~76 MB bitmap) di setiap perangkat. Dengan `sizes`, Vercel
            menyajikan variant webp yang sesuai viewport — ponsel men-decode gambar
            yang jauh lebih kecil, mencegah jetsam crash "A problem repeatedly occurred".
            `w-full h-auto` menjaga rasio & skalanya identik dengan overlay 1440-canvas.
          */}
          <Image
            src="/images/Full_Page_Desktop.webp"
            alt=""
            aria-hidden
            width={2880}
            height={6646}
            priority
            sizes="100vw"
            className="absolute inset-0 block w-full h-auto select-none pointer-events-none"
          />
          <h1 className="sr-only">Open Recruitment Staff IBL 2K26 — Pendaftaran</h1>

          <div
            className="absolute top-0 left-1/2"
            style={{
              width: "1440px",
              height: "3323px",
              transform: `translateX(-50%) scale(${scale})`,
              transformOrigin: "top center",
            }}
          >
            <LandingSection />
            <MidSection />
            <FormSection />
          </div>
        </main>
      )}
    </>
  );
}

