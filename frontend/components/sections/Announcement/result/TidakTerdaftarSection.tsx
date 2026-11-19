import React from "react";

import ThankYouDesktop from "@/public/images/announcement/THANKYOU DESKTOP.svg";

import ResultTicket from "./ResultTicket";
import WhatsAppContact from "./WhatsAppContact";

interface TidakTerdaftarSectionProps {
  nrp: string;
  cpName?: string;
  cpPhone?: string;
}

export default function TidakTerdaftarSection({ nrp, cpName, cpPhone }: TidakTerdaftarSectionProps) {
  return (
    <>
      <ResultTicket
        stickerSrc={ThankYouDesktop}
        stickerAlt="Not Registered"
        stickerClass="w-[220px] min-[426px]:w-[320px] sm:w-[350px] h-auto flex items-center justify-center mb-[-18px] z-10 relative"
        ticketMarginBottomClass=""
        contentStyle={{
          width: "71.65%",
          height: "30.85%",
          fontSize: "clamp(8px, 2vw, 13px)",
          lineHeight: "1.35",
          letterSpacing: "0.04em",
          opacity: 0.8,
        }}
        footerNode={
          <WhatsAppContact
            contactName={cpName || "Arya"}
            phoneNumber={cpPhone || "6282258425646"}
            customText="PIC Website Backend - Database"
            disablePrefill={true}
          />
        }
      >
        <p className="my-0.5 tracking-widest">
          Mohon maaf, untuk {nrp} tidak terdaftar di database Open Recruitment Staff IBL2K26.
        </p>
        <p className="my-0.5 tracking-widest">
          Bila kamu merasa mendaftar, bisa menghubungi Contact Person di bawah ini.
        </p>
      </ResultTicket>
    </>
  );
}
