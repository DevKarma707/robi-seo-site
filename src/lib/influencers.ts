// Influencer programme.
//
// No affiliate SaaS involved: each influencer gets a Polar discount code, and
// the Polar webhook records `discountId` + `code` on every paid order (see
// functions/src/attribution.ts in the app repo). The join key between an
// influencer and their sales is therefore the discount code.
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type InfluencerPlatform =
  | "instagram" | "tiktok" | "youtube" | "linkedin" | "x" | "blog" | "podcast" | "autre";

export type InfluencerStatus =
  | "prospect"     // repéré, pas encore contacté
  | "negociation"  // discussion en cours
  | "actif"        // code émis, campagne en cours
  | "inactif"      // partenariat terminé
  | "refuse";      // a dit non

export interface Influencer {
  id?: string;
  name: string;             // seul champ obligatoire
  handle?: string;          // @pseudo
  platform: InfluencerPlatform;
  audience?: number;        // abonnés
  email?: string;
  url?: string;
  status: InfluencerStatus;
  /** Code promo Polar, tel que le client le saisit au checkout. */
  promoCode?: string;
  /** Id du discount Polar — l'attribution s'y rattache en priorité. */
  polarDiscountId?: string;
  /** Remise accordée au client, en %. */
  discountPct?: number;
  /** Commission due à l'influenceur, en % du montant net encaissé. */
  commissionPct?: number;
  notes?: string;
  /** Clics sur le lien court robi-app.com/r/CODE (compté par la route /r). */
  clicks?: number;
  /** Fiche prospect d'origine, quand l'influenceur vient de l'onglet Acquisition. */
  prospectId?: string;
  contactedAt?: string;     // yyyy-mm-dd
  signedAt?: string;        // yyyy-mm-dd
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const PLATFORM_META: Record<InfluencerPlatform, { label: string; color: string }> = {
  instagram: { label: "Instagram", color: "#E1306C" },
  tiktok:    { label: "TikTok",    color: "#25F4EE" },
  youtube:   { label: "YouTube",   color: "#FF0000" },
  linkedin:  { label: "LinkedIn",  color: "#0A66C2" },
  x:         { label: "X",         color: "#e5e7eb" },
  blog:      { label: "Blog",      color: "#BEF221" },
  podcast:   { label: "Podcast",   color: "#a78bfa" },
  autre:     { label: "Autre",     color: "#888888" },
};

export const PLATFORMS = Object.keys(PLATFORM_META) as InfluencerPlatform[];

export const STATUS_META: Record<InfluencerStatus, { label: string; color: string }> = {
  prospect:    { label: "Repéré",      color: "#94a3b8" },
  negociation: { label: "Négociation", color: "#fbbf24" },
  actif:       { label: "Actif",       color: "#BEF221" },
  inactif:     { label: "Inactif",     color: "#64748b" },
  refuse:      { label: "Refusé",      color: "#f87171" },
};

export const INFLUENCER_PIPELINE: InfluencerStatus[] = ["prospect", "negociation", "actif", "inactif"];

const col = () => collection(db, "influencers");

export const subscribeToInfluencers = (
  cb: (rows: Influencer[]) => void,
  onError?: (e: unknown) => void
) =>
  onSnapshot(
    query(col(), orderBy("createdAt", "desc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Influencer))),
    (e) => (onError ? onError(e) : console.error("[subscribeToInfluencers]", e))
  );

export const addInfluencer = (i: Omit<Influencer, "id">) =>
  addDoc(col(), { ...i, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateInfluencer = (id: string, patch: Partial<Influencer>) =>
  updateDoc(doc(db, "influencers", id), { ...patch, updatedAt: serverTimestamp() });

export const deleteInfluencer = (id: string) => deleteDoc(doc(db, "influencers", id));

/** Lien court à donner au partenaire : compte les clics puis applique le code. */
export const partnerLink = (code: string) => `https://robi-app.com/r/${code.toUpperCase()}`;

// ─── Versements de commissions ─────────────────────────────────────────
export interface Payout {
  id?: string;
  influencerId: string;
  /** Montant versé, en centimes. */
  amount: number;
  /** Date du virement, yyyy-mm-dd. */
  paidAt: string;
  /** Période couverte, libre (« septembre 2026 »). */
  period?: string;
  method?: "virement" | "paypal" | "wise" | "autre";
  note?: string;
  createdAt?: Timestamp;
}

const payoutsCol = () => collection(db, "influencerPayouts");

export const subscribeToPayouts = (cb: (rows: Payout[]) => void, onError?: (e: unknown) => void) =>
  onSnapshot(
    query(payoutsCol(), orderBy("paidAt", "desc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payout))),
    (e) => (onError ? onError(e) : console.error("[subscribeToPayouts]", e))
  );

export const addPayout = (p: Omit<Payout, "id">) =>
  addDoc(payoutsCol(), { ...p, createdAt: serverTimestamp() });

export const deletePayout = (id: string) => deleteDoc(doc(db, "influencerPayouts", id));

/** Suggested code from a name: « Marie Dupont » → « MARIE20 ». */
export const suggestPromoCode = (name: string, discountPct = 20) =>
  `${(name || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 10)
    .toUpperCase() || "ROBI"}${discountPct}`;

// ─── Jointure avec les ventes attribuées ──────────────────────────────
export interface AttributionRow {
  discountId: string;
  code: string | null;
  sales: number;
  refunded: number;
  netAmount: number;   // centimes
  currency: string;
  lastSaleAt: string | null;
  /** Comptes créés via le lien partenaire (?ref=), vente ou pas. */
  signups?: number;
}

export interface AttributionStats {
  windowDays: number | null;
  totals: { sales: number; netAmount: number };
  byCode: AttributionRow[];
  truncated: boolean;
  computedAt: string;
}

export interface InfluencerPerf {
  sales: number;
  refunded: number;
  signups: number;
  netAmount: number;      // centimes, remboursements exclus
  /** Commission générée depuis le début, en centimes (avant versements). */
  commissionDue: number;
  /** Déjà versé, en centimes. */
  paid: number;
  /** Reste à verser = généré − versé, jamais négatif. */
  remaining: number;
  lastSaleAt: string | null;
  matched: boolean;
}

/**
 * Rattache un influenceur à ses ventes. On tente d'abord l'id du discount
 * (stable), puis le code (que Ralph peut avoir saisi à la main).
 */
export const perfOf = (inf: Influencer, stats: AttributionStats | null, payouts: Payout[] = []): InfluencerPerf => {
  const paid = payouts
    .filter((p) => p.influencerId === inf.id)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const empty: InfluencerPerf = {
    sales: 0, refunded: 0, signups: 0, netAmount: 0, commissionDue: 0,
    paid, remaining: 0, lastSaleAt: null, matched: false,
  };
  if (!stats) return empty;

  const row =
    (inf.polarDiscountId && stats.byCode.find((r) => r.discountId === inf.polarDiscountId)) ||
    (inf.promoCode && stats.byCode.find((r) => (r.code || "").toUpperCase() === inf.promoCode!.toUpperCase())) ||
    null;

  if (!row) return empty;

  const pct = Number(inf.commissionPct || 0);
  const commissionDue = Math.round((row.netAmount * pct) / 100);
  return {
    sales: row.sales,
    refunded: row.refunded,
    signups: row.signups || 0,
    netAmount: row.netAmount,
    commissionDue,
    paid,
    remaining: Math.max(0, commissionDue - paid),
    lastSaleAt: row.lastSaleAt,
    matched: true,
  };
};

/** Export CSV (Excel FR : point-virgule, virgule décimale) de l'état des commissions. */
export const commissionsCsv = (rows: Influencer[], stats: AttributionStats | null, payouts: Payout[]): string => {
  const cents = (c: number) => (c / 100).toFixed(2).replace(".", ",");
  const head = ["Influenceur", "Pseudo", "Plateforme", "Statut", "Code", "Clics", "Inscriptions", "Ventes", "Remboursées", "CA net (€)", "Commission (%)", "Commission générée (€)", "Versé (€)", "Reste à verser (€)", "Dernière vente"];
  const lines = rows.map((inf) => {
    const p = perfOf(inf, stats, payouts);
    return [
      inf.name, inf.handle || "", PLATFORM_META[inf.platform].label, STATUS_META[inf.status].label,
      inf.promoCode || "", String(inf.clicks || 0), String(p.signups), String(p.sales), String(p.refunded),
      cents(p.netAmount), String(inf.commissionPct ?? ""), cents(p.commissionDue), cents(p.paid), cents(p.remaining),
      p.lastSaleAt ? p.lastSaleAt.slice(0, 10) : "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";");
  });
  return "\ufeff" + [head.join(";"), ...lines].join("\n");
};

export const euros = (cents: number) =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
