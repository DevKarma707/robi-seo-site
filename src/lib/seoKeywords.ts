// Suivi SEO : les mots-clés qu'on vise, la page censée ranker, où on en est.
//
// Repris de l'onglet SEO d'Impulse, adapté à Robi : les positions ne se
// saisissent plus à la main mais se synchronisent depuis le dernier export
// Search Console déjà stocké par l'onglet Analytics (`seoReports`). Collection
// `seoKeywords`, admin uniquement.
import {
  addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { findRow, isForeignBrandNoise, type GscReport, type GscRow } from "./searchConsole";

export type SeoStatus = "a-travailler" | "contenu-publie" | "page-1" | "top-3";

export const SEO_STATUSES: SeoStatus[] = ["a-travailler", "contenu-publie", "page-1", "top-3"];

export interface SeoKeyword {
  id?: string;
  keyword: string;                    // « facture ia »
  segment?: string;                   // « Veine IA · FR », « Factur-X », « Métiers »…
  market?: string;                    // « France », « Royaume-Uni », « Espagne », « Belgique »…
  targetUrl?: string;                 // « /fr/facture-ai »
  goal?: number;                      // position visée : 3 = top 3, 10 = page 1
  position?: number | null;           // null = pas encore classé
  previousPosition?: number | null;   // alimente la flèche d'évolution
  impressions?: number;               // sur la période du dernier export
  clicks?: number;
  status: SeoStatus;
  notes?: string;
  nextAction?: string;
  lastCheckedAt?: string;             // fin de période de l'export, yyyy-mm-dd
  lastReportId?: string;              // évite de décaler previousPosition deux fois
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const col = () => collection(db, "seoKeywords");

/** Statut déduit d'une position. Ne dégrade jamais un statut manuel quand la position est inconnue. */
export const statusFromPosition = (position: number | null | undefined, fallback: SeoStatus = "a-travailler"): SeoStatus => {
  if (typeof position !== "number" || Number.isNaN(position)) return fallback;
  if (position <= 3) return "top-3";
  if (position <= 10) return "page-1";
  return "contenu-publie";
};

/** Un mot-clé est le même à la casse et aux espaces près. */
export const seoKey = (keyword: string) => keyword.trim().toLowerCase().replace(/\s+/g, " ");

const round1 = (n: number) => Math.round(n * 10) / 10;

export const subscribeToSeoKeywords = (cb: (rows: SeoKeyword[]) => void, onError?: (e: unknown) => void) =>
  onSnapshot(
    col(),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SeoKeyword))),
    (e) => (onError ? onError(e) : console.error("[subscribeToSeoKeywords]", e))
  );

/** Firestore rejette `undefined` : on retire les champs vides avant écriture. */
const clean = (o: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ""));

