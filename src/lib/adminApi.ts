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

export interface LaunchTranche {
  /** Places de la tranche ; `null` = ouverte (dernière seulement). */
  seats: number | null;
  /** Produit Polar qui facture cette tranche ; `null` = pas encore créé. */
  productId: string | null;
}

export interface LaunchPrice { amount: number; currency: string }

export interface LaunchConfig {
  enabled: boolean;
  totalSeats: number;
  baseOffset: number;
  manualOverride: number | null;
  deadline: string | null;
  realSold: number;
  /** Les tranches en vigueur (l'offre historique en une tranche si rien n'est configuré). */
  tranches?: LaunchTranche[];
  /** Où on en est : tranche courante, vendable ou non. */
  tranche?: {
    index: number; seats: number | null; sold: number; remaining: number | null;
    productId: string | null; isLast: boolean; purchasable: boolean; soldOut: boolean;
  };
  /** Prix lus chez Polar, par produit ; `null` si Polar est muet. */
  tranchePrices?: Record<string, LaunchPrice | null>;
  trancheHistory?: { index: number; at: string }[];
  /** Offre de bienvenue : fenêtre après l'inscription pendant laquelle l'accès à vie est proposé. */
  welcome?: { enabled: boolean; hours: number; since: string | null };
  /** Relances e-mail J+1 / J+2 / J+7 des inscrits sans achat (functions/src/nurture.ts de l'app). */
  nurture?: { enabled: boolean; since: string | null };
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
  /** Appels IA agrégés (latence, taux d'échec). Absent des rapports anciens. */
  aiPerformance?: {
    calls: number;
    failures: number;
    failureRate: number | null;
    latencyAvgMs: number | null;
    latencyP50ApproxMs: number | null;
    latencyP95WorstMs: number | null;
  };
  emailErrors: { total: number; top: HealthSignature[] };
  functionErrors: { total: number; bySource: Record<string, number>; top: HealthSignature[] };
  cron: { last: { at: string; source: string; meta: Record<string, unknown> } | null; staleHours: number | null };
  daily: { date: string; count: number }[];
  truncated: boolean;
  computedAt: string;
}

export interface CreatedInfluencerCode {
  code: string;
  discountId: string;
  discountPct: number;
  /** true si le code existait déjà (chez nous ou chez Polar) et a été adopté. */
  existed: boolean;
}

/** Crée le code promo Polar d'un influenceur (idempotent). */
export const createInfluencerCode = (body: {
  name: string; code: string; discountPct: number; commissionPct?: number; influencerId?: string;
}) =>
  authedFetch("/api/admin/influencers/code", { method: "POST", body: JSON.stringify(body) }) as Promise<CreatedInfluencerCode>;

/** Envoie (ou renvoie) le mail de bienvenue : lien, code, conditions. */
export const sendInfluencerWelcome = (influencerId: string) =>
  authedFetch("/api/admin/influencers/bienvenue", { method: "POST", body: JSON.stringify({ influencerId }) }) as Promise<{ ok: boolean; sent: boolean }>;

/** Désactive un code (supprimé chez Polar, historique conservé). */
export const disableInfluencerCode = (code: string) =>
  authedFetch(`/api/admin/influencers/code?code=${encodeURIComponent(code)}`, { method: "DELETE" }) as Promise<{ code: string; active: false }>;

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

// ─── Dépenses ────────────────────────────────────────────────────────
// La consommation IA est mesurée ; tout le reste est saisi à la main, aucune
// de ces factures n'étant lisible par une API. Le rapport le dit lui-même,
// pour qu'un total bas ne se lise pas comme une absence de dépenses.

export interface DeclaredCost {
  id?: string;
  label: string;
  amount: number;
  currency: string;
  kind: "monthly" | "oneoff";
  /** Mois de début (récurrent) ou mois de la dépense (ponctuel), au format YYYY-MM. */
  from: string;
  /** Mois de fin inclus. Vide = toujours en cours. */
  to?: string | null;
  note?: string | null;
}

export interface CostMonth {
  month: string;
  ai: { tokens: number; calls: number; cost: number };
  declared: { total: number; items: { label: string; amount: number; kind: string }[] };
  total: number;
  activeUsers: number;
  costPerActiveUser: number | null;
}

