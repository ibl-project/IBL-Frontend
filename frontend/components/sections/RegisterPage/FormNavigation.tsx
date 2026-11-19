import React from "react";
import Image from "next/image";

import { motion } from "framer-motion";

import Button from "@/components/ui/Button";

interface FormNavigationProps {
  step: number;
  goToStep: (step: number) => void;
  handleNext: () => void;
  handleBack: () => void;
  isSubmitting?: boolean;
}

export const FormNavigation = ({
  step,
  goToStep,
  handleNext,
  handleBack,
  isSubmitting = false,
}: FormNavigationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute left-1/2 z-20 flex -translate-x-1/2 items-center justify-between"
      style={{
        top: "3151px",
        width: "1066px",
        height: "var(--nav-height)",
        paddingLeft: "var(--nav-padding)",
        paddingRight: "var(--nav-padding)",
      }}
    >
      <div className="flex justify-start" style={{ width: "var(--btn-width)" }}>
        {step > 1 ? (
          <Button onClick={handleBack} disabled={isSubmitting}>
            BACK
          </Button>
        ) : (
          <div
            style={{
              width: "var(--btn-width)",
              height: "var(--btn-height)",
            }}
          />
        )}
      </div>

      {/* Basketball Indicators */}
      <div className="flex items-center justify-center" style={{ gap: "var(--nav-ball-gap)" }}>
        {[1, 2, 3, 4, 5].map((s) => {
          const isActive = s === step;
          // Bola saat ini, sebelumnya, atau tepat +1 berikutnya boleh diklik.
          // Bola di atasnya (lompatan) dimatikan agar navigasi bertahap.
          const isReachable = s <= step + 1;
          return (
            <div
              key={s}
              onClick={isReachable && !isSubmitting ? () => goToStep(s) : undefined}
              className={`relative drop-shadow-[2px_2px_0px_rgba(0,0,0,1.00)] filter transition-all duration-300 ease-out ${isReachable ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
              style={{
                width: isActive ? "var(--nav-ball-active-size)" : "var(--nav-ball-inactive-size)",
                height: isActive ? "var(--nav-ball-active-size)" : "var(--nav-ball-inactive-size)",
              }}
            >
              <Image src="/images/Basketball.svg" alt={`Step ${s}`} fill className="object-contain" />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end" style={{ width: "var(--btn-width)" }}>
        <Button onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? "SUBMITTING..." : step === 5 ? "SUBMIT" : "NEXT"}
        </Button>
      </div>
    </motion.div>
  );
};
