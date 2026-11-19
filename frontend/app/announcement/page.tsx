import React from "react";
import Image from "next/image";

import HeightSpacer from "@/components/sections/Announcement/HeightSpacer";
import LandingSection from "@/components/sections/Announcement/LandingSectionAnnouncement";
import PageScaleWrapper from "@/components/sections/Announcement/PageScaleWrapper";
import PlayersAnimationWrapper from "@/components/sections/Announcement/PlayersAnimationWrapper";
import TwoSixSection from "@/components/sections/Announcement/TwoSixSection";
import Texture from "@/public/images/announcement/Texture.svg";

const page = () => {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bone min-[1440px]:h-auto min-[1440px]:min-h-dvh min-[1440px]:overflow-x-hidden min-[1440px]:overflow-y-auto">
      {/* Invisible spacer to push page height dynamically on large screens */}
      <HeightSpacer />

      {/* === LAYER 1: Players & TwoSix (z-5 di root saat large screen) === */}
      <PageScaleWrapper zIndex={5}>
        <div className="relative flex min-h-full w-full flex-col items-center">
          {/* TwoSix — DOM pertama di dalam wrapper = z paling bawah di atas texture */}
          <TwoSixSection />
          {/* Client animation wrapper for players SVGs */}
          <PlayersAnimationWrapper />
        </div>
      </PageScaleWrapper>

      {/* === LAYER 2: Texture (z-20 di root, absolute — tidak ikut scroll) === */}
      <div className="pointer-events-none absolute inset-0 z-[20]">
        <Image src={Texture} alt="Background texture" fill className="object-cover" />
      </div>

      {/* === LAYER 3: LandingSection (z-30 di root saat large screen) === */}
      <PageScaleWrapper zIndex={30}>
        <div className="relative flex min-h-full w-full flex-col items-center">
          <LandingSection />
        </div>
      </PageScaleWrapper>
    </div>
  );
};

export default page;
