"use client";

import React, { useState } from "react";
import Image from "next/image";

import { assetUrl } from "@/lib/apiClient";
import { DEFAULT_TEAM_LOGO } from "@/lib/teamsApi";

interface TeamLogoProps {
  /** "/images/...", "/api/teams/<id>/logo?v=...", atau blob: (pratinjau file). */
  src?: string | null;
  alt?: string;
  sizes?: string;
  className?: string;
}

/**
 * Logo tim. Logo hasil upload dilayani backend dan sudah berupa WebP 512px,
 * jadi tidak perlu dioptimasi ulang oleh Next (unoptimized). Kalau gagal
 * dimuat, kembali ke logo IBL.
 */
export const TeamLogo = ({ src, alt = "", sizes = "96px", className = "object-contain" }: TeamLogoProps) => {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const resolved = !src || brokenSrc === src ? DEFAULT_TEAM_LOGO : assetUrl(src);
  const external = /^(https?:|blob:)/.test(resolved);

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={external}
      onError={() => {
        if (src) setBrokenSrc(src);
      }}
      className={className}
    />
  );
};
