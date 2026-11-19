"use client";

import React, { useEffect, useState } from "react";

export default function PageScaleWrapper({ children, zIndex }: { children: React.ReactNode; zIndex?: number }) {
  const [scale, setScale] = useState(1);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      if (vw >= 1440) {
        setScale(vw / 1440);
        setIsLargeScreen(true);
      } else {
        setScale(1);
        setIsLargeScreen(false);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      style={{
        transform: isLargeScreen ? `scale(${scale})` : "none",
        transformOrigin: "top left",
        width: isLargeScreen ? "1440px" : "100%",
        minHeight: isLargeScreen ? `${100 / scale}vh` : "100vh",
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: zIndex,
      }}
    >
      {children}
    </div>
  );
}
