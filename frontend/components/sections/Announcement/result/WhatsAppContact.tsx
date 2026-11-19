import React from "react";

interface WhatsAppContactProps {
  contactName: string;
  phoneNumber: string; // e.g., "6281234567890"
  customText?: string;
  disablePrefill?: boolean;
}

export default function WhatsAppContact({
  contactName,
  phoneNumber,
  customText,
  disablePrefill,
}: WhatsAppContactProps) {
  let waLink = `https://wa.me/${phoneNumber}`;

  if (!disablePrefill && customText) {
    waLink += `?text=${encodeURIComponent(customText)}`;
  }

  return (
    <div
      className="absolute flex w-full flex-col items-center justify-center"
      style={{
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        paddingTop: "clamp(8px, 2vw, 16px)",
        gap: "clamp(6px, 1.5vw, 12px)",
      }}
    >
      {/* Dynamic text above the button */}
      <p
        className="text-center font-drowner text-black select-none"
        style={{
          fontFamily: "var(--font-drowner), sans-serif",
          fontStyle: "normal",
          fontWeight: "400",
          fontSize: "clamp(9px, 2.5vw, 16px)",
          lineHeight: "1.3",
          letterSpacing: "0.08em",
          opacity: 0.8,
          maxWidth: "90%",
        }}
      >
        {customText || "Konfirmasi ke contact person di bawah ini:"}
      </p>

      {/* WhatsApp Button (Functional Link) */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex cursor-pointer items-center justify-center gap-1.5 font-drowner transition-all select-none hover:opacity-90 active:translate-y-0.5 active:shadow-[4px_4px_0px_#000] min-[426px]:gap-2.5 min-[426px]:active:shadow-[6px_6px_0px_#000]"
        style={{
          width: "clamp(200px, 60vw, 350px)",
          height: "clamp(24px, 5.5vw, 32px)",
          backgroundColor: "#25D366",
          border: "2px solid #000000",
          boxShadow: "clamp(4px, 1.2vw, 8px) clamp(4px, 1.2vw, 8px) 0px #000000",
          borderRadius: "100px",
          color: "#FFFFFF",
          fontSize: "clamp(8px, 2.2vw, 14px)",
          lineHeight: "1",
          padding: "clamp(6px, 1.5vw, 10px)",
          fontFamily: "var(--font-drowner), sans-serif",
          textDecoration: "none",
        }}
      >
        {/* Tabler Icons / brand-whatsapp */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 flex-shrink-0 min-[426px]:h-6 min-[426px]:w-6"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
          <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
        </svg>
        <span className="tracking-wide">
          {phoneNumber} ({contactName})
        </span>
      </a>
    </div>
  );
}
