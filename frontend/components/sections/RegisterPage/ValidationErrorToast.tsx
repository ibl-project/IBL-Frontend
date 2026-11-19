"use client";

import React, { useEffect, useSyncExternalStore } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

interface ValidationErrorToastProps {
  message: string | null;
  onDismiss: () => void;
  /** Auto-dismiss duration in milliseconds (default: 3000) */
  duration?: number;
}

const subscribeNoop = () => () => {};

export const ValidationErrorToast = ({ message, onDismiss, duration = 3000 }: ValidationErrorToastProps) => {
  // True only on the client, so createPortal can safely access document.body
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, onDismiss, duration]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {message && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-[2px]"
            onClick={onDismiss}
          />

          {/* Toast modal */}
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
              mass: 0.8,
            }}
            className="pointer-events-auto fixed top-1/2 left-1/2 z-[10000] -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="relative overflow-hidden shadow-2xl"
              style={{
                backgroundColor: "#2D1214",
                border: "2px solid #864B4D",
                borderRadius: "16px",
                minWidth: "340px",
                maxWidth: "520px",
                padding: "0",
              }}
            >
              {/* Content */}
              <div className="flex items-start gap-3 px-5 pt-5 pb-4">
                {/* Icon */}
                <motion.div
                  initial={{ rotate: -15, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 12,
                    delay: 0.1,
                  }}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#864B4D" }}
                >
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </motion.div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className="font-crosner text-xs font-bold tracking-widest uppercase" style={{ color: "#F4631E" }}>
                    Peringatan
                  </p>
                  <p className="mt-1 font-body text-sm leading-snug" style={{ color: "#EFE8DE" }}>
                    {message}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={onDismiss}
                  className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10"
                  aria-label="Tutup"
                >
                  <svg className="h-4 w-4" fill="none" stroke="#EFE8DE" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Animated countdown bar */}
              <div className="h-[3px] w-full" style={{ backgroundColor: "#864B4D33" }}>
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                  className="h-full"
                  style={{
                    background: "linear-gradient(90deg, #F4631E, #864B4D)",
                    borderRadius: "0 0 0 2px",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};
