"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";

// Tahapan proses (perceived progress). Backend GAS memproses semua berkas &
// database dalam satu request POST, jadi daftar ini memberi ilusi kemajuan
// yang informatif selama request berjalan.
const STAGES = [
  "Menyiapkan data pendaftar...",
  "Mengunggah CV...",
  "Mengunggah KTM...",
  "Mengunggah Twibbon...",
  "Mengunggah Bukti Follow & Repost...",
  "Mengunggah Portofolio...",
  "Menyimpan jawaban ke database...",
  "Menyelesaikan...",
];

const STAGE_DURATION_MS = 700;

/**
 * Overlay loading saat submit pendaftaran. Gaya visualnya menyamai loading
 * screen awal (logo/bola + progress bar), plus pesan tahapan & peringatan
 * agar pendaftar tidak menutup tab/browser.
 *
 * Dirender via portal ke document.body agar tidak terpengaruh transform scale
 * pada container halaman register. Mount-kan hanya saat `isSubmitting` true
 * (state stage fresh tiap kali submit).
 */
export const SubmitLoadingScreen = () => {
  const [stage, setStage] = useState(0);

  // Berganti tahap tiap STAGE_DURATION_MS; berhenti di tahap terakhir.
  // setStage di dalam callback setInterval bersifat asinkron (bukan synchronous
  // di body effect) -> tidak melanggar aturan set-state-in-effect.
  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, STAGE_DURATION_MS);
    return () => clearInterval(interval);
  }, []);

  const progress = ((stage + 1) / STAGES.length) * 100;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0C0B0A]/95 px-6 select-none"
      role="status"
      aria-live="polite"
    >
      <div className="flex w-full max-w-[420px] flex-col items-center gap-[24px]">
        {/* Logo (bola) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
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

        {/* Pesan tahapan */}
        <motion.p
          key={stage}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-[1.5em] text-center font-crosner text-base tracking-widest text-white uppercase sm:text-lg"
        >
          {STAGES[stage]}
        </motion.p>

        {/* Progress bar */}
        <div className="relative h-[6px] w-[240px] overflow-hidden rounded-full bg-[#2A2725]">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #F4631E 0%, #893310 50%, #7E0202 100%)",
            }}
          />
        </div>

        {/* Peringatan: jangan tutup tab/browser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 flex max-w-[320px] items-start gap-2"
        >
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-[#F4631E]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-left font-body text-xs leading-relaxed text-[#D1D1D1] sm:text-sm">
            Mohon <span className="font-semibold text-white">jangan tutup tab atau browser</span> selama proses
            pengunggahan berkas berlangsung.
          </p>
        </motion.div>
      </div>
    </motion.div>,
    document.body,
  );
};
