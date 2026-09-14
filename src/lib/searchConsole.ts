// Exports Google Search Console importés dans l'admin.
//
// Search Console ne garde que 16 mois et ne compare pas deux exports entre
// eux : on stocke donc une « photo » par export (collection `seoReports`,
// admin uniquement) pour suivre l'effet des leviers d'un mois sur l'autre.
//
// L'export arrive en ZIP de CSV, en français ou en anglais selon la langue du
// compte, avec des noms de fichiers dont l'encodage varie (« Requêtes.csv »
// ressort parfois mangé). On reconnaît donc chaque tableau à son en-tête,
// jamais à son nom de fichier.
import {
  collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc,
  type Timestamp,
} from "firebase/firestore";
import { unzipSync, strFromU8 } from "fflate";
import { db } from "./firebase";

// ─── Modèle ───────────────────────────────────────────────────────────
export interface GscRow {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;       // en %
  position: number;
}

export interface GscDay {
  date: string;      // yyyy-mm-dd
  clicks: number;
  impressions: number;
  position: number;
}

export interface GscReport {
  id?: string;
  periodStart: string;
  periodEnd: string;
  rangeLabel?: string;   // « Les 3 derniers mois », repris des filtres de l'export
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  daily: GscDay[];
  queries: GscRow[];
  pages: GscRow[];
  countries: GscRow[];
  devices: GscRow[];
  importedAt?: Timestamp;
}

// Plafonds de stockage : largement de quoi suivre la longue traîne, sans
// approcher la limite de 1 Mo d'un document Firestore.
const MAX_QUERIES = 500;
const MAX_PAGES = 300;
const MAX_COUNTRIES = 40;

/**
 * Requêtes suivies d'un export à l'autre : la veine « facture AI » et les
 * leviers issus de l'analyse de septembre 2026 (content/seo/). À enrichir
 * quand un nouveau levier est lancé.
 */
export const WATCHED_QUERIES: { query: string; note: string }[] = [
  { query: "facture ai", note: "Pilier FR" },
  { query: "facture ia", note: "Variante FR — levier 2" },
  { query: "factureai", note: "Pilier FR" },
  { query: "générateur de facture ia", note: "Pilier FR" },
  { query: "invoice ai", note: "Page EN — levier 1" },
  { query: "ai invoice", note: "Page EN — levier 1" },
  { query: "ai invoice generator", note: "Page EN — levier 1" },
  { query: "factura ia", note: "Page ES" },
  { query: "logiciel de gestion des factures avec ia", note: "Article — levier 3" },
  { query: "logiciel facturation sophrologue", note: "Page métier — levier 4" },
];

/**
 * « robi » est aussi Robi Axiata, opérateur télécom au Bangladesh : « robi
 * login », « bdapps robi »… Ces impressions ne sont pas des prospects. On
 * garde en revanche tout ce qui désigne clairement Robi AI.
 */
export const isForeignBrandNoise = (q: string) => {
  const s = q.toLowerCase();
  if (!/r[oô]b+[iî]/.test(s)) return false;
  return !/robi[\s.-]*(ai|ia|app)\b|robi-app/.test(s);
};

// ─── Parsing ──────────────────────────────────────────────────────────
/** CSV RFC 4180 : champs entre guillemets, guillemets doublés, retours à la ligne dans un champ. */
export function parseCsv(raw: string): string[][] {
  const text = raw.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else {
      field += c;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim()));
}

