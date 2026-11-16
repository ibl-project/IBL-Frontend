"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { assetUrl } from "@/lib/apiClient";
import { type ExportSection, generateBoxScorePdf, prewarmBoxScoreExport } from "@/lib/boxScoreExport";
import type { MatchSnapshot } from "@/lib/matchesApi";
import { buildLoadingPage } from "@/lib/scoreDetailLoadingPage";
import { ScoringExportSheet } from "@/components/sections/ScoringPage/ScoringExportSheet";

interface ScoreDetailButtonProps {
  match: MatchSnapshot | null;
}

export function ScoreDetailButton({ match }: ScoreDetailButtonProps) {
  const [isPreparing, setIsPreparing] = useState(false);
  // Salinan data pertandingan yang dibekukan saat generate dimulai. Refresh live (tiap 60 detik)
  // tidak mengubah lembar yang sedang di-capture dan tidak memicu generate kedua; klik lagi untuk data terbaru.
  const [exportSnapshot, setExportSnapshot] = useState<MatchSnapshot | null>(null);
  const latestMatchRef = useRef(match);
  useEffect(() => {
    latestMatchRef.current = match;
  }, [match]);
  const pendingTabRef = useRef<Window | null>(null);
  // PDF siap tapi tab tidak bisa dibuka (diblokir popup blocker / tab ditutup user): tampilkan link manual.
  const [readyPdfUrl, setReadyPdfUrl] = useState<string | null>(null);
  const sheetsRef = useRef<HTMLDivElement>(null);

  // Hanya generate lembar "Total" (Box Score lengkap pertandingan) agar proses cepat dan efisien
  const sections: ExportSection[] = useMemo(() => ["total"], []);

  const team1Name = match?.team1.name || "Team 1";
  const team2Name = match?.team2.name || "Team 2";

  // Lepas blob URL link manual saat diganti atau komponen di-unmount. Ditunda agar tab yang baru
  // dibuka dari link sempat memuat PDF-nya dulu.
  useEffect(() => {
    if (!readyPdfUrl) return;
    return () => {
      setTimeout(() => URL.revokeObjectURL(readyPdfUrl), 60_000);
    };
  }, [readyPdfUrl]);

  /**
   * Tampilkan PDF di tab yang dibuka saat klik. Kalau tab itu tidak ada (diblokir) atau sudah ditutup,
   * jangan panggil window.open di sini: setelah await, browser tidak menganggapnya aksi user dan ikut memblokir.
   * Sebagai gantinya tampilkan link "Buka PDF" yang diklik user sendiri.
   */
  const deliverPdf = (url: string, targetTab: Window | null) => {
    if (targetTab && !targetTab.closed) {
      targetTab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } else {
      setReadyPdfUrl(url);
    }
  };

  // Warna tim diambil dari snapshot yang dibekukan, sama seperti datanya
  const color1 = exportSnapshot?.team1.color || "#074770";
  const color2 = exportSnapshot?.team2.color || "#760807";

  // Generate PDF secara dinamis dari DOM offscreen jika tidak ada file upload admin
  useEffect(() => {
    if (!exportSnapshot) return;
    const container = sheetsRef.current;
    if (!container) return;

    let active = true;
    const run = async () => {
      const targetTab = pendingTabRef.current;
      try {
        // Tanpa jeda requestAnimationFrame: rAF berhenti saat tab PDF dibuka di depan (halaman ini tersembunyi).
        // Lembar sudah ada di DOM (effect berjalan setelah commit), dan layout dihitung saat capture membacanya.
        await document.fonts?.ready;
        const blob = await generateBoxScorePdf(Array.from(container.children) as HTMLElement[]);
        deliverPdf(URL.createObjectURL(blob), targetTab);
      } catch (err) {
        console.error("Gagal generate PDF:", err);
        if (targetTab && !targetTab.closed) {
          targetTab.close();
        }
        alert("Gagal memuat detail score. Silakan coba lagi.");
      } finally {
        if (active) {
          setExportSnapshot(null);
          setIsPreparing(false);
          pendingTabRef.current = null;
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [exportSnapshot]);

  const handleClick = async () => {
    if (!match || isPreparing) return;
    setReadyPdfUrl(null);

    // Buka tab baru secara sinkron dari event klik user agar tidak diblokir popup blocker
    const newTab = window.open("", "_blank");
    if (newTab) {
      newTab.document.write(buildLoadingPage(team1Name, team2Name, window.location.origin));
      newTab.document.close();
    }

    setIsPreparing(true);
    pendingTabRef.current = newTab;

    // 1. Jika admin pernah mengunggah file PDF resmi di backend:
    if (match.resultFile) {
      try {
        const res = await fetch(assetUrl(match.resultFile.url), { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        deliverPdf(URL.createObjectURL(pdfBlob), newTab);
        setIsPreparing(false);
        pendingTabRef.current = null;
        return;
      } catch (err) {
        console.warn("Gagal mengambil file PDF admin, beralih ke generate otomatis:", err);
      }
    }

    // 2. Jika tidak ada file manual dari admin, generate otomatis dari data pertandingan
    // Pakai data terbaru saat generate dimulai (bisa lebih baru dari saat klik bila fetch file admin gagal)
    setExportSnapshot(latestMatchRef.current ?? match);
  };

  const buttonStyle =
    "relative inline-flex items-center justify-center " +
    "rounded-[3.5px] sm:rounded-[6px] md:rounded-[8px] " +
    "border border-[#5ed3df]/60 bg-gradient-to-b from-[#389ba6] to-[#1e6570] " +
    "px-[clamp(7px,1.8cqw,24px)] h-[clamp(17px,3.4cqw,40px)] " +
    "font-poppins font-bold text-white tracking-wide " +
    "text-[clamp(8px,1.25cqw,15px)] leading-none " +
    "shadow-[0_1px_3px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.2)_inset] sm:shadow-[0_2px_5px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.2)_inset] " +
    "transition-colors select-none";

  return (
    <div className="flex flex-col items-center gap-[0.6cqw]">
      <motion.button
        type="button"
        onClick={handleClick}
        onPointerEnter={(event) => prewarmBoxScoreExport(event.currentTarget)}
        onFocus={(event) => prewarmBoxScoreExport(event.currentTarget)}
        disabled={!match || isPreparing}
        title={!match ? "Memuat data pertandingan..." : "Buka Lembar Skor di Tab Baru"}
        whileHover={!isPreparing && match ? { scale: 1.05, filter: "brightness(1.1)" } : {}}
        whileTap={!isPreparing && match ? { scale: 0.96 } : {}}
        className={`${buttonStyle} ${
          !match
            ? "opacity-50 cursor-not-allowed"
            : isPreparing
              ? "opacity-90 cursor-wait"
              : "cursor-pointer hover:border-[#6fe5f0]"
        }`}
      >
        {isPreparing ? (
          <span className="flex items-center gap-1 sm:gap-2">
            <span className="inline-block size-2 sm:size-2.5 md:size-3 animate-spin rounded-full border border-white sm:border-2 border-t-transparent" />
            <span>Opening PDF...</span>
          </span>
        ) : (
          "Score Detail"
        )}
      </motion.button>

      {readyPdfUrl && (
        <a
          href={readyPdfUrl}
          target="_blank"
          rel="noopener"
          onClick={() => setReadyPdfUrl(null)}
          className="rounded-[4px] border border-[#380606] bg-[#fff5df] px-[0.8em] py-[0.3em] font-poppins text-[clamp(8px,1.1cqw,13px)] font-bold text-[#760807] shadow-[2px_2px_0_#380606] hover:bg-white"
        >
          PDF siap · Buka PDF
        </a>
      )}

      {/* Lembar export PDF: dirender di luar layar hanya selama generate PDF berjalan */}
      {exportSnapshot && (
        <div aria-hidden="true" className="pointer-events-none fixed top-0 left-[-20000px]">
          <div ref={sheetsRef} className="flex w-[1280px] flex-col gap-6 bg-white">
            {sections.map((section) => (
              <ScoringExportSheet
                key={String(section)}
                snapshot={exportSnapshot}
                section={section}
                color1={color1}
                color2={color2}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
