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

/** Un fichier repéré, avant d'aller chercher son URL et ses métadonnées. */
type Located = { item: ReturnType<typeof storageRef>; folder: string; sub: string };

/**
 * Descend un préfixe et REPÈRE les fichiers, sans rien demander sur chacun.
 *
 * La séparation compte : lister est bon marché (une requête par dossier),
 * décrire coûte deux requêtes PAR FICHIER. Les mélanger faisait partir des
 * centaines d'appels avant que le premier dossier ne soit connu.
 */
const locate = async (
  dir: ReturnType<typeof storageRef>,
  folder: string,
  sub: string,
  depth: number
): Promise<Located[]> => {
  const { items, prefixes } = await listAll(dir);
  const here: Located[] = items.map((item) => ({ item, folder, sub }));
  if (depth >= MAX_DEPTH) return here;
  const below = await Promise.all(
    prefixes.map((p) => locate(p, folder || p.name, sub ? `${sub}/${p.name}` : p.name, depth + 1))
  );
  return [...here, ...below.flat()];
};

/** Traite `jobs` par groupes de `size`, en signalant l'avancement. */
const pool = async <T>(
  jobs: (() => Promise<T>)[],
  size: number,
  onBatch?: (done: T[]) => void
): Promise<T[]> => {
  const done: T[] = [];
  let next = 0;
  // Dernière taille signalée. Sans ce repère, un fichier illisible relance le
  // test du modulo sur un total inchangé et réémet le même lot : la grille se
  // re-rendait plusieurs fois avec exactement les mêmes données.
  let signale = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const mine = next++;
      try {
        done.push(await jobs[mine]());
      } catch {
        // Un fichier illisible (droits, objet supprimé entre-temps) ne doit pas
        // emporter toute la médiathèque : on l'omet et on continue.
      }
      // Rafraîchir à chaque fichier ferait re-rendre la grille des centaines
      // de fois ; tous les 12, l'écran se remplit sans ramer.
      if (onBatch && done.length > signale && done.length % 12 === 0) {
        signale = done.length;
        onBatch([...done]);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, jobs.length) }, worker));
  return done;
};

/**
 * Les dossiers de premier niveau, en UNE requête.
 *
 * Permet d'afficher la barre de dossiers sans avoir lu un seul fichier :
 * l'onglet s'ouvre immédiatement, et ne charge que le dossier qu'on ouvre.
 */
export const listSharedFolders = async (): Promise<string[]> => {
  if (!storage) throw new Error("Firebase Storage non configuré.");
  const root = await listAll(storageRef(storage, ROOT));
  const noms = root.prefixes.map((p) => p.name).sort();
  // La racine n'apparaît que si elle porte réellement des fichiers.
  if (root.items.length) noms.push(ROOT_FOLDER);
  return noms;
};

const trierRecent = (l: SharedFile[]) => [...l].sort((a, b) => b.updated.localeCompare(a.updated));

/**
 * Toute la médiathèque, du plus récent au plus ancien.
 *
 * `onProgress` reçoit des lots partiels au fil de l'eau. Sans lui, l'onglet
 * restait sur « Chargement… » jusqu'au tout dernier fichier : deux requêtes
 * par fichier lancées d'un bloc, soit plusieurs centaines d'appels simultanés
 * sur une médiathèque nourrie depuis des semaines. Le navigateur les met en
 * file, et l'écran reste vide pendant ce temps alors que les premiers
 * résultats sont déjà là.
 *
 * La concurrence est bornée à 6 : au-delà, le navigateur sérialise de toute
 * façon, et la rafale ne fait qu'ajouter de l'attente.
 */
