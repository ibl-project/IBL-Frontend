import { Team } from "@/lib/store/useTeamStore";

const BACKEND_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const teamApiService = {
  /**
   * Fetch all teams and rosters from the Fastify Backend.
   * If backend is unreachable, gracefully returns null so caller uses local store.
   */
  async getTeams(): Promise<Team[] | null> {
    try {
      const res = await fetch(`${BACKEND_API_BASE_URL}/teams`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data as Team[];
      }
      return null;
    } catch {
      // Backend not running or offline, fallback to local store
      return null;
    }
  },

  /**
   * Fetch detail of a single team from backend
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    try {
      const res = await fetch(`${BACKEND_API_BASE_URL}/teams/${teamId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) return null;
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as Team;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Update team and player roster on backend
   */
  async updateTeam(teamId: string, updatedData: Partial<Team>): Promise<boolean> {
    try {
      const res = await fetch(`${BACKEND_API_BASE_URL}/teams/${teamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
