"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ApiError, assetUrl } from "@/lib/apiClient";
import { generateBoxScorePdf, prewarmBoxScoreExport } from "@/lib/boxScoreExport";
import { type MatchSnapshot, getMatch } from "@/lib/matchesApi";
import { ScoringExportSheet } from "@/components/sections/ScoringPage/ScoringExportSheet";

/**
 * Halaman PDF "Score Detail" (/schedule-result-main/score-detail?id=<matchId>).
 *
 * Halaman inilah yang membuat PDF, bukan halaman detail game. Di HP, tab yang tidak sedang dilihat
 * dibekukan browser: kalau PDF dibuat di halaman detail game sementara user menunggu di tab lain,
 * prosesnya berhenti. Di sini proses berjalan di tab yang sedang dilihat, jadi tidak dibekukan, dan
 * halaman ini juga bisa dibuka langsung, di-reload, atau dibuka dari in-app browser.
 *
 * Urutan: PDF resmi unggahan admin kalau ada, kalau tidak (atau gagal diambil) PDF dibuat dari data match.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Phase =
  | { kind: "loading-match" }
  | { kind: "building"; match: MatchSnapshot }
  | { kind: "not-found" }
  | { kind: "error"; message: string; match: MatchSnapshot | null };

/** PDF unggahan admin. Endpoint publik yang mengirim `Content-Disposition: attachment`, jadi diambil
 * sebagai blob agar bisa ditampilkan, bukan diunduh. Tidak lewat apiFetch karena responsnya PDF, bukan JSON. */
async function fetchAdminPdf(url: string): Promise<Blob> {
  const res = await fetch(assetUrl(url));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return new Blob([await res.blob()], { type: "application/pdf" });
}

/** Ganti halaman ini dengan PDF. replace (bukan push) supaya tombol Back kembali ke halaman sebelumnya. */
function showPdf(blob: Blob) {
  window.location.replace(URL.createObjectURL(blob));
}