export const addSeoKeyword = (row: Omit<SeoKeyword, "id">) =>
  addDoc(col(), { ...clean(row as Record<string, unknown>), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateSeoKeyword = (id: string, data: Partial<SeoKeyword>) =>
  updateDoc(doc(db, "seoKeywords", id), { ...data, updatedAt: serverTimestamp() });

export const deleteSeoKeyword = (id: string) => deleteDoc(doc(db, "seoKeywords", id));

/**
 * Import JSON. Un mot-clé déjà suivi n'est pas dupliqué : sa position est mise
 * à jour et l'ancienne glisse dans `previousPosition`. Deux formes acceptées,
 * mélangeables : export Search Console ({ query, position, impressions, clicks })
 * ou saisie ({ keyword, segment, targetUrl, goal, status, notes, nextAction }).
 */
export async function importSeoKeywordsFromJson(jsonStr: string): Promise<{ imported: number; updated: number; skipped: number }> {
  let parsed: unknown;
  try { parsed = JSON.parse(jsonStr); } catch (e) {
    throw new Error(`JSON invalide : ${(e as Error).message}`);
  }
  const items = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];

  // Validation complète avant toute écriture : un import est tout ou rien.
  const rows = items.map((r, i) => {
    if (!r || typeof r !== "object") throw new Error(`Ligne #${i + 1} : doit être un objet JSON.`);
    const keyword = typeof r.keyword === "string" ? r.keyword : r.query;
    if (typeof keyword !== "string" || !keyword.trim()) throw new Error(`Ligne #${i + 1} : champ "keyword" (ou "query") requis.`);
    for (const f of ["position", "goal", "impressions", "clicks"]) {
      if (r[f] != null && typeof r[f] !== "number") throw new Error(`Ligne #${i + 1} : "${f}" doit être un nombre.`);
    }
    return { r, keyword: keyword.trim() };
  });

  const existing = new Map<string, { id: string; data: SeoKeyword }>();
  (await getDocs(col())).docs.forEach((d) => {
    const data = d.data() as SeoKeyword;
    if (data.keyword) existing.set(seoKey(data.keyword), { id: d.id, data });
  });

  const today = new Date().toISOString().slice(0, 10);
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const numOr = (v: unknown) => (typeof v === "number" ? v : undefined);
  let imported = 0, updated = 0, skipped = 0;

  for (const { r, keyword } of rows) {
    const position = typeof r.position === "number" ? round1(r.position) : null;
    const hit = existing.get(seoKey(keyword));

    if (hit) {
      const patch: Record<string, unknown> = {};
      // Les champs éditoriaux ne sont complétés que s'ils manquaient.
      if (str(r.targetUrl) && !hit.data.targetUrl) patch.targetUrl = str(r.targetUrl);
      if (str(r.segment) && !hit.data.segment) patch.segment = str(r.segment);
      if (str(r.market) && !hit.data.market) patch.market = str(r.market);
      if (str(r.notes) && !hit.data.notes) patch.notes = str(r.notes);
      if (str(r.nextAction) && !hit.data.nextAction) patch.nextAction = str(r.nextAction);
      if (typeof r.goal === "number" && hit.data.goal == null) patch.goal = r.goal;

      // Même export déjà enregistré → on ne décale pas la position.
      const sameReport = !!str(r.lastReportId) && r.lastReportId === hit.data.lastReportId;
      if (position !== null && !sameReport) {
        Object.assign(patch, {
          position,
          previousPosition: hit.data.position ?? null,
          lastCheckedAt: str(r.lastCheckedAt) ?? today,
          status: statusFromPosition(position, hit.data.status),
        });
        if (str(r.lastReportId)) patch.lastReportId = str(r.lastReportId);
        if (typeof r.impressions === "number") patch.impressions = r.impressions;
        if (typeof r.clicks === "number") patch.clicks = r.clicks;
      }
      if (!Object.keys(patch).length) { skipped++; continue; }
      await updateSeoKeyword(hit.id, patch as Partial<SeoKeyword>);
      updated++;
      continue;
    }

    const fallback = SEO_STATUSES.includes(r.status as SeoStatus) ? (r.status as SeoStatus) : "a-travailler";
    const payload: Omit<SeoKeyword, "id"> = {
      keyword,
      position,
      previousPosition: null,
      status: statusFromPosition(position, fallback),
      segment: str(r.segment),
      market: str(r.market),
      targetUrl: str(r.targetUrl),
      goal: numOr(r.goal),
      impressions: numOr(r.impressions),
      clicks: numOr(r.clicks),
      notes: str(r.notes),
      nextAction: str(r.nextAction),
      lastCheckedAt: position !== null ? str(r.lastCheckedAt) ?? today : undefined,
      lastReportId: str(r.lastReportId),
    };
    await addSeoKeyword(payload);
    existing.set(seoKey(keyword), { id: "pending", data: payload as SeoKeyword });
    imported++;
  }
  return { imported, updated, skipped };
}

/**
 * Met à jour les positions des mots-clés suivis depuis un export Search
 * Console. Un mot-clé absent de l'export garde sa dernière position connue
 * (Search Console ne liste que les requêtes ayant eu des impressions).
 */
export async function syncKeywordsFromReport(report: GscReport, keywords: SeoKeyword[]): Promise<{ updated: number; absent: number; already: number }> {
  let updated = 0, absent = 0, already = 0;
  for (const k of keywords) {
    if (!k.id) continue;
    if (k.lastReportId === report.id) { already++; continue; }
    const row = findRow(report.queries, k.keyword);
    if (!row) {
      await updateSeoKeyword(k.id, { impressions: 0, clicks: 0, lastReportId: report.id });
      absent++;
      continue;
    }
    const position = round1(row.position);
    await updateSeoKeyword(k.id, {
      position,
      previousPosition: k.position ?? null,
      impressions: row.impressions,
      clicks: row.clicks,
      lastCheckedAt: report.periodEnd,
      lastReportId: report.id,
      status: statusFromPosition(position, k.status),
    });
    updated++;
  }
  return { updated, absent, already };
}

/** Requêtes de l'export qui génèrent des impressions mais qu'on ne suit pas encore. */
export const untrackedQueries = (report: GscReport | undefined, keywords: SeoKeyword[], minImpressions = 10): GscRow[] => {
  if (!report) return [];
  const tracked = new Set(keywords.map((k) => seoKey(k.keyword)));
  return report.queries.filter(
    (q) => q.impressions >= minImpressions && !isForeignBrandNoise(q.key) && !tracked.has(seoKey(q.key))
  );
};