export const listSharedFiles = async (
  onProgress?: (partiel: SharedFile[]) => void,
  dossier?: string
): Promise<SharedFile[]> => {
  if (!storage) throw new Error("Firebase Storage non configuré.");

  const root = await listAll(storageRef(storage, ROOT));

  // Un dossier demandé : on ne descend que celui-là. La médiathèque contient
  // aussi des dossiers de travail volumineux et sans intérêt visuel (skills,
  // exports) — les parcourir pour afficher trois visuels coûte une attente
  // que rien ne justifie.
  const cibles: Located[] =
    dossier && dossier !== ROOT_FOLDER
      ? await locate(storageRef(storage, `${ROOT}/${safeFolder(dossier)}`), dossier, "", 1)
      : dossier === ROOT_FOLDER
        ? root.items.map((item) => ({ item, folder: ROOT_FOLDER, sub: "" }))
        : [
            ...root.items.map((item) => ({ item, folder: ROOT_FOLDER, sub: "" })),
            ...(await Promise.all(root.prefixes.map((p) => locate(p, p.name, "", 1)))).flat(),
          ];

  const fichiers = await pool(
    cibles.map(({ item, folder, sub }) => () => describe(item, folder, sub)),
    6,
    onProgress ? (partiel) => onProgress(trierRecent(partiel)) : undefined
  );

  return trierRecent(fichiers);
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

/** Ce qu'on accepte de sortir d'une archive. */
const TYPES_ARCHIVE: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  json: "application/json", txt: "text/plain", md: "text/markdown", pdf: "application/pdf",
};

/** 40 Mo par fichier extrait : au-delà, ce n'est plus un visuel de post. */
const TAILLE_MAX_EXTRAIT = 40 * 1024 * 1024;

export interface ResultatZip {
  deposes: string[];
  ignores: { nom: string; motif: string }[];
}

/**
 * Étale une archive dans la médiathèque.
 *
 * Un lot de visuels arrive en zip — c'est le format dans lequel on le reçoit,
 * et l'alternative était de glisser les fichiers un par un. Sur dix posts
 * c'est dix gestes, et c'est l'étape où l'on abandonne.
 *
 * L'archive est ouverte dans le navigateur : rien n'est envoyé ailleurs, et
 * le tri de ce qu'on accepte se fait avant tout dépôt.
 */
export const uploadZip = async (
  fichier: File,
  folder = ROOT_FOLDER,
  onProgres?: (fait: number, total: number) => void
): Promise<ResultatZip> => {
  if (!storage) throw new Error("Firebase Storage non configuré.");
  const { unzipSync } = await import("fflate");

  let entrees: Record<string, Uint8Array>;
  try {
    entrees = unzipSync(new Uint8Array(await fichier.arrayBuffer()));
  } catch (e) {
    throw new Error(`Archive illisible : ${(e as Error).message}`);
  }

  const deposes: string[] = [];
  const ignores: { nom: string; motif: string }[] = [];

  const noms = Object.keys(entrees).filter((n) => !n.endsWith("/"));
  let fait = 0;

  for (const nom of noms) {
    const octets = entrees[nom];
    // Le nom interne d'une archive peut contenir des « ../ » : on ne garde que
    // le dernier segment. Un chemin fabriqué ne doit pas pouvoir désigner un
    // autre dossier du bucket.
    const base = nom.split("/").pop() ?? "";
    const ext = base.toLowerCase().split(".").pop() ?? "";

    // Les métadonnées de macOS sont dans toutes les archives faites sur Mac.
    if (base.startsWith(".") || nom.startsWith("__MACOSX/")) {
      ignores.push({ nom: base, motif: "fichier système" });
    } else if (!TYPES_ARCHIVE[ext]) {
      ignores.push({ nom: base, motif: `extension .${ext} non acceptée` });
    } else if (octets.byteLength > TAILLE_MAX_EXTRAIT) {
      ignores.push({ nom: base, motif: "plus de 40 Mo" });
    } else {
      await uploadSharedFile(new Blob([octets as BlobPart], { type: TYPES_ARCHIVE[ext] }), base, folder);
      deposes.push(base);
    }
    onProgres?.(++fait, noms.length);
  }

  return { deposes, ignores };
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
