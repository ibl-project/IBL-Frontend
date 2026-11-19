import React from "react";
import Image from "next/image";

import submittedText from "@/public/texts/form/Submitted.svg";
import goodLuckSvg from "@/public/texts/GOOD LUCK.webp";

export const FormSuccessScreen = () => {
  return (
    <div className="relative z-10 h-full w-full select-none">
      {/* Header Banner - Positioned absolute at 1680px from top */}
      <div className="absolute left-1/2 z-10 -translate-x-1/2" style={{ top: "1680px" }}>
        <Image src={submittedText} alt="Form Tersubmit" priority />
      </div>

      {/* GOOD LUCK Text Graphic - Positioned absolute at 1823px from top.
          To adjust height: change the top value below (e.g., top: "1850px" to move down, top: "1800px" to move up) */}
      <div className="absolute left-1/2 z-10 -translate-x-1/2" style={{ top: "2123px" }}>
        <Image src={goodLuckSvg} alt="Good Luck" priority />
      </div>
    </div>
  );
};
