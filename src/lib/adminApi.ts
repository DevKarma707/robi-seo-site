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
  /** Lifetime (59 €) seats sold — excludes subscriptions and admin-granted Pro. */
  soldSeats: number;
  /** Every account on a paid Polar plan (lifetime, 2 years, annual, monthly). */
  paidSeats?: number;
  /** Estimate from the plan each paying account holds; exact cash needs Polar orders:read. */
  revenue?: { oneShot: number; mrr: number; total: number };
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

export interface HealthSignature {
  signature: string;
  count: number;
  lastSeen: string;
  sample: string;
}

export interface HealthReport {
  windowDays: number;
  severity: "ok" | "warn" | "down";
  problems: string[];
  emails: { sent: number | null; failed: number | null; failureRate: number | null };
  clientErrors: { total: number; affectedUsers: number; top: HealthSignature[] };
  aiFailures: { total: number; top: HealthSignature[] };
  emailErrors: { total: number; top: HealthSignature[] };
  functionErrors: { total: number; bySource: Record<string, number>; top: HealthSignature[] };
  cron: { last: { at: string; source: string; meta: Record<string, unknown> } | null; staleHours: number | null };
  daily: { date: string; count: number }[];
  truncated: boolean;
  computedAt: string;
}

export const fetchAttributionStats = (days?: number) =>
  authedFetch(`/api/admin/attribution${days ? `?days=${days}` : ""}`) as Promise<
    import("./influencers").AttributionStats
  >;

export interface OutreachStatus {
  configured: boolean;
  from: string | null;
  host: string | null;
}

/** Lit la boîte de réponse et marque « intéressé » les prospects qui ont répondu. */
export const checkReplies = () =>
  authedFetch("/api/admin/replies") as Promise<{ ok: true; days: number; senders: number; replied: string[] }>;

export const fetchOutreachStatus = () =>
  authedFetch("/api/admin/outreach") as Promise<OutreachStatus>;

export const sendOutreachEmail = (payload: {
  to: string;
  subject: string;
  text: string;
  unsubToken: string;
}) =>
  authedFetch("/api/admin/outreach", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<{ ok: true; messageId: string }>;

export const fetchHealthReport = (days = 7) =>
  authedFetch(`/api/admin/health?days=${days}`) as Promise<HealthReport>;

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

export interface ProduitReport {
  configured: boolean;
  days?: number;
  /** false si PostHog a refusé le filtre qui exclut l'équipe : les chiffres sont alors bruts. */
  exclusionInterne?: boolean;
  /** `precedent` : mêmes personnes sur la période d'avant · `anciens` : inscrits avant la période. */
  funnel?: { event: string; total: number; personnes: number; precedent?: number; anciens?: number }[];
  erreurs?: { type: string; message: string; total: number; personnes: number; dernier: string | null; replay?: string | null }[];
  /** Page d'arrivée (URL complète) et site d'origine des inscrits et payants de la période. */
  origines?: { page: string | null; origine: string | null; inscrits: number; payants: number }[] | null;
  cta?: { page: string; total: number }[];
  mesure?: {
    cleSiteConfiguree: boolean;
    domaines: { domaine: string; total: number; dernier: string | null }[];
  };
}

export const fetchProduitReport = (days = 7) =>
  authedFetch(`/api/admin/posthog?days=${days}`) as Promise<ProduitReport>;
