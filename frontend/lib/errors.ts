import { ApiError } from "@/lib/apiClient";

/** Pesan error yang aman ditampilkan ke panitia, plus detail validasi pertama. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Terjadi kesalahan. Coba lagi.";
  // Hanya detail validasi (teks per field) yang ditempel; detail lain, mis.
  // nama pemegang sesi scoring, sudah ada di pesannya.
  if (error.code !== "BAD_REQUEST") return error.message;
  const detail = error.details ? Object.values(error.details)[0] : undefined;
  return typeof detail === "string" && detail ? `${error.message} (${detail})` : error.message;
}
