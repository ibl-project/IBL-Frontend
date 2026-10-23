"use client";

import { Variants } from "framer-motion";

/**
 * Sexy Spring Pop Variants:
 * Provides punchy, comic/sporty spring pop-in and pop-out on scroll.
 */
export const popSpringVariants: Variants = {
  hidden: {
    scale: 0.55,
    opacity: 0,
    y: 30,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.6,
    },
  },
  visible: (customDelay: number | { delay?: number } = 0) => {
    const delay = typeof customDelay === "number" ? customDelay : (customDelay?.delay ?? 0);
    return {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 18,
        mass: 0.8,
        delay,
      },
    };
  },
};

/**
 * Punchy Pop Variants (with dynamic rotation for stickers/badges/shoes/ball)
 */
export const popPunchVariants: Variants = {
  hidden: (custom: number | { rotation?: number } = -4) => {
    const rot = typeof custom === "number" ? custom : (custom?.rotation ?? -4);
    return {
      scale: 0.5,
      opacity: 0,
      rotate: rot * 2,
      y: 25,
      transition: {
        type: "spring",
        stiffness: 320,
        damping: 24,
      },
    };
  },
  visible: (custom: number | { delay?: number } = {}) => {
    const delay = typeof custom === "number" ? custom : (custom?.delay ?? 0);
    return {
      scale: 1,
      opacity: 1,
      rotate: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 16,
        mass: 0.85,
        delay,
      },
    };
  },
};

/**
 * Organic Floating Animations:
 * Gives subtle, lively ambient floating motion.
 */
export const createFloatingConfig = (
  yRange: number = 6,
  rotateRange: number = 2,
  duration: number = 4
) => ({
  animate: {
    y: [-yRange, yRange, -yRange],
    rotate: [-rotateRange, rotateRange, -rotateRange],
  },
  transition: {
    duration,
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "easeInOut" as const,
  },
});
