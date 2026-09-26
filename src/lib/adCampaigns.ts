// Campagnes publicitaires (Meta, TikTok…) et configuration des marchés.
//
// Le calendrier organique et les ads vivent dans le même onglet parce
// qu'ils partagent la même question : « pour quel marché, avec quel visuel,
// et qu'est-ce que ça a donné ? ». Les chiffres (dépense, clics,
// inscriptions) sont saisis à la main depuis les gestionnaires de pubs :
// pas d'API branchée pour l'instant, et c'est assumé — une ligne par
// campagne, mise à jour une fois par semaine, suffit à décider où remettre
// du budget.
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot,
  serverTimestamp, setDoc, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { MARKETS, type MarketId } from "./markets";

export type AdPlatform = "meta" | "tiktok" | "google" | "linkedin";
export type AdObjective = "inscriptions" | "installs" | "lifetime" | "trafic" | "notoriete";
export type AdStatus = "idee" | "prete" | "active" | "pause" | "terminee";

export interface AdCampaign {
  id?: string;
  nom: string;
  market: MarketId;
  platform: AdPlatform;
  objectif: AdObjective;
  statut: AdStatus;
  /** Budget quotidien, dans la devise du compte publicitaire (€). */
  budgetJour: number;
  /** AAAA-MM-JJ. */
  dateDebut: string;
  dateFin?: string;
  /** L'accroche testée — une campagne = un angle, sinon on ne sait pas ce qui a marché. */
  hook?: string;
  /** URL du visuel ou de la vidéo (médiathèque, Higgsfield…). */
  creative?: string;
  /** Page d'atterrissage, avec ses UTM. */
  landing?: string;
  /** Ciblage en une ligne : pays, âge, intérêts. */
  audience?: string;
  notes?: string;
  // ── Résultats, saisis à la main depuis le gestionnaire de pubs ──
  depense?: number;
  impressions?: number;
  clics?: number;
  inscriptions?: number;
  ventes?: number;
  resultatsAu?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const PLATFORM_META: Record<AdPlatform, { label: string; color: string }> = {
  meta: { label: "Meta (IG + FB)", color: "#0866FF" },
  tiktok: { label: "TikTok Ads", color: "#22d3ee" },
  google: { label: "Google Ads", color: "#34A853" },
  linkedin: { label: "LinkedIn Ads", color: "#0A66C2" },
};

export const OBJECTIF_META: Record<AdObjective, { label: string }> = {
  inscriptions: { label: "Inscriptions (compte gratuit)" },
  installs: { label: "Installations app" },
  lifetime: { label: "Ventes Lifetime 59 €" },
  trafic: { label: "Trafic site" },
  notoriete: { label: "Notoriété / vues" },
};

export const AD_STATUS_META: Record<AdStatus, { label: string; color: string }> = {
  idee: { label: "Idée", color: "#94a3b8" },
  prete: { label: "Prête", color: "#BEF221" },
  active: { label: "Active", color: "#10B981" },
  pause: { label: "En pause", color: "#fbbf24" },
  terminee: { label: "Terminée", color: "#64748b" },
};

export const AD_PLATFORMS = Object.keys(PLATFORM_META) as AdPlatform[];
export const AD_OBJECTIFS = Object.keys(OBJECTIF_META) as AdObjective[];
export const AD_STATUTS = Object.keys(AD_STATUS_META) as AdStatus[];

const col = () => collection(db, "adCampaigns");

export const subscribeToCampaigns = (
  cb: (rows: AdCampaign[]) => void,
  onError?: (e: unknown) => void
) =>
  onSnapshot(
    query(col(), orderBy("dateDebut", "asc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdCampaign))),
    (e) => (onError ? onError(e) : console.error("[subscribeToCampaigns]", e))
  );

/**
 * Firestore refuse `undefined` (le SDK n'est pas initialisé avec
 * ignoreUndefinedProperties) : on ne lui donne que ce qui a une valeur.
 */
const sansUndefined = <T extends object>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

export const addCampaign = (c: Omit<AdCampaign, "id">) =>
  addDoc(col(), { ...sansUndefined(c), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateCampaign = (id: string, patch: Partial<AdCampaign>) =>
  updateDoc(doc(db, "adCampaigns", id), { ...sansUndefined(patch), updatedAt: serverTimestamp() });

export const deleteCampaign = (id: string) => deleteDoc(doc(db, "adCampaigns", id));

// ─── Indicateurs ──────────────────────────────────────────────────────

/** Coût par résultat, ou null si rien n'a été dépensé ou rien obtenu. */
export const coutPar = (depense?: number, n?: number): number | null =>
  depense && n ? depense / n : null;

export const ctr = (impressions?: number, clics?: number): number | null =>
  impressions && clics !== undefined ? clics / impressions : null;

/** Jours de diffusion prévus (bornés à aujourd'hui pour une campagne active). */
export const joursPrevus = (c: Pick<AdCampaign, "dateDebut" | "dateFin">): number => {
  if (!c.dateFin) return 0;
  const a = new Date(`${c.dateDebut}T00:00:00Z`).getTime();
  const b = new Date(`${c.dateFin}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000) + 1);
};

export const budgetPrevu = (c: Pick<AdCampaign, "dateDebut" | "dateFin" | "budgetJour">): number =>
  joursPrevus(c) * (c.budgetJour || 0);

export interface ResumeMarche {
  market: MarketId;
  campagnes: number;
  actives: number;
  budgetPrevu: number;
  depense: number;
  inscriptions: number;
  ventes: number;
  cpa: number | null;
}

export const resumerParMarche = (rows: AdCampaign[]): ResumeMarche[] =>
  MARKETS.map((m) => {
    const cs = rows.filter((c) => c.market === m.id);
    const depense = cs.reduce((s, c) => s + (c.depense || 0), 0);
    const inscriptions = cs.reduce((s, c) => s + (c.inscriptions || 0), 0);
    return {
      market: m.id,
      campagnes: cs.length,
      actives: cs.filter((c) => c.statut === "active").length,
      budgetPrevu: cs.filter((c) => c.statut !== "terminee").reduce((s, c) => s + budgetPrevu(c), 0),
      depense,
      inscriptions,
      ventes: cs.reduce((s, c) => s + (c.ventes || 0), 0),
      cpa: coutPar(depense, inscriptions),
    };
  });

// ─── Configuration des marchés ────────────────────────────────────────
//
// Ce qui change d'un marché à l'autre et qu'on ne veut pas coder en dur :
// les comptes, l'état d'avancement, la date visée. Un document par marché,
// dans `socialMarkets/{id}`.

export type MarketStatut = "actif" | "prochain" | "plus-tard";

export interface MarketConfig {
  id: MarketId;
  statut: MarketStatut;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  /** Mois visé pour le lancement, AAAA-MM. */
  lancement?: string;
  /** Pays ciblés par les ads, codes ISO séparés par des virgules. */
  pays?: string;
  notes?: string;
  updatedAt?: Timestamp;
}

export const MARKET_STATUT_META: Record<MarketStatut, { label: string; color: string }> = {
  actif: { label: "Actif", color: "#10B981" },
  prochain: { label: "Prochain", color: "#BEF221" },
  "plus-tard": { label: "Plus tard", color: "#94a3b8" },
};

export const subscribeToMarkets = (
  cb: (rows: MarketConfig[]) => void,
  onError?: (e: unknown) => void
) =>
  onSnapshot(
    collection(db, "socialMarkets"),
    (snap) => cb(snap.docs.map((d) => ({ ...(d.data() as MarketConfig), id: d.id as MarketId }))),
    (e) => (onError ? onError(e) : console.error("[subscribeToMarkets]", e))
  );

export const saveMarket = (id: MarketId, patch: Partial<Omit<MarketConfig, "id">>) =>
  setDoc(doc(db, "socialMarkets", id), { ...sansUndefined(patch), updatedAt: serverTimestamp() }, { merge: true });