const num = (s: string | undefined) => {
  const n = parseFloat((s || "").replace("%", "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

type Kind = "daily" | "queries" | "pages" | "countries" | "devices" | "filters" | "unknown";

const kindOf = (header: string): Kind => {
  const h = norm(header);
  if (h === "date") return "daily";
  if (h.startsWith("requete") || h.includes("quer")) return "queries";
  if (h.startsWith("page")) return "pages";
  if (h.startsWith("pays") || h.startsWith("countr")) return "countries";
  if (h.startsWith("appareil") || h.startsWith("device")) return "devices";
  if (h.startsWith("filtre") || h.startsWith("filter")) return "filters";
  return "unknown";
};

const toRows = (table: string[][]): GscRow[] =>
  table.slice(1).map((r) => ({
    key: (r[0] || "").trim(),
    clicks: num(r[1]),
    impressions: num(r[2]),
    ctr: num(r[3]),
    position: num(r[4]),
  })).filter((r) => r.key);

const byImpressions = (a: GscRow, b: GscRow) => b.impressions - a.impressions || b.clicks - a.clicks;

async function readCsvTexts(files: File[]): Promise<string[]> {
  const texts: string[] = [];
  for (const f of files) {
    const lower = f.name.toLowerCase();
    if (lower.endsWith(".zip")) {
      const entries = unzipSync(new Uint8Array(await f.arrayBuffer()));
      for (const [name, data] of Object.entries(entries)) {
        if (name.toLowerCase().endsWith(".csv")) texts.push(strFromU8(data));
      }
    } else if (lower.endsWith(".csv")) {
      texts.push(await f.text());
    }
  }
  return texts;
}

/** Transforme le ZIP (ou les CSV) exporté depuis Search Console → Performances. */
export async function parseGscFiles(files: File[]): Promise<Omit<GscReport, "id" | "importedAt">> {
  const texts = await readCsvTexts(files);
  if (!texts.length) throw new Error("Aucun CSV trouvé. Dépose le ZIP téléchargé depuis Search Console → Performances → Exporter.");

  let daily: GscDay[] = [];
  let queries: GscRow[] = [];
  let pages: GscRow[] = [];
  let countries: GscRow[] = [];
  let devices: GscRow[] = [];
  let rangeLabel: string | undefined;

  for (const text of texts) {
    const table = parseCsv(text);
    if (!table.length) continue;
    switch (kindOf(table[0][0] || "")) {
      case "daily":
        daily = table.slice(1)
          .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test((r[0] || "").trim()))
          .map((r) => ({ date: r[0].trim(), clicks: num(r[1]), impressions: num(r[2]), position: num(r[4]) }))
          .sort((a, b) => a.date.localeCompare(b.date));
        break;
      case "queries": queries = toRows(table).sort(byImpressions).slice(0, MAX_QUERIES); break;
      case "pages": pages = toRows(table).sort(byImpressions).slice(0, MAX_PAGES); break;
      case "countries": countries = toRows(table).sort(byImpressions).slice(0, MAX_COUNTRIES); break;
      case "devices": devices = toRows(table).sort(byImpressions); break;
      case "filters": {
        const dateRow = table.slice(1).find((r) => norm(r[0] || "") === "date");
        if (dateRow?.[1]) rangeLabel = dateRow[1].trim();
        break;
      }
    }
  }

  if (!daily.length) {
    throw new Error("Export incomplet : le graphique jour par jour (Graphique.csv / Chart.csv) est absent. Exporte depuis l'onglet Performances, sans filtre de requête ou de page.");
  }

  const clicks = daily.reduce((s, d) => s + d.clicks, 0);
  const impressions = daily.reduce((s, d) => s + d.impressions, 0);
  // Position moyenne pondérée par les impressions, comme Search Console.
  const position = impressions
    ? daily.reduce((s, d) => s + d.position * d.impressions, 0) / impressions
    : 0;

  return {
    periodStart: daily[0].date,
    periodEnd: daily[daily.length - 1].date,
    ...(rangeLabel ? { rangeLabel } : {}),
    totals: {
      clicks,
      impressions,
      ctr: impressions ? (clicks / impressions) * 100 : 0,
      position: Math.round(position * 100) / 100,
    },
    daily,
    queries,
    pages,
    countries,
    devices,
  };
}

// ─── Firestore ────────────────────────────────────────────────────────
const col = () => collection(db, "seoReports");

export const subscribeToSeoReports = (
  cb: (rows: GscReport[]) => void,
  onError?: (e: unknown) => void
) =>
  onSnapshot(
    query(col(), orderBy("periodEnd", "desc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GscReport))),
    (e) => (onError ? onError(e) : console.error("[subscribeToSeoReports]", e))
  );

/**
 * Identifiant = période couverte : réimporter le même export écrase la photo
 * au lieu de créer un doublon qui fausserait la comparaison.
 */
export const saveSeoReport = async (r: Omit<GscReport, "id" | "importedAt">): Promise<string> => {
  const id = `${r.periodEnd}_${r.periodStart}`;
  await setDoc(doc(db, "seoReports", id), { ...r, importedAt: serverTimestamp() });
  return id;
};

export const deleteSeoReport = (id: string) => deleteDoc(doc(db, "seoReports", id));

export const findRow = (rows: GscRow[] | undefined, key: string) => {
  if (!rows) return undefined;
  const k = key.toLowerCase().trim();
  return rows.find((r) => r.key.toLowerCase().trim() === k);
};
