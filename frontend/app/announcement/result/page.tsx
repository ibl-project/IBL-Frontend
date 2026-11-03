import React from "react";
import Image from "next/image";

// Background Assets & Layout Components
import Texture from "@/public/images/announcement/Texture.svg";
import TwoSixSection from "@/components/sections/Announcement/TwoSixSection";
import PageScaleWrapper from "@/components/sections/Announcement/PageScaleWrapper";
import HeightSpacer from "@/components/sections/Announcement/HeightSpacer";
import PlayersAnimationResult from "@/components/sections/Announcement/result/PlayersAnimationResult";

// Result Section Components
import LolosSection from "@/components/sections/Announcement/result/LolosSection";
import TidakLolosSection from "@/components/sections/Announcement/result/TidakLolosSection";
import TidakTerdaftarSection from "@/components/sections/Announcement/result/TidakTerdaftarSection";

// Direct server-side database imports for verification
import lolosStaff from "@/constants/lolos_staff.json";
import tidakLolosStaff from "@/constants/tidak_lolos_staff.json";

interface StaffDetail {
  nama: string;
  nrp: string;
  subdivisi: string;
  cp_name: string;
  cp_phone: string;
}

interface TidakLolosDetail {
  nama: string;
}

const staffDatabase = lolosStaff as Record<string, StaffDetail>;
const tidakLolosDatabase = tidakLolosStaff as Record<string, TidakLolosDetail>;

/**
 * Server-side NRP verification.
 * URL parameters like `status` are completely ignored — the actual status
 * is always determined by looking up the NRP in the databases.
 */
function verifyNRP(nrp: string) {
  if (!nrp) {
    return { status: "tidak_terdaftar" as const };
  }

  const normalizedNrp = nrp.trim().replace(/\D/g, "");

  // 1. Check if staff passed (lolos)
  const staffMember = staffDatabase[normalizedNrp];
  if (staffMember) {
    return {
      status: "lolos" as const,
      nama: staffMember.nama,
      subdivisi: staffMember.subdivisi,
      cp_name: staffMember.cp_name,
      cp_phone: staffMember.cp_phone,
    };
  }

  // 2. Check if staff was interviewed but did not pass (tidak lolos)
  const tidakLolosMember = tidakLolosDatabase[normalizedNrp];
  if (tidakLolosMember) {
    return {
      status: "tidak_lolos" as const,
      nama: tidakLolosMember.nama,
    };
  }

  // 3. NRP not found in any database
  return {
    status: "tidak_terdaftar" as const,
    cp_name: "Arya",
    cp_phone: "6282258425646",
  };
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const nrp = typeof params.nrp === "string" ? params.nrp : "";

  // Server-side verification — URL `status` param is completely ignored
  const result = verifyNRP(nrp);

  let resultSection: React.ReactNode;

  if (result.status === "lolos") {
    resultSection = (
      <LolosSection
        nrp={nrp}
        urlName={result.nama}
        subdivisi={result.subdivisi}
        cpName={result.cp_name}
        cpPhone={result.cp_phone}
      />
    );
  } else if (result.status === "tidak_terdaftar") {
    resultSection = (
      <TidakTerdaftarSection
        nrp={nrp}
        cpName={result.cp_name}
        cpPhone={result.cp_phone}
      />
    );
  } else {
    resultSection = <TidakLolosSection nrp={nrp} urlName={result.nama} />;
  }

  return (
    <div className="min-h-dvh bg-bone relative w-full overflow-x-hidden overflow-y-auto">
      {/* Invisible spacer to push page height dynamically on large screens */}
      <HeightSpacer />

      {/* === LAYER 1: Players & TwoSix (z-5 di root saat large screen) === */}
      <PageScaleWrapper zIndex={5}>
        <div className="relative min-h-full flex flex-col items-center w-full">
          {/* TwoSix — DOM pertama di dalam wrapper = z paling bawah di atas texture */}
          <TwoSixSection />
          <PlayersAnimationResult />
        </div>
      </PageScaleWrapper>

      {/* === LAYER 2: Texture (z-20 di root, absolute — tidak ikut scroll) === */}
      <div className="absolute inset-0 z-[20] pointer-events-none">
        <Image
          src={Texture}
          alt="Background texture"
          fill
          className="object-cover"
        />
      </div>

      {/* === LAYER 3: Result Cards (z-30 di root saat large screen) === */}
      <PageScaleWrapper zIndex={30}>
        <div className="relative min-h-full flex flex-col items-center w-full">
          {/* Center layout container, positioned exactly where LandingSection is */}
          <div className="absolute top-[152px] left-1/2 -translate-x-1/2 flex flex-col items-center z-[100] w-full max-w-[90vw] sm:w-auto sm:max-w-none">
            {resultSection}
          </div>
        </div>
      </PageScaleWrapper>
    </div>
  );
}

