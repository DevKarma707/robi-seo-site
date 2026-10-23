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
import {
  computeCommission, linesOfRow, minus, sumMoney, termsOf, formatMoney,
  type Bonus, type Money, type Programme, type SaleLine,
} from "./commissions";

export type { Programme, Bonus, Money } from "./commissions";

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
  /**
   * Programme : « partenaire » (défaut, toutes les fiches d'avant le
   * 23/10/2026) ou « ambassadeur » (Robi Maroc). Absent = partenaire.
   */
  programme?: Programme;
  /** Mois commissionnés après le premier paiement du client. Absent / null = premier paiement seulement. */
  commissionMonths?: number | null;
  /** Prime unique au N-ième client payant (ambassadeurs : 300 DH au 10e). */
  bonus?: Bonus | null;
  notes?: string;
  /** Clics sur le lien court robi-app.com/r/CODE (compté par la route /r). */
  clicks?: number;
  /** Pays ISO-2 et langue des mails (fr / en / es), renseignés à l'inscription sur /partenaires. */
  country?: string;
  language?: string;
  /** Comment le partenaire veut être payé, et où. */
  payoutMethod?: "paypal" | "virement" | "wise";
  payoutDetails?: string;
  /** « site » quand la fiche vient du formulaire public. */
  source?: string;
  welcomeSentAt?: Timestamp;
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
  /** Montant versé, en centimes de `currency`. */
  amount: number;
  /** Devise du versement ; absent = EUR (versements d'avant le 23/10/2026). */
  currency?: string;
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
  netAmount: number;   // centimes, premiers paiements seulement
  currency: string;
  lastSaleAt: string | null;
  /** Comptes créés via le lien partenaire (?ref=), vente ou pas. */
  signups?: number;
  /** Renouvellements attribués (depuis le 23/10/2026). */
  renewals?: number;
  payingCustomers?: number;
  /** Un paiement par ligne, pour appliquer les conditions de la fiche. */
  lines?: SaleLine[];
}

export interface AttributionStats {
  windowDays: number | null;
  totals: { sales: number; netAmount: number };
  byCode: AttributionRow[];
  truncated: boolean;
  computedAt: string;
}

export interface InfluencerPerf {
  /** Premiers paiements (clients amenés), remboursés exclus. */
  sales: number;
  /** Renouvellements commissionnés. */
  renewals: number;
  refunded: number;
  signups: number;
  /** Clients distincts avec au moins un paiement non remboursé. */
  payingCustomers: number;
  /** CA net commissionnable, par devise (centimes). */
  net: Money;
  /** Commission + prime générées depuis le début, par devise (avant versements). */
  commissionDue: Money;
  /** Prime acquise (vide sinon). */
  bonus: Money;
  bonusEarned: boolean;
  /** Déjà versé, par devise. */
  paid: Money;
  /** Reste à verser = généré − versé, par devise, jamais négatif. */
  remaining: Money;
  lastSaleAt: string | null;
  matched: boolean;
}

/** La ligne de stats d'une fiche : id du discount (stable), puis code. */
export const rowOf = (inf: Influencer, stats: AttributionStats | null): AttributionRow | null =>
  (stats && inf.polarDiscountId && stats.byCode.find((r) => r.discountId === inf.polarDiscountId)) ||
  (stats && inf.promoCode && stats.byCode.find((r) => (r.code || "").toUpperCase() === inf.promoCode!.toUpperCase())) ||
  null;

/**
 * Rattache un influenceur à ses ventes et applique SES conditions
 * (programme, %, mois, prime) — voir src/lib/commissions.ts.
 */
export const perfOf = (inf: Influencer, stats: AttributionStats | null, payouts: Payout[] = []): InfluencerPerf => {
  const paid = sumMoney(payouts.filter((p) => p.influencerId === inf.id));
  const row = rowOf(inf, stats);
  const r = computeCommission(row ? linesOfRow(row) : [], termsOf(inf));
  return {
    sales: r.firstPayments,
    renewals: r.renewals,
    refunded: row?.refunded || 0,
    signups: row?.signups || 0,
    payingCustomers: row?.lines ? r.payingCustomers : row?.sales || 0,
    net: r.net,
    commissionDue: r.total,
    bonus: r.bonus,
    bonusEarned: r.bonusEarned,
    paid,
    remaining: minus(r.total, paid),
    lastSaleAt: row?.lastSaleAt || null,
    matched: !!row,
  };
};

/** Export CSV (Excel FR : point-virgule, virgule décimale) de l'état des commissions. */
export const commissionsCsv = (rows: Influencer[], stats: AttributionStats | null, payouts: Payout[]): string => {
  const money = (m: Money) => formatMoney(m).replace(/\s/g, " ");
  const head = ["Influenceur", "Pseudo", "Plateforme", "Statut", "Programme", "Code", "Clics", "Inscriptions", "Clients payants", "Premiers paiements", "Renouvellements", "Remboursées", "CA net commissionnable", "Commission (%)", "Mois commissionnés", "Prime", "Commission générée (prime incluse)", "Versé", "Reste à verser", "Dernière vente"];
  const lines = rows.map((inf) => {
    const p = perfOf(inf, stats, payouts);
    const t = termsOf(inf);
    return [
      inf.name, inf.handle || "", PLATFORM_META[inf.platform].label, STATUS_META[inf.status].label,
      t.programme, inf.promoCode || "", String(inf.clicks || 0), String(p.signups), String(p.payingCustomers),
      String(p.sales), String(p.renewals), String(p.refunded),
      money(p.net), String(inf.commissionPct ?? ""), t.commissionMonths ? String(t.commissionMonths) : "1er paiement",
      t.bonus ? `${t.bonus.montant} ${t.bonus.devise} au ${t.bonus.seuil}e client${p.bonusEarned ? " (acquise)" : ""}` : "",
      money(p.commissionDue), money(p.paid), money(p.remaining),
      p.lastSaleAt ? p.lastSaleAt.slice(0, 10) : "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";");
  });
  return "\ufeff" + [head.join(";"), ...lines].join("\n");
};

export { formatMoney, formatAmount } from "./commissions";

export const euros = (cents: number) =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