export function ScoreDetailPdfSection() {
  const id = useSearchParams().get("id");
  const [phase, setPhase] = useState<Phase>({ kind: "loading-match" });
  const [attempt, setAttempt] = useState(0);
  const sheetsRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  // Ambil font lebih awal, paralel dengan request match
  useEffect(() => {
    if (rootRef.current) prewarmBoxScoreExport(rootRef.current);
  }, []);

  // 1. Ambil match; kalau ada PDF admin, langsung tampilkan
  useEffect(() => {
    let active = true;
    const run = async () => {
      setPhase({ kind: "loading-match" });
      if (!id || !UUID.test(id)) return setPhase({ kind: "not-found" });

      let match: MatchSnapshot;
      try {
        match = await getMatch(id);
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
          return setPhase({ kind: "not-found" });
        }
        return setPhase({ kind: "error", message: "Gagal memuat data pertandingan.", match: null });
      }
      if (!active) return;

      if (match.resultFile) {
        try {
          const blob = await fetchAdminPdf(match.resultFile.url);
          if (active) showPdf(blob);
          return;
        } catch (error) {
          console.warn("Gagal mengambil file PDF admin, beralih ke generate otomatis:", error);
        }
      }
      if (active) setPhase({ kind: "building", match });
    };
    void run();
    return () => {
      active = false;
    };
  }, [id, attempt]);

  // 2. Lembar box score sudah dirender (offscreen): buat PDF lalu tampilkan
  useEffect(() => {
    if (phase.kind !== "building") return;
    const container = sheetsRef.current;
    if (!container) return;

    let active = true;
    const run = async () => {
      try {
        await document.fonts?.ready;
        const blob = await generateBoxScorePdf(Array.from(container.children) as HTMLElement[]);
        if (active) showPdf(blob);
      } catch (error) {
        console.error("Gagal generate PDF:", error);
        if (active) setPhase({ kind: "error", message: "Gagal membuat lembar skor.", match: phase.match });
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [phase]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const match = phase.kind === "building" ? phase.match : phase.kind === "error" ? phase.match : null;
  const team1 = match?.team1.name || "Team 1";
  const team2 = match?.team2.name || "Team 2";
  const backHref = id && UUID.test(id) ? `/schedule-result-main/detail-game?id=${id}` : "/schedule-result-main";

  return (
    <main
      ref={rootRef}
      aria-busy={phase.kind === "loading-match" || phase.kind === "building"}
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f3e6ce] px-4 py-24 text-center font-poppins"
    >
      <Image
        src="/images/BACKGROUND.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 -z-10 object-cover object-top select-none"
      />

      <div className="flex flex-col items-center">
        <Image
          src="/images/logo-ibl.png"
          alt="IBL 2K26"
          width={140}
          height={153}
          priority
          className="h-auto w-[clamp(84px,12vw,140px)] drop-shadow-[3px_3px_0_#380606] motion-safe:animate-bounce"
        />

        <h1
          className="mt-4 font-hollywood text-[clamp(40px,8vw,88px)] leading-[0.9] tracking-wide text-[#c51610] uppercase"
          style={{ WebkitTextStroke: "2px #380606", paintOrder: "stroke fill", textShadow: "4px 4px 0 #380606" }}
        >
          Score Detail
        </h1>

        {match && (
          <div className="mt-4 inline-flex max-w-full items-stretch border-2 border-[#380606] text-[clamp(12px,1.6vw,16px)] font-extrabold tracking-wide uppercase shadow-[3px_3px_0_#380606]">
            <span className="truncate bg-[#074770] px-3.5 py-2 text-white">{team1}</span>
            <span className="flex items-center bg-[#fff5df] px-2.5 text-[#380606]">VS</span>
            <span className="truncate bg-[#760807] px-3.5 py-2 text-white">{team2}</span>
          </div>
        )}

        {(phase.kind === "loading-match" || phase.kind === "building") && (
          <>
            <div
              role="progressbar"
              aria-label="Menyiapkan box score"
              className="mt-6 h-2.5 w-[min(260px,60vw)] overflow-hidden border-2 border-[#380606] bg-[#fff5df]"
            >
              <div className="h-full w-2/5 animate-[score-detail-slide_1.1s_ease-in-out_infinite] bg-[#f4631e] motion-reduce:animate-none" />
            </div>
            <p className="mt-2.5 text-xs font-semibold text-[#380606]">
              {phase.kind === "loading-match" ? "Memuat data pertandingan…" : "Menyiapkan box score…"}
            </p>
          </>
        )}

        {phase.kind === "not-found" && (
          <StatusCard message="Pertandingan tidak ditemukan." backHref="/schedule-result-main" backLabel="Ke jadwal" />
        )}

        {phase.kind === "error" && (
          <StatusCard message={`${phase.message} Silakan coba lagi.`} backHref={backHref} backLabel="Kembali" onRetry={retry} />
        )}
      </div>

      {/* Lembar export PDF, dirender di luar layar hanya selama PDF dibuat */}
      {phase.kind === "building" && (
        <div aria-hidden="true" className="pointer-events-none fixed top-0 left-[-20000px]">
          <div ref={sheetsRef} className="flex w-[1280px] flex-col gap-6 bg-white">
            <ScoringExportSheet
              snapshot={phase.match}
              section="total"
              color1={phase.match.team1.color || "#074770"}
              color2={phase.match.team2.color || "#760807"}
            />
          </div>
        </div>
      )}

      <style>{`@keyframes score-detail-slide { from { transform: translateX(-100%); } to { transform: translateX(250%); } }`}</style>
    </main>
  );
}

function StatusCard({
  message,
  backHref,
  backLabel,
  onRetry,
}: {
  message: string;
  backHref: string;
  backLabel: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="mt-6 flex w-full max-w-[420px] flex-col items-center gap-4 rounded-2xl border-2 border-[#760807] bg-[#fff5df] px-6 py-6 text-[#760807] shadow-[3px_3px_0_#380606]"
    >
      <p className="text-sm font-bold">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-[#760807] px-5 py-2 text-sm font-bold text-white hover:bg-[#8a0a09]"
          >
            Coba lagi
          </button>
        )}
        <Link
          href={backHref}
          className="rounded-full border-2 border-[#760807] bg-[#fff5df] px-5 py-1.5 text-sm font-bold text-[#760807] shadow-[2px_2px_0_#380606] hover:bg-white"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
