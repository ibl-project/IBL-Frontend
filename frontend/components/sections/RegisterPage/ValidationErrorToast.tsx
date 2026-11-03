"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ValidationErrorToastProps {
  message: string | null;
  onDismiss: () => void;
  /** Auto-dismiss duration in milliseconds (default: 3000) */
  duration?: number;
}

const subscribeNoop = () => () => {};

export const ValidationErrorToast = ({
  message,
  onDismiss,
  duration = 3000,
}: ValidationErrorToastProps) => {
  // True only on the client, so createPortal can safely access document.body
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
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
            className="fixed left-1/2 top-1/2 z-[10000] -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
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
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#864B4D" }}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </motion.div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-crosner text-xs font-bold uppercase tracking-widest"
                    style={{ color: "#F4631E" }}
                  >
                    Peringatan
                  </p>
                  <p
                    className="font-body text-sm mt-1 leading-snug"
                    style={{ color: "#EFE8DE" }}
                  >
                    {message}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={onDismiss}
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 cursor-pointer"
                  aria-label="Tutup"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="#EFE8DE"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Animated countdown bar */}
              <div className="w-full h-[3px]" style={{ backgroundColor: "#864B4D33" }}>
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
    document.body
  );
};
