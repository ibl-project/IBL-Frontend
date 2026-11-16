"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { assetUrl } from "@/lib/apiClient";
import { type ExportSection, generateBoxScorePdf } from "@/lib/boxScoreExport";
import type { MatchSnapshot } from "@/lib/matchesApi";
import { ScoringExportSheet } from "@/components/sections/ScoringPage/ScoringExportSheet";

interface ScoreDetailButtonProps {
  match: MatchSnapshot | null;
}

export function ScoreDetailButton({ match }: ScoreDetailButtonProps) {
  const [isPreparing, setIsPreparing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const pendingTabRef = useRef<Window | null>(null);
  const sheetsRef = useRef<HTMLDivElement>(null);

  // Hanya generate lembar "Total" (Box Score lengkap pertandingan) agar proses cepat dan efisien
  const sections: ExportSection[] = useMemo(() => ["total"], []);
  const color1 = match?.team1.color || "#074770";
  const color2 = match?.team2.color || "#760807";

  const team1Name = match?.team1.name || "Team 1";
  const team2Name = match?.team2.name || "Team 2";

  // Generate PDF secara dinamis dari DOM offscreen jika tidak ada file upload admin
  useEffect(() => {
    if (!isGenerating || !match) return;
    const container = sheetsRef.current;
    if (!container) return;

    let active = true;
    const run = async () => {
      const targetTab = pendingTabRef.current;
      try {
        await document.fonts?.ready;
        await new Promise((resolve) => setTimeout(resolve, 80));
        const blob = await generateBoxScorePdf(Array.from(container.children) as HTMLElement[]);
        const url = URL.createObjectURL(blob);

        if (targetTab && !targetTab.closed) {
          targetTab.location.href = url;
        } else {
          window.open(url, "_blank");
        }

        // Revoke URL setelah beberapa menit agar tidak ada memory leak
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } catch (err) {
        console.error("Gagal generate PDF:", err);
        if (targetTab && !targetTab.closed) {
          targetTab.close();
        }
        alert("Gagal memuat detail score. Silakan coba lagi.");
      } finally {
        if (active) {
          setIsGenerating(false);
          setIsPreparing(false);
          pendingTabRef.current = null;
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [isGenerating, match]);

  const handleClick = async () => {
    if (!match || isPreparing) return;

    // Buka tab baru secara sinkron dari event klik user agar tidak diblokir popup blocker
    const newTab = window.open("", "_blank");
    if (newTab) {
      newTab.document.write(`
        <!DOCTYPE html>
        <html lang="id">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Score Detail - ${team1Name} vs ${team2Name}</title>
            <style>
              body {
                margin: 0;
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: #0f172a;
                color: #ffffff;
                text-align: center;
                padding: 16px;
                box-sizing: border-box;
              }
              .spinner {
                width: 38px;
                height: 38px;
                border: 3px solid rgba(255, 255, 255, 0.2);
                border-top-color: #44d1d1;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin-bottom: 16px;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              h2 { margin: 0 0 8px; font-size: 18px; font-weight: 700; }
              p { margin: 0; font-size: 13px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="spinner"></div>
            <h2>Menyiapkan Lembar Skor Detail</h2>
            <p>${team1Name} vs ${team2Name} · Box Score</p>
          </body>
        </html>
      `);
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
        const url = URL.createObjectURL(pdfBlob);

        if (newTab && !newTab.closed) {
          newTab.location.href = url;
        } else {
          window.open(url, "_blank");
        }

        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        setIsPreparing(false);
        pendingTabRef.current = null;
        return;
      } catch (err) {
        console.warn("Gagal mengambil file PDF admin, beralih ke generate otomatis:", err);
      }
    }

    // 2. Jika tidak ada file manual dari admin, generate otomatis dari data pertandingan
    setIsGenerating(true);
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
    <>
      <motion.button
        type="button"
        onClick={handleClick}
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

      {/* Lembar export PDF: dirender di luar layar hanya selama generate PDF berjalan */}
      {isGenerating && match && (
        <div aria-hidden="true" className="pointer-events-none fixed top-0 left-[-20000px]">
          <div ref={sheetsRef} className="flex w-[1280px] flex-col gap-6 bg-white">
            {sections.map((section) => (
              <ScoringExportSheet
                key={String(section)}
                snapshot={match}
                section={section}
                color1={color1}
                color2={color2}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
