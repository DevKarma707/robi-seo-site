/**
 * Calcul des commissions partenaires, sans Firebase (testé par
 * scripts/checkCommissions.ts). Une seule règle, lue sur chaque fiche :
 *
 * - « partenaire » (FR/EN, depuis le 29/09/2026) : commissionPct du PREMIER
 *   paiement du client, rien sur les renouvellements (commissionMonths absent) ;
 * - « ambassadeur » (Maroc, décidé le 23/10/2026) : commissionPct de tout ce que
 *   paie le client pendant commissionMonths mois après son premier paiement,
 *   renouvellements compris, + une prime fixe au N-ième client payant.
 *
 * Tout est compté dans la devise réellement encaissée par Polar (EUR
 * aujourd'hui, MAD quand les prix en dirhams seront créés) : jamais de
 * conversion silencieuse. Un montant est une table devise → centimes.
 */

export type Programme = "partenaire" | "ambassadeur";

export interface Bonus {
  /** Nombre de clients payants qui déclenche la prime (une seule fois). */
  seuil: number;
  /** Montant de la prime, en unité principale (300 = 300 DH). */
  montant: number;
  devise: string;
}

export interface Terms {
  programme: Programme;
  commissionPct: number;
  /** null = premier paiement seulement. */
  commissionMonths: number | null;
  bonus: Bonus | null;
}

/** Conditions des ambassadeurs Robi Maroc (décision de Ralph, 23/10/2026). */
export const AMBASSADEUR_TERMS: Terms = {
  programme: "ambassadeur",
  commissionPct: 30,
  commissionMonths: 12,
  bonus: { seuil: 10, montant: 300, devise: "MAD" },
};

/** Seuil de versement par devise (30 €, ou l'équivalent arrondi en dirhams). */
export const MIN_PAYOUT: Record<string, number> = { EUR: 30, MAD: 300 };

/**
 * Taux indicatif, affiché dans l'admin seulement (« ≈ ») pour situer la prime
 * en dirhams face à un reste à verser en euros. Le versement réel se fait au
 * taux du jour de la banque ; ne jamais s'en servir pour un calcul dû.
 */
export const MAD_PER_EUR_INDICATIF = 10.8;

export interface SaleLine {
  /** Devise ISO en majuscules. */
  cur: string;
  /** Montant net (remise déduite, hors taxes), en centimes. */
  net: number;
  /** Mois depuis le premier paiement du client (0 = premier paiement). */
  m: number;
  first: boolean;
  refunded: boolean;
  /** Clé client opaque (hachage), pour compter les clients payants. */
  cust: string;
  at?: string | null;
}

export type Money = Record<string, number>;

/** Champs de la fiche influenceur qui portent les conditions. */
export interface TermsFields {
  programme?: Programme;
  commissionPct?: number;
  commissionMonths?: number | null;
  bonus?: Bonus | null;
}

/** Conditions d'une fiche ; une fiche d'avant le 23/10/2026 reste « partenaire », premier paiement seulement. */
export const termsOf = (f: TermsFields): Terms => ({
  programme: f.programme === "ambassadeur" ? "ambassadeur" : "partenaire",
  commissionPct: Number(f.commissionPct || 0),
  commissionMonths: f.commissionMonths != null && Number(f.commissionMonths) > 0 ? Math.round(Number(f.commissionMonths)) : null,
  bonus: f.bonus && Number(f.bonus.seuil) > 0 && Number(f.bonus.montant) > 0
    ? { seuil: Math.round(Number(f.bonus.seuil)), montant: Number(f.bonus.montant), devise: String(f.bonus.devise || "MAD").toUpperCase() }
    : null,
});

/** Ce paiement donne-t-il droit à commission selon ces conditions ? */
export const isCommissionable = (line: Pick<SaleLine, "first" | "m" | "refunded">, t: Terms): boolean =>
  !line.refunded && (line.first || (t.commissionMonths != null && line.m < t.commissionMonths));

export const commissionOf = (netCents: number, t: Terms) => Math.round((netCents * t.commissionPct) / 100);

const add = (acc: Money, cur: string, cents: number) => {
  if (!cents) return acc;
  acc[cur] = (acc[cur] || 0) + cents;
  return acc;
};

