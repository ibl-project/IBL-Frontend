import React from "react";
import CongratsDesktop from "@/public/images/announcement/CONGRATS DESKTOP.svg";
import ResultTicket from "./ResultTicket";
import WhatsAppContact from "./WhatsAppContact";

interface LolosSectionProps {
  nrp: string;
  urlName?: string;
  subdivisi?: string;
  cpName?: string;
  cpPhone?: string;
}

export default function LolosSection({
  urlName,
  cpName,
  cpPhone,
}: LolosSectionProps) {
  const displayName = urlName || "(nama)";
  const acceptMessage = "Anda telah berhasil lolos Open Recruitment Staff IBL2K26.";


  return (
    <>
      <ResultTicket
        headerText="WELCOME TO THE TEAM"
        stickerSrc={CongratsDesktop}
        stickerAlt="Congratulations!"
        stickerClass="w-[180px] min-[426px]:w-[260px] sm:w-[280px] h-auto flex items-center justify-center z-10 relative"
        ticketMarginBottomClass=""
        contentStyle={{
          width: "80.1%",
          height: "44.9%",
          fontSize: "clamp(9px, 2.5vw, 16px)",
          lineHeight: "1.35",
        }}
        footerNode={
          <WhatsAppContact
            contactName={cpName || "NAMA"}
            phoneNumber={cpPhone || "628000000000"}
            disablePrefill={true}
          />
        }
      >
        <p className="mb-2 tracking-widest">Hi, {displayName}</p>
        <p className="mb-2 tracking-widest">{acceptMessage}</p>
        <p className="tracking-widest">Selamat datang di keluarga besar IBL2K26!</p>
      </ResultTicket>
    </>
  );
}
