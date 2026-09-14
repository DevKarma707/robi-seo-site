/**
 * Médiathèque partagée entre Ralph et Claude (onglet Fichiers).
 *
 * Les fichiers vivent dans Firebase Storage sous `partage/<dossier>/…`, en
 * lecture réservée à l'admin (voir storage.rules — c'est la différence
 * essentielle avec `blog/`, qui est public). Les dossiers sont de simples
 * préfixes : Storage n'a pas de répertoires, `listAll` renvoie les préfixes
 * de premier niveau et on descend dedans.
 *
 * Claude Code tourne sur le Mac, pas dans le navigateur : il ne peut donc pas
 * lire le bucket. Le runner local fait le pont dans les deux sens : il descend
 * la médiathèque dans ~/Desktop/ROBI_PARTAGE, et il expose ce même dossier en
 * lecture pour que l'admin y pioche ce que Claude a produit (voir taskRunner).
 */
import {
  ref as storageRef, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata,
} from "firebase/storage";
import { storage } from "./firebase";

const ROOT = "partage";

/** Fichiers déposés sans dossier, avant la médiathèque. */
export const ROOT_FOLDER = "divers";

/**
 * Dossiers proposés d'office. Ce sont aussi ceux où les skills de Claude
 * déposent leurs productions (app-store-screens/, reseaux/…) : garder les
 * deux listes alignées, sinon l'import depuis le Mac les recrée à côté.
 */
export const PRESET_FOLDERS = ["app-store-screens", "reseaux", "marque", "blog", "documents"];

export interface SharedFile {
  name: string;
  /** Chemin complet dans le bucket, ex. partage/reseaux/post.png */
  path: string;
  /** Dossier de premier niveau (ROOT_FOLDER pour la racine). */
  folder: string;
  /** Sous-chemin sous le dossier, sans le nom : "v3/png" pour reseaux/v3/png/post.png. */
  sub: string;
  url: string;
  size: number;
  updated: string;
  contentType: string;
}

/** Nom de fichier sûr : pas de séparateur, pas de nom caché. */
const safeName = (raw: string) =>
  raw.replace(/[/\\]/g, "-").replace(/^\.+/, "").trim() || `fichier-${Date.now()}`;

/** Chemin relatif sûr : chaque segment nettoyé, les vides et les `..` éliminés. */
const safePath = (raw: string) =>
  raw.split(/[/\\]/).map((seg) => seg.replace(/^\.+/, "").trim()).filter(Boolean).join("/");

/** Nom de dossier sûr : un seul segment, minuscules, tirets. */
export const safeFolder = (raw: string) =>
  raw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export const isImage = (f: Pick<SharedFile, "contentType" | "name">) =>
  f.contentType.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(f.name);

const describe = async (item: ReturnType<typeof storageRef>, folder: string, sub: string): Promise<SharedFile> => {
  const [url, meta] = await Promise.all([getDownloadURL(item), getMetadata(item)]);
  return {
    name: item.name,
    path: item.fullPath,
    folder,
    sub,
    url,
    size: meta.size ?? 0,
    updated: meta.updated ?? "",
    contentType: meta.contentType ?? "application/octet-stream",
  };
};

const MAX_DEPTH = 5;

/** Descend un préfixe : ses fichiers, puis ses sous-préfixes, jusqu'à MAX_DEPTH. */
const walk = async (dir: ReturnType<typeof storageRef>, folder: string, sub: string, depth: number): Promise<SharedFile[]> => {
  const { items, prefixes } = await listAll(dir);
  const here = await Promise.all(items.map((i) => describe(i, folder, sub)));
  if (depth >= MAX_DEPTH) return here;
  const below = await Promise.all(
    prefixes.map((p) => walk(p, folder, sub ? `${sub}/${p.name}` : p.name, depth + 1))
  );
  return [...here, ...below.flat()];
};

/** Toute la médiathèque, arborescence comprise, du plus récent au plus ancien. */
export const listSharedFiles = async (): Promise<SharedFile[]> => {
  if (!storage) throw new Error("Firebase Storage non configuré.");
  const root = await listAll(storageRef(storage, ROOT));
  const flat = await Promise.all(root.items.map((i) => describe(i, ROOT_FOLDER, "")));
  const nested = await Promise.all(root.prefixes.map((p) => walk(p, p.name, "", 1)));
  return [...flat, ...nested.flat()].sort((a, b) => b.updated.localeCompare(a.updated));
};

/**
 * `name` peut être un chemin relatif au dossier ("v3/png/01.png") : l'import
 * depuis le Mac conserve ainsi l'arborescence, et deux versions d'un même
 * visuel ne s'écrasent pas.
 */
export const uploadSharedFile = async (file: File | Blob, name: string, folder = ROOT_FOLDER): Promise<void> => {
  if (!storage) throw new Error("Firebase Storage non configuré.");
  const dir = safeFolder(folder);
  const rel = safePath(name) || safeName(name);
  const path = dir && dir !== ROOT_FOLDER ? `${ROOT}/${dir}/${rel}` : `${ROOT}/${safeName(rel)}`;
  await uploadBytes(storageRef(storage, path), file, { contentType: file.type || "application/octet-stream" });
};

export const deleteSharedFile = (path: string) => {
  if (!storage) throw new Error("Firebase Storage non configuré.");
  return deleteObject(storageRef(storage, path));
};

export const humanSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};
