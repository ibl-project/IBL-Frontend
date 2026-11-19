"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import { ApiError, login, restoreSession } from "@/lib/apiClient";

/**
 * Tujuan setelah login: halaman asal (?from=/scoring) atau /teams.
 * Hanya path internal yang diterima, supaya link login tidak bisa dipakai
 * untuk mengarahkan panitia ke situs lain (mis. ?from=//situs-palsu.com).
 */
function nextPath(): string {
  const from = new URLSearchParams(window.location.search).get("from");
  if (from && /^\/(?![\\/])/.test(from) && !from.startsWith("/login")) return from;
  return "/teams";
}

function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // 0 = server tidak terjangkau, 401 = email/password salah,
    // 403 = akun dinonaktifkan, 429 = terlalu banyak percobaan.
    if ([0, 401, 403, 429].includes(error.status)) return error.message;
    if (error.status === 400) return "Format email atau password tidak valid.";
    if (error.status >= 500) return "Server sedang bermasalah. Coba lagi beberapa saat lagi.";
  }
  return "Terjadi kesalahan. Coba lagi.";
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sudah login (sesi masih sah di backend)? Langsung lanjut ke dashboard.
  useEffect(() => {
    let active = true;
    void restoreSession().then((user) => {
      if (active && user) router.replace(nextPath());
    });
    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Email & password dicek backend terhadap database (POST /api/auth/login).
      await login(email, password, rememberMe);
      router.replace(nextPath());
    } catch (err) {
      setError(loginErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col-reverse bg-white font-sans md:flex-row">
      {/* Bagian Kiri (Desktop) / Bawah (Mobile) - Gambar */}
      <div className="relative flex min-h-[30vh] w-full items-center justify-center overflow-hidden bg-[#42616A] md:min-h-screen md:w-1/2">
        {/* Background Locker (Sudah include tulisan IBL) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/design kiri.png"
            alt="Locker Background"
            fill
            className="object-cover object-top md:object-center"
            priority
          />
        </div>
      </div>

      {/* Bagian Kanan (Desktop) / Atas (Mobile) - Form Login */}
      <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden bg-white p-6 sm:p-12 md:min-h-screen md:w-1/2 lg:p-24">
        {/* Logo IBL khusus mobile di atas form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -10, 0],
          }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { type: "spring", stiffness: 300, damping: 20 },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
          }}
          className="z-10 mb-8 flex w-full max-w-[180px] justify-center md:hidden"
        >
          <Image src="/images/ibl2k26login.png" alt="IBL 2K26" width={180} height={180} className="object-contain" />
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="z-10 w-full max-w-[400px]"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Input Email */}
            <div className="relative mt-2">
              <label
                htmlFor="email"
                className="absolute -top-2.5 left-3 z-10 bg-white px-1 text-[12px] font-medium text-gray-600"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
                required
              />
            </div>

            {/* Input Password */}
            <div className="relative mt-6">
              <label
                htmlFor="password"
                className="absolute -top-2.5 left-3 z-10 bg-white px-1 text-[12px] font-medium text-gray-600"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 z-20 flex items-center pr-4 text-gray-600 transition-colors hover:text-gray-900 focus:outline-none"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                )}
              </button>
            </div>

            {/* Checkbox Remember Me */}
            <div className="flex items-center pt-2">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded-sm border-gray-400 text-[#7A9EA8] accent-[#7A9EA8] focus:ring-[#7A9EA8]"
              />
              <label htmlFor="remember_me" className="ml-2.5 block cursor-pointer text-sm font-medium text-gray-600">
                Remember me
              </label>
            </div>

            {/* Pesan error dari backend (password salah, akun nonaktif, server mati) */}
            {error && (
              <p
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}

            {/* Tombol Sign In */}
            <motion.button
              whileHover={isLoading ? undefined : { scale: 1.015 }}
              whileTap={isLoading ? undefined : { scale: 0.985 }}
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full justify-center rounded-full border border-transparent bg-[#7A9EA8] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#668790] focus:ring-2 focus:ring-[#7A9EA8] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Memeriksa..." : "Sign In"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
