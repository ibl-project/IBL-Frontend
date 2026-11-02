"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { ARTBOARD, MOBILE_MAX_WIDTH, type ArtboardVariant } from "./teamsMainTheme";

export interface ArtboardMetrics {
  variant: ArtboardVariant;
  scale: number;
}

function metricsFor(width: number): ArtboardMetrics {
  const variant: ArtboardVariant = width < MOBILE_MAX_WIDTH ? "mobile" : "desktop";
  const ratio = width / ARTBOARD[variant].width;
  return { variant, scale: variant === "desktop" ? Math.min(ratio, 1) : ratio };
}

/**
 * Varian artboard dan skala dari lebar kontainer (bukan window.innerWidth,
 * yang ikut menghitung scrollbar). Bernilai null sampai kontainer terukur.
 */
export function useArtboard<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [metrics, setMetrics] = useState<ArtboardMetrics | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = (width: number) => {
      if (width <= 0) return;
      const next = metricsFor(width);
      setMetrics((prev) => (prev?.variant === next.variant && prev.scale === next.scale ? prev : next));
    };

    update(element.clientWidth);
    const observer = new ResizeObserver(([entry]) => update(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, metrics };
}