export interface CostReport {
  months: CostMonth[];
  declared: DeclaredCost[];
  pricePerMillionTokens: number;
  note: string;
  computedAt: string;
}

export const fetchCostReport = (months = 6) =>
  authedFetch(`/api/admin/costs?months=${months}`) as Promise<CostReport>;

export const saveCost = (cost: Partial<DeclaredCost> & { pricePerMillionTokens?: number }) =>
  authedFetch("/api/admin/costs", {
    method: "POST",
    body: JSON.stringify(cost),
  }) as Promise<DeclaredCost>;

export const deleteCost = (id: string) =>
  authedFetch(`/api/admin/costs?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  }) as Promise<{ deleted: string }>;


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
  /** Parcours d'achat (personnes distinctes) ; null si PostHog a refusé la lecture. */
  paiement?: { vues: number; clics: number; lances: number; echecs: number; payes: number } | null;
  mesure?: {
    cleSiteConfiguree: boolean;
    domaines: { domaine: string; total: number; dernier: string | null }[];
  };
}

export const fetchProduitReport = (days = 7) =>
  authedFetch(`/api/admin/posthog?days=${days}`) as Promise<ProduitReport>;

// ─── Ads (Meta) ──────────────────────────────────────────────────────
// Lu dans l'API Marketing par /api/admin/meta-ads : le jeton Meta reste sur
// le serveur, le navigateur ne reçoit que des agrégats.

export interface MetaAdRow {
  id: string;
  name: string;
  /** effective_status Meta : ACTIVE, PAUSED, CAMPAIGN_PAUSED, ADSET_PAUSED, PENDING_REVIEW, DISAPPROVED, WITH_ISSUES… */
  status: string;
  createdAt: string | null;
  campaign: { id: string; name: string; objective: string | null } | null;
  adset: { id: string; name: string; optimizationGoal: string | null } | null;
  dailyBudget: number | null;
  lifetimeBudget: number | null;
  thumbnail: string | null;
  /** Vidéo Meta diffusée — relie la pub à sa créa de VALIDÉ (`adCreatives.metaVideoIds`). */
  videoId: string | null;
  /** Début / fin effectifs (ISO), ensemble de pubs sinon campagne. */
  startsAt: string | null;
  endsAt: string | null;
  linkClicks: number;
  /** Vues de la page d'arrivée (pixel). */
  landingViews: number;
  /** Clics vers l'app (événement Lead du pixel). */
  leads: number;
  signups: number;
  purchases: number;
  /** Vues de 3 s : l'accroche. */
  videoViews: number;
  /** ThruPlay (15 s ou fin) : la tenue. */
  thruplays: number;
  frequency: number | null;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  results: number;
  /** Ce que « résultat » veut dire pour cette pub (achats, inscriptions, clics…), null si rien ne remonte. */
  resultLabel: string | null;
  costPerResult: number | null;
  roas: number | null;
}

export interface MetaAdsReport {
  configured: boolean;
  accountId?: string;
  account?: { id: string; name: string; currency: string; timezone: string; status: number; lifetimeSpend: number };
  /** Toutes les sommes sur 30 jours glissants, aujourd'hui compris (fuseau du compte). */
  totals?: {
    today: number; d7: number; d30: number;
    impressions: number; clicks: number;
    cpm: number | null; cpc: number | null; ctr: number | null;
    results: number; resultLabel: string | null; costPerResult: number | null;
    purchaseValue: number; roas: number | null;
  };
  daily?: { date: string; spend: number; impressions: number; clicks: number; results: number }[];
  /** Période des chiffres par pub (`ads`) : 7 j, 30 j ou depuis le début. */
  periode?: MetaPeriode;
  ads?: MetaAdRow[];
  /** null = lecture refusée ; [] = aucun pixel sur le compte. */
  pixels?: { id: string; name: string; lastFired: string | null }[] | null;
  computedAt?: string;
}

export type MetaPeriode = "7" | "30" | "max";
export const getMetaAds = (periode: MetaPeriode = "30") =>
  authedFetch(`/api/admin/meta-ads?periode=${periode}`) as Promise<MetaAdsReport>;
