import { create } from "zustand";

export type UserRole = "admin" | "scorekeeper" | "viewer";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  lastLoginAt: string | null;
  createdAt: string;
}

/**
 * checking        → belum tahu, sedang bertanya ke backend
 * authenticated   → backend mengonfirmasi sesi login masih sah
 * unauthenticated → tidak ada sesi / sesi sudah dicabut
 */
export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
}

/**
 * Status login panitia.
 *
 * Sengaja TIDAK memakai middleware `persist` (localStorage) seperti store lain:
 * status login hanya boleh berasal dari backend. Isinya diatur oleh
 * lib/apiClient.ts setiap kali login, logout, atau sesi dipulihkan.
 */
export const useAuthStore = create<AuthState>()(() => ({
  status: "checking",
  user: null,
}));

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  scorekeeper: "Scorekeeper",
  viewer: "Viewer",
};

/**
 * Admin & scorekeeper boleh mengubah data turnamen; viewer hanya melihat.
 * Ini hanya untuk menyembunyikan tombol. Aturan yang sebenarnya dicek backend.
 */
export function canEditData(role: UserRole | undefined): boolean {
  return role === "admin" || role === "scorekeeper";
}
