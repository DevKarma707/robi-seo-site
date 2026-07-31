// Calendrier éditorial réseaux sociaux.
//
// La typologie reprend celle des visuels déjà produits pour août 2026
// (Marketing/Instagram_Aout2026 dans le dépôt de l'app) : bold, feature,
// stats, testimonial, carrousel, mockup. Garder les mêmes noms permet de
// rattacher les visuels existants sans les renommer.
//
// Les posts arrivent par import JSON, comme les prospects et les articles :
// le skill `robi-social` les fabrique, l'admin les range et les édite.
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot,
  serverTimestamp, getDocs, writeBatch, deleteField, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type PostChannel = "instagram" | "linkedin" | "tiktok";
export type PostStatus = "draft" | "ready" | "published";
export type PostType = "bold" | "feature" | "stats" | "testimonial" | "carrousel" | "mockup";

export interface SocialPost {
  id?: string;
  /** Date de publication prévue, en AAAA-MM-JJ. Sert de clé de calendrier. */
  date: string;
  channel: PostChannel;
  type: PostType;
  /** Le texte du post, prêt à coller. */
  caption: string;
  hashtags?: string;
  /** Ce qu'il faut voir sur le visuel — sert de consigne à Higgsfield. */
  visual?: string;
  /** URL du visuel une fois produit. */
  imageUrl?: string;
  status: PostStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const CHANNEL_META: Record<PostChannel, { label: string; color: string }> = {
  instagram: { label: "Instagram", color: "#E1306C" },
  linkedin: { label: "LinkedIn", color: "#0A66C2" },
  tiktok: { label: "TikTok", color: "#22d3ee" },
};

export const TYPE_META: Record<PostType, { label: string; color: string }> = {
  bold: { label: "Punchline", color: "#BEF221" },
  feature: { label: "Fonctionnalité", color: "#60a5fa" },
  stats: { label: "Chiffres", color: "#fbbf24" },
  testimonial: { label: "Témoignage", color: "#f472b6" },
  carrousel: { label: "Carrousel", color: "#a78bfa" },
  mockup: { label: "Mockup", color: "#34d399" },
};

export const STATUS_META: Record<PostStatus, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "#94a3b8" },
  ready: { label: "Prêt", color: "#BEF221" },
  published: { label: "Publié", color: "#10B981" },
};

export const CHANNELS = Object.keys(CHANNEL_META) as PostChannel[];
export const TYPES = Object.keys(TYPE_META) as PostType[];

const col = () => collection(db, "socialPosts");

export const subscribeToPosts = (
  cb: (rows: SocialPost[]) => void,
  onError?: (e: unknown) => void
) =>
  onSnapshot(
    query(col(), orderBy("date", "asc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SocialPost))),
    (e) => (onError ? onError(e) : console.error("[subscribeToPosts]", e))
  );

export const addPost = (p: Omit<SocialPost, "id">) =>
  addDoc(col(), { ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updatePost = (id: string, patch: Partial<SocialPost>) =>
  updateDoc(doc(db, "socialPosts", id), { ...patch, updatedAt: serverTimestamp() });

export const deletePost = (id: string) => deleteDoc(doc(db, "socialPosts", id));

/**
 * Vider un champ optionnel passe par deleteField() : le SDK n'est pas
 * initialisé avec ignoreUndefinedProperties, `undefined` ferait lever.
 */
export const updatePostText = (
  id: string,
  patch: { caption: string; hashtags: string; visual: string }
) =>
  updateDoc(doc(db, "socialPosts", id), {
    caption: patch.caption,
    hashtags: patch.hashtags.trim() ? patch.hashtags.trim() : deleteField(),
    visual: patch.visual.trim() ? patch.visual.trim() : deleteField(),
    updatedAt: serverTimestamp(),
  });

// ─── Import JSON ──────────────────────────────────────────────────────
/**
 * Le format seul ne suffit pas : Date.parse("2026-02-30") est valide en JS et
 * bascule au 2 mars. Sans l'aller-retour ci-dessous, un post daté d'un jour
 * inexistant serait accepté puis affiché sur une autre date que celle écrite.
 */
const isDate = (s: unknown): s is string => {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;

/**
 * Même contrat que les autres imports de l'admin : un tableau d'objets,
 * les invalides sont signalés sans faire échouer le lot.
 *
 * La déduplication se fait sur date + réseau + début de texte : relancer le
 * skill sur un mois déjà importé ne doit pas dupliquer le calendrier.
 */
export const importPostsFromJson = async (
  jsonStr: string
): Promise<{ imported: number; skipped: number; errors: string[] }> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`JSON invalide : ${(e as Error).message}`);
  }
  const items = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  const errors: string[] = [];

  const existing = await getDocs(col());
  const seen = new Set<string>();
  const key = (p: { date: string; channel: string; caption: string }) =>
    `${p.date}|${p.channel}|${p.caption.slice(0, 40).toLowerCase()}`;
  existing.docs.forEach((d) => {
    const p = d.data() as SocialPost;
    if (p.date && p.caption) seen.add(key(p));
  });

  const batch = writeBatch(db);
  let imported = 0;
  let skipped = 0;

  for (const [i, raw] of items.entries()) {
    if (!isDate(raw.date)) {
      errors.push(`#${i + 1} : "date" requise au format AAAA-MM-JJ.`);
      continue;
    }
    const caption = typeof raw.caption === "string" ? raw.caption.trim() : "";
    if (!caption) {
      errors.push(`#${i + 1} : "caption" requis.`);
      continue;
    }
    const channel = oneOf(raw.channel, CHANNELS, "instagram");
    if (seen.has(key({ date: raw.date, channel, caption }))) {
      skipped++;
      continue;
    }
    seen.add(key({ date: raw.date, channel, caption }));

    const post: Record<string, unknown> = {
      date: raw.date,
      channel,
      type: oneOf(raw.type, TYPES, "bold"),
      caption,
      status: oneOf(raw.status, ["draft", "ready", "published"] as const, "draft"),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    // Champs optionnels ajoutés seulement s'ils portent une valeur : écrire
    // `undefined` ferait lever le SDK.
    if (typeof raw.hashtags === "string" && raw.hashtags.trim()) post.hashtags = raw.hashtags.trim();
    if (typeof raw.visual === "string" && raw.visual.trim()) post.visual = raw.visual.trim();
    if (typeof raw.imageUrl === "string" && raw.imageUrl.trim()) post.imageUrl = raw.imageUrl.trim();

    batch.set(doc(col()), post);
    imported++;
  }

  if (imported) await batch.commit();
  return { imported, skipped, errors };
};

// ─── Utilitaires de calendrier ────────────────────────────────────────
/** Jours d'un mois, alignés sur une grille commençant le lundi. */
export const monthGrid = (year: number, month: number): (string | null)[] => {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // getUTCDay() : 0 = dimanche. On décale pour une semaine lundi → dimanche.
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

export const MONTH_NAMES = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
