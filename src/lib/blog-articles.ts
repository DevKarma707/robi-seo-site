// Server-side reader for blog articles published from /admin (Firestore).
// Uses the Firestore REST API (no SDK in the server bundle) so it plays well
// with Next.js ISR. Security rules allow unauthenticated read of published
// articles, and our queries always filter `published == true`.
import type { Locale } from "@/lib/i18n/config";

const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const BASE = PROJECT
  ? `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`
  : "";
const REVALIDATE = 60; // seconds — publish in admin shows up within ~1 min

export interface DbArticle {
  slug: string;
  titleFr: string; titleEn: string; titleEs: string;
  excerptFr: string; excerptEn: string; excerptEs: string;
  contentFr: string; contentEn: string; contentEs: string;
  category: string;
  keywords: string[];
  date: string;
  readTimeFr: number; readTimeEn: number; readTimeEs: number;
  coverImage?: string;
  metaDescFr?: string; metaDescEn?: string; metaDescEs?: string;
}

// ─── Firestore REST value decoding ─────────────────────────
type FsValue = Record<string, unknown>;
function decode(v: FsValue | undefined): unknown {
  if (!v) return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) {
    const arr = (v.arrayValue as { values?: FsValue[] }).values || [];
    return arr.map(decode);
  }
  if ("nullValue" in v) return null;
  return undefined;
}

function toArticle(fields: Record<string, FsValue>): DbArticle {
  const s = (k: string) => (decode(fields[k]) as string) ?? "";
  const n = (k: string) => (decode(fields[k]) as number) ?? 0;
  const contentFr = s("contentFr");
  return {
    slug: s("slug"),
    titleFr: s("titleFr"), titleEn: s("titleEn") || s("titleFr"), titleEs: s("titleEs") || s("titleFr"),
    excerptFr: s("excerptFr"), excerptEn: s("excerptEn") || s("excerptFr"), excerptEs: s("excerptEs") || s("excerptFr"),
    contentFr, contentEn: s("contentEn") || contentFr, contentEs: s("contentEs") || contentFr,
    category: s("category") || "guides",
    keywords: (decode(fields.keywords) as string[]) ?? [],
    date: s("date"),
    readTimeFr: n("readTimeFr") || 5, readTimeEn: n("readTimeEn") || 5, readTimeEs: n("readTimeEs") || 5,
    coverImage: s("coverImage") || undefined,
    metaDescFr: s("metaDescFr") || undefined,
    metaDescEn: s("metaDescEn") || undefined,
    metaDescEs: s("metaDescEs") || undefined,
  };
}

type RunQueryRow = { document?: { fields: Record<string, FsValue> } };

async function runQuery(filters: object): Promise<DbArticle[]> {
  if (!BASE || !KEY) return [];
  try {
    const res = await fetch(`${BASE}:runQuery?key=${KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "articles" }], where: filters } }),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as RunQueryRow[];
    return rows
      .filter((r) => r.document)
      .map((r) => toArticle(r.document!.fields))
      .filter((a) => a.slug);
  } catch {
    return [];
  }
}

const publishedFilter = {
  fieldFilter: { field: { fieldPath: "published" }, op: "EQUAL", value: { booleanValue: true } },
};

/** All published articles, newest first. Empty array if Firebase unconfigured. */
export async function getPublishedArticles(): Promise<DbArticle[]> {
  const articles = await runQuery(publishedFilter);
  return articles.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** A single published article by slug, or null. */
export async function getPublishedArticleBySlug(slug: string): Promise<DbArticle | null> {
  const articles = await runQuery({
    compositeFilter: {
      op: "AND",
      filters: [
        publishedFilter,
        { fieldFilter: { field: { fieldPath: "slug" }, op: "EQUAL", value: { stringValue: slug } } },
      ],
    },
  });
  return articles[0] ?? null;
}

// ─── Locale helpers (FR/EN/ES content, with fallback for the 16 locales) ──
function langSuffix(locale: string): "Fr" | "En" | "Es" {
  if (locale.startsWith("es")) return "Es";
  if (locale.startsWith("en")) return "En";
  if (locale.startsWith("pt")) return "En"; // EN is a better PT fallback than FR
  return "Fr";
}

export function articleTitle(a: DbArticle, locale: Locale): string {
  return a[`title${langSuffix(locale)}`] || a.titleFr;
}
export function articleExcerpt(a: DbArticle, locale: Locale): string {
  return a[`excerpt${langSuffix(locale)}`] || a.excerptFr;
}
export function articleContent(a: DbArticle, locale: Locale): string {
  return a[`content${langSuffix(locale)}`] || a.contentFr;
}
export function articleReadTime(a: DbArticle, locale: Locale): number {
  return a[`readTime${langSuffix(locale)}`] || a.readTimeFr;
}
export function articleMetaDesc(a: DbArticle, locale: Locale): string {
  const suffix = langSuffix(locale);
  return (a[`metaDesc${suffix}`] as string | undefined) || articleExcerpt(a, locale);
}
