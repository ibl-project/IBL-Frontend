import React from "react";
import ThankYouDesktop from "@/public/images/announcement/THANKYOU DESKTOP.svg";
import ResultTicket from "./ResultTicket";

interface TidakLolosSectionProps {
  nrp: string;
  urlName?: string;
}

export default function TidakLolosSection({ urlName }: TidakLolosSectionProps) {
  const displayName = urlName || "(nama)";

  return (
    <>
      <ResultTicket
        stickerSrc={ThankYouDesktop}
        stickerAlt="Thank You!"
        stickerClass="w-[220px] min-[426px]:w-[320px] sm:w-[350px] h-auto flex items-center justify-center mb-[-18px] z-10 relative"
        ticketMarginBottomClass=""
        contentStyle={{
          width: "71.65%",
          height: "30.85%",
          fontSize: "clamp(8px, 2.2vw, 14px)",
          lineHeight: "1.35",
          letterSpacing: "0.04em",
          opacity: 0.8,
        }}
      >
        <p className="my-0.5 tracking-widest">Hi, {displayName}</p>
        <p className="my-0.5 tracking-widest">
          Terima kasih telah mengikuti Open Recruitment Staff IBL2k26.
        </p>
        <p className="my-0.5 tracking-widest">
          Mohon maaf, pada kesempatan ini Anda belum dinyatakan lolos.
        </p>
        <p className="my-0.5 tracking-widest">
          Keep growing and see you on another opportunity!
        </p>
      </ResultTicket>
    </>
  );
}
