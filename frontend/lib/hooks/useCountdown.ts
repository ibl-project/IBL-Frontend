import { useEffect, useState } from "react";

import type { CountdownTime } from "@/types/register";

const ZERO: CountdownTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };

const calculateRemaining = (target: Date): CountdownTime => {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return ZERO;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

/**
 * Menghitung sisa waktu menuju `target`, diperbarui setiap 1 detik.
 * Nilai awal adalah nol supaya aman dari hydration mismatch
 * (server & client render bernilai sama "00" saat pertama kali).
 */
export const useCountdown = (target: Date) => {
  const [time, setTime] = useState<CountdownTime>(ZERO);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const tick = () => {
      const remaining = calculateRemaining(target);
      setTime(remaining);
      setIsFinished(remaining.days + remaining.hours + remaining.minutes + remaining.seconds === 0);
    };

    tick(); // set nilai sebenarnya segera setelah mount
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return { time, isFinished };
};
