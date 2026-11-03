import React, { type CSSProperties, type ElementType } from "react";

interface OutlinedTextProps {
  as?: ElementType;
  children: string;
  /** Lebar garis tepi yang terlihat di luar huruf, dalam piksel desain (nilai "border" di Figma). */
  outline: number;
  outlineColor: string;
  /** Warna isi atau gradasi CSS. */
  fill: string;
  /** Argumen drop-shadow() CSS untuk seluruh teks, opsional. */
  shadow?: string;
  className?: string;
  /** Kelas untuk kedua salinan teks (mis. truncate, line-clamp-2), agar keduanya terpotong sama. */
  textClassName?: string;
  style?: CSSProperties;
  title?: string;
  id?: string;
}

/**
 * Teks dengan garis tepi di luar huruf. Stroke CSS berada di tengah tepi huruf, jadi salinan
 * belakang diberi stroke dua kali lebih tebal dan salinan depan (isi) menutup separuh dalamnya.
 */
export function OutlinedText({
  as: Tag = "span",
  children,
  outline,
  outlineColor,
  fill,
  shadow,
  className = "",
  textClassName = "",
  style,
  title,
  id,
}: OutlinedTextProps) {
  const fillStyle: CSSProperties = fill.includes("gradient(")
    ? { backgroundImage: fill, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }
    : { color: fill };

  return (
    <Tag
      id={id}
      title={title}
      className={`relative inline-grid grid-cols-[minmax(0,1fr)] ${className}`}
      style={{ ...style, filter: shadow ? `drop-shadow(${shadow})` : undefined }}
    >
      <span
        aria-hidden
        className={`col-start-1 row-start-1 ${textClassName}`}
        style={{ color: outlineColor, WebkitTextStroke: `${outline * 2}px ${outlineColor}` }}
      >
        {children}
      </span>
      <span className={`col-start-1 row-start-1 ${textClassName}`} style={fillStyle}>
        {children}
      </span>
    </Tag>
  );
}
