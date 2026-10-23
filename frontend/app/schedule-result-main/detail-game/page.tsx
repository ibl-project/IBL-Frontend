import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ScheduleResultMainDetailSection } from "@/components/sections/ScheduleResultMainPage/ScheduleResultMainDetailSection";

export const metadata: Metadata = {
  title: "Game Detail | IBL 2K26",
  description: "Detail pertandingan dan ringkasan statistik pertandingan IBL 2K26.",
};

export default function DetailGamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f3e6ce] pt-24 text-center font-poppins text-lg font-bold text-[#760807]">
          Loading match detail...
        </div>
      }
    >
      <ScheduleResultMainDetailSection />
    </Suspense>
  );
}
