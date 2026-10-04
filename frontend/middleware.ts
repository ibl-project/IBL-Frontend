import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * =============================================================================
 * MIDDLEWARE: frontend/middleware.ts
 * =============================================================================
 * 
 * DESKRIPSI:
 * Middleware ini berjalan di Edge/Server Next.js sebelum halaman dirender.
 * 
 * FUNGSI SAAT INI:
 * 1. Mengalihkan (redirect) rute /dashboard langsung ke /teams.
 * 
 * TODO [BACKEND]: AKTIVASI PROTEKSI RUTE (AUTH GUARD)
 * Ketika sistem otentikasi backend sudah terhubung dengan cookie/session:
 * 
 * 1. Ambil auth token dari cookie request:
 *    const token = request.cookies.get("auth_token")?.value;
 * 
 * 2. Proteksi rute dashboard (/teams, /scoring, dll):
 *    const isDashboardRoute = request.nextUrl.pathname.startsWith("/teams") || 
 *                             request.nextUrl.pathname.startsWith("/scoring");
 *    if (isDashboardRoute && !token) {
 *      return NextResponse.redirect(new URL("/login", request.url));
 *    }
 * 
 * 3. Cegah user yang sudah login mengakses kembali halaman /login:
 *    if (request.nextUrl.pathname === "/login" && token) {
 *      return NextResponse.redirect(new URL("/teams", request.url));
 *    }
 * =============================================================================
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect akses /dashboard langsung ke /teams
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/teams", request.url));
  }

  // 2. Proteksi rute dashboard (/teams, /scoring, /schedule-result)
  const authToken = request.cookies.get("auth_token")?.value;
  const isProtectedPath =
    pathname.startsWith("/teams") ||
    pathname.startsWith("/scoring") ||
    pathname.startsWith("/schedule-result");

  if (isProtectedPath && !authToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Jika sudah login dan membuka /login, alihkan ke /teams
  if (pathname === "/login" && authToken) {
    return NextResponse.redirect(new URL("/teams", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/teams/:path*",
    "/scoring/:path*",
    "/schedule-result/:path*",
    "/login",
  ],
};