export interface CommissionResult {
  /** CA net commissionnable, par devise. */
  net: Money;
  /** Commission sur les paiements, par devise. */
  earned: Money;
  /** Clients distincts avec au moins un paiement non remboursé. */
  payingCustomers: number;
  /** Premiers paiements / renouvellements commissionnés (non remboursés). */
  firstPayments: number;
  renewals: number;
  bonusEarned: boolean;
  /** Prime, par devise (vide tant qu'elle n'est pas acquise). */
  bonus: Money;
  /** Commission + prime, par devise. */
  total: Money;
}

export function computeCommission(lines: SaleLine[], t: Terms): CommissionResult {
  const net: Money = {};
  const earned: Money = {};
  const customers = new Set<string>();
  let firstPayments = 0;
  let renewals = 0;
  for (const l of lines) {
    if (!l.refunded) customers.add(l.cust);
    if (!isCommissionable(l, t)) continue;
    add(net, l.cur, l.net);
    add(earned, l.cur, commissionOf(l.net, t));
    if (l.first) firstPayments++; else renewals++;
  }
  const bonusEarned = !!t.bonus && customers.size >= t.bonus.seuil;
  const bonus: Money = bonusEarned && t.bonus ? { [t.bonus.devise]: Math.round(t.bonus.montant * 100) } : {};
  const total: Money = { ...earned };
  for (const [cur, c] of Object.entries(bonus)) add(total, cur, c);
  return { net, earned, payingCustomers: customers.size, firstPayments, renewals, bonusEarned, bonus, total };
}

/** a − b par devise, jamais négatif. */
export const minus = (a: Money, b: Money): Money => {
  const out: Money = {};
  for (const cur of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const v = (a[cur] || 0) - (b[cur] || 0);
    if (v > 0) out[cur] = v;
  }
  return out;
};

export const sumMoney = (items: { amount?: number; currency?: string }[]): Money =>
  items.reduce((acc, p) => add(acc, String(p.currency || "EUR").toUpperCase(), Number(p.amount || 0)), {} as Money);

export const isEmpty = (m: Money) => Object.values(m).every((v) => !v);

/** Seuil de versement atteint dans au moins une devise. */
export const reachesPayout = (m: Money) =>
  Object.entries(m).some(([cur, c]) => c >= (MIN_PAYOUT[cur] ?? MIN_PAYOUT.EUR) * 100);

const LOCALE_OF: Record<string, string> = { fr: "fr-FR", en: "en-GB", es: "es-ES" };

/** « 12,50 € » ; le dirham s'écrit « 300 DH », comme on le dit au Maroc. */
export const formatAmount = (cents: number, cur: string, lang = "fr") => {
  const code = (cur || "EUR").toUpperCase();
  const loc = LOCALE_OF[lang] || "fr-FR";
  if (code === "MAD") {
    return `${(cents / 100).toLocaleString(loc, { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })} DH`;
  }
  return (cents / 100).toLocaleString(loc, { style: "currency", currency: code, minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 });
};

/** « 12,50 € + 300 DH », ou « 0 € » si vide (euro par défaut, devise passée sinon). */
export const formatMoney = (m: Money, lang = "fr", emptyCur = "EUR") => {
  const parts = Object.entries(m).filter(([, c]) => c).sort(([a], [b]) => (a === "EUR" ? -1 : b === "EUR" ? 1 : a.localeCompare(b)));
  if (!parts.length) return formatAmount(0, emptyCur, lang);
  return parts.map(([cur, c]) => formatAmount(c, cur, lang)).join(" + ");
};

/**
 * Lignes de paiement d'une ligne de stats. La fonction d'attribution les
 * fournit depuis le 23/10/2026 ; avant, on n'a que des totaux de premiers
 * paiements, qu'on rejoue comme une ligne unique (même résultat qu'avant).
 */
export const linesOfRow = (row: { lines?: SaleLine[]; netAmount: number; currency?: string; sales: number; discountId: string }): SaleLine[] =>
  row.lines ?? (row.netAmount
    ? [{ cur: String(row.currency || "EUR").toUpperCase(), net: row.netAmount, m: 0, first: true, refunded: false, cust: `${row.discountId}:agg` }]
    : []);
