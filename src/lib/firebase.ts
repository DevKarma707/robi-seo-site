// Firebase data layer for the Robi SEO site admin.
// Ported from the Impulse Rebuild admin (Firestore), trimmed to the two
// concerns we need here: blog articles + homegrown visit analytics.
//
// Config is read from NEXT_PUBLIC_FIREBASE_* env vars (see .env.example).
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Only initialize when config is present. During build (no env vars) this
// stays null so importing the module never throws auth/invalid-api-key.
const hasConfig = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
const app = hasConfig ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
export const db = (app ? getFirestore(app) : null) as ReturnType<typeof getFirestore>;
export const auth = (app ? getAuth(app) : null) as ReturnType<typeof getAuth>;
export const firebaseReady = hasConfig;

// ─── Auth ──────────────────────────────────────────────────
const ALLOWED_EMAILS = ["ralphkaram75014@gmail.com", "robi@robi-app.com"];

export type { User };

export const signInWithGoogle = async (): Promise<{ ok: boolean; error?: string }> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    if (!ALLOWED_EMAILS.includes(result.user.email ?? "")) {
      await firebaseSignOut(auth);
      return { ok: false, error: "Accès non autorisé pour ce compte." };
    }
    return { ok: true };
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
      return { ok: false };
    }
    return { ok: false, error: err.message || "Erreur de connexion Google." };
  }
};

export const isAllowedEmail = (email: string | null | undefined) =>
  ALLOWED_EMAILS.includes(email ?? "");

export const signOut = () => firebaseSignOut(auth);
export { onAuthStateChanged };

// ─── Collections ───────────────────────────────────────────
// Guarded: null at build time (no config) so the module import never throws.
const articlesCol = app ? collection(db, "articles") : (null as unknown as ReturnType<typeof collection>);
const visitsCol = app ? collection(db, "visits") : (null as unknown as ReturnType<typeof collection>);

// ─── Blog articles ─────────────────────────────────────────
// Robi is tri-lingue côté contenu (FR / EN / ES). Le reste des 16 locales
// retombe sur FR/EN/ES via la logique de fallback du blog public.
export interface Article {
  id?: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  titleEs: string;
  excerptFr: string;
  excerptEn: string;
  excerptEs: string;
  contentFr: string; // markdown (## H2, ### H3, **gras**, - liste, [lien](url))
  contentEn: string;
  contentEs: string;
  category: string; // guides | legal | tips | business
  keywords: string[];
  metaDescFr?: string;
  metaDescEn?: string;
  metaDescEs?: string;
  coverImage?: string; // URL (pas d'upload : on colle une URL)
  published: boolean;
  featured?: boolean;
  readTimeFr?: number;
  readTimeEn?: number;
  readTimeEs?: number;
  date: string; // ISO YYYY-MM-DD
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const subscribeToArticles = (
  callback: (articles: Article[]) => void,
  errorCallback?: (err: unknown) => void,
  onlyPublished = false
) => {
  const q = onlyPublished
    ? query(articlesCol, where("published", "==", true), orderBy("date", "desc"))
    : query(articlesCol, orderBy("date", "desc"));

  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article))),
    (err) => {
      if (errorCallback) errorCallback(err);
      else console.error("[subscribeToArticles]", err);
    }
  );
};

