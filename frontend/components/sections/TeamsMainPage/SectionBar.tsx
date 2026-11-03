import React, { useId, useRef } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";

import { ARTBOARD, TEAMS_COLORS, TEXT_FILLS, type ArtboardVariant } from "./teamsMainTheme";
import { OutlinedText } from "./OutlinedText";

interface SectionBarProps {
  variant: ArtboardVariant;
  label: string;
  /** Kolom pencarian di strip abu-abu bar (desain Figma: placeholder "Himpunan Mahasiswa"). */
  search: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    /** Nama yang dibacakan pembaca layar. */
    label: string;
  };
}

/**
 * Ukuran font input yang tidak memicu zoom otomatis iOS Safari saat diketuk (di bawah 16 px Safari memperbesar
 * halaman). Input dirender 16 px lalu diperkecil dengan transform ke ukuran desain.
 */
const INPUT_FONT = 16;

export function SectionBar({ variant, label, search }: SectionBarProps) {
  const bar = ARTBOARD[variant].bar;
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const shrink = bar.searchFont / INPUT_FONT;
  const iconGap = bar.searchLeft;
  const inputWidth = bar.stripW - bar.searchLeft * 2 - bar.searchIcon - iconGap;
  const hasQuery = search.value.length > 0;
  const iconStyle = {
    right: bar.searchLeft,
    width: bar.searchIcon,
    height: bar.searchIcon,
    marginTop: -bar.searchIcon / 2,
  };

  return (
    <div
      className="relative mx-auto"
      style={{
        marginTop: bar.offset,
        width: bar.width,
        height: bar.height,
        boxSizing: "content-box",
        background: TEAMS_COLORS.teal,
        border: `${bar.border}px solid #000`,
        borderRadius: bar.radius,
      }}
    >
      <div
        aria-hidden
        className="absolute"
        style={{
          inset: `${bar.innerInsetY}px ${bar.innerInsetX}px`,
          background: "linear-gradient(180deg, #CB0404 -1.23%, #650202 98.77%)",
          borderRadius: bar.innerRadius,
        }}
      />
      <OutlinedText
        as="h2"
        outline={bar.labelStroke}
        outlineColor="#060606"
        fill={TEXT_FILLS.goldTeal}
        className="absolute uppercase"
        style={{ left: bar.labelLeft, top: bar.labelTop, fontFamily: "var(--font-drowner)", fontSize: bar.label, letterSpacing: "0.17em" }}
      >
        {label}
      </OutlinedText>
      <div
        role="search"
        className="absolute focus-within:ring-2 focus-within:ring-[#44D1D1]"
        style={{
          left: bar.stripLeft,
          top: bar.stripTop,
          width: bar.stripW,
          height: bar.stripH,
          borderRadius: bar.stripRadius,
          background: "linear-gradient(176.22deg, #F8F8F8 42.4%, #FFE27D 154.64%)",
          boxShadow: "inset 2.49px 3.32px 8.06px rgba(0, 0, 0, 0.35)",
        }}
      >
        {/* Seluruh strip bisa diklik untuk mulai mengetik (kursor teks), bukan hanya area teksnya. */}
        <label htmlFor={inputId} className="absolute inset-0 cursor-text">
          <span className="sr-only">{search.label}</span>
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={search.value}
          onChange={(event) => search.onChange(event.target.value)}
          placeholder={search.placeholder}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          className="absolute top-0 bg-transparent p-0 text-black outline-none placeholder:text-black/55 [&::-webkit-search-cancel-button]:hidden"
          style={{
            // Ukuran sebelum diperkecil; setelah scale(shrink) persis mengisi strip.
            left: bar.searchLeft,
            width: inputWidth / shrink,
            height: bar.stripH / shrink,
            transform: `scale(${shrink})`,
            transformOrigin: "0 0",
            fontFamily: "var(--font-drowner)",
            fontSize: INPUT_FONT,
            letterSpacing: "0.15em",
          }}
        />
        {hasQuery ? (
          <button
            type="button"
            aria-label="Hapus pencarian"
            onClick={() => {
              search.onChange("");
              inputRef.current?.focus();
            }}
            className="absolute top-1/2 flex cursor-pointer items-center justify-center rounded-full bg-[#44D1D1] text-[#2F3C41] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F3C41]"
            style={iconStyle}
          >
            <X strokeWidth={3} style={{ width: "62%", height: "62%" }} />
          </button>
        ) : (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 flex items-center justify-center rounded-full bg-[#44D1D1] text-[#2F3C41]"
            style={iconStyle}
          >
            <Search strokeWidth={3} style={{ width: "58%", height: "58%" }} />
          </span>
        )}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{ left: bar.fireball.left, top: bar.fireball.top, width: bar.fireball.width }}
      >
        <Image src="/svg/figma/basketapi.svg" alt="" width={370} height={489} className="h-auto w-full" />
      </div>
    </div>
  );
}
