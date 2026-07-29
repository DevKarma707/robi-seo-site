// Client helpers for the admin's app-side data (project robi-ai-system).
// Every call goes through /api/admin/* so the shared secret stays server-side;
// we only forward the signed-in admin's Firebase ID token.
import { auth } from "./firebase";

export interface AppStats {
  signups: { total: number; j7: number; j30: number; neverSignedIn: number };
  active: { j7: number; j30: number };
  activated: number;
  activationRate: number;
  proAccounts: number;
  /** Seats actually paid for — excludes admin-granted Pro accounts. */
  soldSeats: number;
  conversionRate: number;
  documents: { total: number; invoices: number | null; estimates: number | null };
  avgDocsPerUser: number;
  clients: number;
  products: number;
  byPlan: Record<string, number>;
  topCountries: { code: string; count: number }[];
  computedAt: string;
  cached?: boolean;
}

export interface LaunchConfig {
  enabled: boolean;
  totalSeats: number;
  baseOffset: number;
  manualOverride: number | null;
  deadline: string | null;
  realSold: number;
}

const authedFetch = async (url: string, init?: RequestInit) => {
  const user = auth?.currentUser;
  if (!user) throw new Error("Non connecté.");
  const token = await user.getIdToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json as { error?: string }).error || `Erreur ${res.status}`;
    throw new Error(msg);
  }
  return json;
};

export const fetchAppStats = (refresh = false) =>
  authedFetch(`/api/admin/stats${refresh ? "?refresh=1" : ""}`) as Promise<AppStats>;

export const fetchLaunchConfig = () => authedFetch("/api/admin/launch") as Promise<LaunchConfig>;

export const saveLaunchConfig = (patch: Partial<Omit<LaunchConfig, "realSold">>) =>
  authedFetch("/api/admin/launch", {
    method: "POST",
    body: JSON.stringify(patch),
  }) as Promise<LaunchConfig>;

/** Displayed seat count, mirroring the server formula in adminStats.ts. */
export const computeDisplayedSold = (c: Pick<LaunchConfig, "manualOverride" | "baseOffset" | "realSold" | "totalSeats">) =>
  Math.max(0, Math.min(c.manualOverride ?? c.baseOffset + c.realSold, c.totalSeats));