export const fetchArticleBySlug = async (slug: string): Promise<Article | null> => {
  const q = query(articlesCol, where("slug", "==", slug), where("published", "==", true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Article;
};

export const addArticle = async (article: Omit<Article, "id">) =>
  addDoc(articlesCol, { ...article, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateArticle = async (id: string, data: Partial<Article>) =>
  updateDoc(doc(db, "articles", id), { ...data, updatedAt: serverTimestamp() });

export const deleteArticle = async (id: string) => deleteDoc(doc(db, "articles", id));

const estimateReadMinutes = (text: string) =>
  Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));

/**
 * Importe un ou plusieurs articles depuis un JSON (préparé par Claude).
 * Champs requis : slug, titleFr, contentFr. Les valeurs EN/ES manquantes
 * retombent sur le FR. Un slug déjà présent est ignoré (sauf overwrite).
 */
export const importArticlesFromJson = async (
  jsonStr: string,
  overwrite = false
): Promise<{ imported: number; skipped: number; updated: number }> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`JSON invalide: ${(e as Error).message}`);
  }
  const items = Array.isArray(parsed) ? parsed : [parsed];

  items.forEach((a: unknown, idx) => {
    const o = a as Record<string, unknown>;
    if (!o || typeof o !== "object") throw new Error(`Article #${idx + 1}: doit être un objet JSON.`);
    if (typeof o.slug !== "string") throw new Error(`Article #${idx + 1}: champ "slug" requis (string).`);
    if (typeof o.titleFr !== "string") throw new Error(`Article #${idx + 1}: champ "titleFr" requis (string).`);
    if (typeof o.contentFr !== "string") throw new Error(`Article #${idx + 1}: champ "contentFr" requis (string).`);
  });

  const existingSnap = await getDocs(articlesCol);
  const idBySlug = new Map<string, string>();
  existingSnap.docs.forEach((d) => {
    const slug = (d.data() as Article).slug;
    if (slug) idBySlug.set(slug, d.id);
  });

  const today = new Date().toISOString().slice(0, 10);
  let imported = 0;
  let skipped = 0;
  let updated = 0;

  for (const raw of items) {
    const a = raw as Record<string, unknown>;
    const slug = a.slug as string;
    const exists = idBySlug.has(slug);
    if (exists && !overwrite) {
      skipped++;
      continue;
    }

    const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
    const contentFr = a.contentFr as string;
    const contentEn = str(a.contentEn, contentFr);
    const contentEs = str(a.contentEs, contentFr);

    const article: Record<string, unknown> = {
      slug,
      titleFr: a.titleFr,
      titleEn: str(a.titleEn, a.titleFr as string),
      titleEs: str(a.titleEs, a.titleFr as string),
      excerptFr: str(a.excerptFr),
      excerptEn: str(a.excerptEn, str(a.excerptFr)),
      excerptEs: str(a.excerptEs, str(a.excerptFr)),
      contentFr,
      contentEn,
      contentEs,
      category: str(a.category, "guides"),
      keywords: Array.isArray(a.keywords) ? a.keywords.filter((k) => typeof k === "string") : [],
      published: typeof a.published === "boolean" ? a.published : true,
      featured: typeof a.featured === "boolean" ? a.featured : false,
      date: str(a.date, today),
      readTimeFr: typeof a.readTimeFr === "number" ? a.readTimeFr : estimateReadMinutes(contentFr),
      readTimeEn: typeof a.readTimeEn === "number" ? a.readTimeEn : estimateReadMinutes(contentEn),
      readTimeEs: typeof a.readTimeEs === "number" ? a.readTimeEs : estimateReadMinutes(contentEs),
    };
    if (typeof a.metaDescFr === "string") article.metaDescFr = a.metaDescFr;
    if (typeof a.metaDescEn === "string") article.metaDescEn = a.metaDescEn;
    if (typeof a.metaDescEs === "string") article.metaDescEs = a.metaDescEs;
    if (typeof a.coverImage === "string") article.coverImage = a.coverImage;

    if (exists && overwrite) {
      await updateDoc(doc(db, "articles", idBySlug.get(slug)!), { ...article, updatedAt: serverTimestamp() });
      updated++;
    } else {
      await addDoc(articlesCol, { ...article, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      idBySlug.set(slug, "new");
      imported++;
    }
  }

  return { imported, skipped, updated };
};

// ─── Visit analytics (compteur maison, comme Impulse) ──────
export interface VisitStats {
  today: number;
  week: number;
  prevWeek: number;
  month: number;
  days: { date: string; count: number }[];
  byPage: { path: string; count: number }[];
  bySource: { source: string; count: number }[];
}

function detectTrafficSource(): string {
  const utm = new URLSearchParams(window.location.search).get("utm_source")?.toLowerCase();
  if (utm) {
    if (utm.includes("instagram")) return "Instagram";
    if (utm.includes("google")) return "Google";
    if (utm.includes("facebook") || utm.includes("fb")) return "Facebook";
    if (utm.includes("linkedin")) return "LinkedIn";
    if (utm.includes("whatsapp")) return "WhatsApp";
    return utm.charAt(0).toUpperCase() + utm.slice(1);
  }
  const ref = document.referrer.toLowerCase();
  if (!ref) return "Direct";
  if (ref.includes("google.")) return "Google";
  if (ref.includes("bing.")) return "Bing";
  if (ref.includes("instagram.")) return "Instagram";
  if (ref.includes("facebook.") || ref.includes("fb.com")) return "Facebook";
  if (ref.includes("linkedin.") || ref.includes("lnkd.in")) return "LinkedIn";
  if (ref.includes("chatgpt.") || ref.includes("openai.")) return "ChatGPT";
  if (ref.includes("whatsapp.")) return "WhatsApp";
  return "Autre";
}

export const logVisit = async (path: string): Promise<void> => {
  if (typeof window === "undefined") return;
  const key = `robi_visited:${path}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  try {
    await addDoc(visitsCol, { path, source: detectTrafficSource(), createdAt: serverTimestamp() });
  } catch (err) {
    console.warn("[logVisit]", err);
  }
};

export const subscribeToVisits = (callback: (stats: VisitStats) => void) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const q = query(
    visitsCol,
    where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo)),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snap) => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    const daysMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      daysMap[d.toISOString().split("T")[0]] = 0;
    }

    let today = 0;
    let week = 0;
    let prevWeek = 0;
    let month = 0;
    const pageMap: Record<string, number> = {};
    const sourceMap: Record<string, number> = {};

    snap.docs.forEach((d) => {
      const data = d.data() as { createdAt?: Timestamp; path?: string; source?: string };
      const ts = data.createdAt?.toDate?.();
      if (!ts) return;
      const dateStr = ts.toISOString().split("T")[0];
      if (daysMap[dateStr] !== undefined) daysMap[dateStr]++;
      if (dateStr === todayStr) today++;
      if (ts >= weekAgo) week++;
      if (ts >= twoWeeksAgo && ts < weekAgo) prevWeek++;
      month++;

      const path = data.path || "/";
      pageMap[path] = (pageMap[path] || 0) + 1;
      const source = data.source || "Direct";
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });

    const days = Object.entries(daysMap).map(([date, count]) => ({ date, count }));
    const byPage = Object.entries(pageMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
    const bySource = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    callback({ today, week, prevWeek, month, days, byPage, bySource });
  });
};
