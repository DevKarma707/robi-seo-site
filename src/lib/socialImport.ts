import { CHANNELS, TYPES, STATUTS_MANUELS, type PostChannel, type PostStatus, type PostType } from "./socialPosts";
import { PERSONAS, PILIERS, ANGLES } from "./editorialGrid";

/**
 * Décider ce qu'un import doit faire, sans toucher à Firestore.
 *
 * Séparé exprès : ce dépôt n'a pas de suite de tests, et c'est la partie où
 * une erreur coûte le plus cher — un post écrasé, un doublon publié, une
 * ligne perdue en silence. Ici tout se vérifie en exécutant la fonction,
 * ce que fait `scripts/checkSocialImport.ts`.
 */

/** `externalId` : lettres, chiffres, tiret et souligné, 1 à 120 caractères. */
export const EXTERNAL_ID_RE = /^[A-Za-z0-9_-]{1,120}$/;

export interface ImportPost {
  /** Identité stable fournie par le générateur. Obligatoire. */
  externalId: string;
  /** Id Firestore, seul moyen de viser un post antérieur à `externalId`. */
  id?: string;
  /** Statut réclamé par le JSON et volontairement non appliqué — sert à le dire. */
  statusIgnored?: PostStatus;
  date: string;
  channel: PostChannel;
  type: PostType;
  caption: string;
  hashtags?: string;
  visual?: string;
  imageUrl?: string;
  /** La case de la grille éditoriale (`editorialGrid.ts`). */
  persona?: string;
  pilier?: string;
  angle?: string;
  status: PostStatus;
}

/**
 * Ce qu'on sait déjà d'un post en base.
 *
 * Porte TOUS les champs comparables, pas seulement ceux de l'empreinte :
 * sans eux, impossible de distinguer un réimport qui apporte quelque chose
 * d'un réimport identique, et chaque passe réécrirait le post pour rien.
 */
export interface ExistingPost {
  id: string;
  externalId?: string;
  date: string;
  channel: PostChannel;
  type?: PostType;
  caption: string;
  hashtags?: string;
  visual?: string;
  imageUrl?: string;
  /** Portés ici aussi, sinon un réimport identique réécrirait la case. */
  persona?: string;
  pilier?: string;
  angle?: string;
  status: PostStatus;
}

export type ImportAction =
  | { action: "create"; post: ImportPost }
  | { action: "enrich"; id: string; patch: Partial<ImportPost> }
  | { action: "skip"; reason: string };

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/**
 * Rapprocher deux posts sur les 40 premiers caractères de leur légende a été
 * écarté : deux accroches partageant leur ouverture — ce qui arrive sans
 * cesse dans une ligne éditoriale — se confondaient. Un post antérieur à
 * `externalId` ne peut être modifié qu'en donnant son `id` Firestore, jamais
 * par ressemblance.
 */

/** Le JSON brut → un tableau d'éléments, ou une erreur explicite. */
export const parseSocialImport = (
  jsonStr: string
): { ok: true; items: unknown[] } | { ok: false; error: string } => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    return { ok: false, error: `JSON invalide : ${(e as Error).message}` };
  }
  if (parsed === null || parsed === undefined) return { ok: false, error: "JSON vide." };
  const items = Array.isArray(parsed) ? parsed : [parsed];
  if (items.length === 0) return { ok: false, error: "Aucun post dans le JSON." };
  return { ok: true, items };
};

/**
 * Valide une ligne. Rejette au lieu de corriger en silence : un réseau
 * inconnu remplacé par Instagram publiait sur le mauvais compte sans que
 * personne ne l'apprenne avant de le voir en ligne.
 */
export const validateImportPost = (
  raw: unknown,
  index: number
): { ok: true; post: ImportPost } | { ok: false; error: string } => {
  const n = index + 1;
  if (raw === null || raw === undefined) {
    return { ok: false, error: `#${n} : entrée vide (null) — ligne ignorée.` };
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return {
      ok: false,
      error: `#${n} : un objet est attendu, reçu ${Array.isArray(raw) ? "un tableau" : typeof raw}.`,
    };
  }
  const o = raw as Record<string, unknown>;

  const externalId = str(o.externalId);
  if (!externalId) {
    return { ok: false, error: `#${n} : "externalId" requis — c'est lui qui permet de compléter le post plus tard.` };
  }
  if (!EXTERNAL_ID_RE.test(externalId)) {
    return {
      ok: false,
      error: `#${n} : "externalId" invalide (${JSON.stringify(o.externalId)}) — lettres, chiffres, tiret et souligné, 120 caractères maximum.`,
    };
  }

  const date = str(o.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    return { ok: false, error: `#${n} : "date" requise au format AAAA-MM-JJ (reçu : ${JSON.stringify(o.date)}).` };
  }

  const caption = str(o.caption);
  if (!caption) return { ok: false, error: `#${n} : "caption" requis.` };

  const channel = str(o.channel);
  if (!(CHANNELS as readonly string[]).includes(channel)) {
    return { ok: false, error: `#${n} : réseau inconnu ${JSON.stringify(o.channel)} — attendu ${CHANNELS.join(", ")}.` };
  }

  const type = str(o.type);
  if (!(TYPES as readonly string[]).includes(type)) {
    return { ok: false, error: `#${n} : type inconnu ${JSON.stringify(o.type)} — attendu ${TYPES.join(", ")}.` };
  }

  const status = str(o.status);
  // `STATUTS_MANUELS` et non tous les statuts : « publishing » appartient à la
  // file de publication. Un fichier généré qui le réclamerait ferait
  // disparaître le post de la file jusqu'à expiration de la réservation.
  if (status && !(STATUTS_MANUELS as readonly string[]).includes(status)) {
    return { ok: false, error: `#${n} : statut inconnu ${JSON.stringify(o.status)}.` };
  }

  const post: ImportPost = {
    externalId,
    date,
    channel: channel as PostChannel,
    type: type as PostType,
    caption,
    // Un import ne crée JAMAIS autre chose qu'un brouillon, même si le JSON
    // réclame « ready ». « ready » est la porte de la publication
    // automatique : elle ne s'ouvre que par une relecture humaine dans
    // l'admin, jamais par un fichier généré.
    status: "draft",
  };
  if (status && status !== "draft") {
    post.statusIgnored = status as PostStatus;
  }
  // La case éditoriale. Un identifiant inconnu est refusé plutôt qu'ignoré :
  // silencieusement accepté, il ne compterait dans aucune statistique, et la
  // grille se croirait à jour en laissant un angle se répéter.
  const cases = [
    ["persona", PERSONAS],
    ["pilier", PILIERS],
    ["angle", ANGLES],
  ] as const;
  for (const [champ, valeurs] of cases) {
    const v = str(o[champ]);
    if (!v) continue;
    if (!valeurs.some((x) => x.id === v)) {
      return {
        ok: false,
        error: `#${n} : ${champ} inconnu ${JSON.stringify(o[champ])} — attendu ${valeurs.map((x) => x.id).join(", ")}.`,
      };
    }
    post[champ] = v;
  }

  for (const champ of ["hashtags", "visual"] as const) {
    const v = str(o[champ]);
    if (v) post[champ] = v;
  }

  // Blotato exige une URL publiquement accessible : une adresse en http, un
  // chemin de fichier local ou une donnée en base64 échoueraient à la
  // publication, des jours plus tard, sans rapport visible avec l'import.
  const imageUrl = str(o.imageUrl);
  if (imageUrl) {
    if (!/^https:\/\//i.test(imageUrl)) {
      return {
        ok: false,
        error: `#${n} : "imageUrl" doit commencer par https:// (reçu : ${JSON.stringify(o.imageUrl)}) — un chemin local ne peut pas être publié.`,
      };
    }
    post.imageUrl = imageUrl;
  }

  const id = str(o.id);
  if (id) post.id = id;

  return { ok: true, post };
};

/**
 * Confronte les lignes valides à l'existant.
 *
 * Un post retrouvé est ENRICHI, pas ignoré : le parcours réel est « générer
 * le texte, importer, produire le visuel, réimporter » — et l'ancien import
 * jetait la seconde passe, donc l'image n'arrivait jamais.
 */
export const planSocialImport = (
  posts: ImportPost[],
  existing: ExistingPost[]
): { actions: ImportAction[]; errors: string[] } => {
  const byExternalId = new Map<string, ExistingPost>();
  const byDocId = new Map<string, ExistingPost>();
  for (const p of existing) {
    if (p.externalId) byExternalId.set(p.externalId, p);
    byDocId.set(p.id, p);
  }

  const actions: ImportAction[] = [];
  const errors: string[] = [];
  // Un même lot peut contenir deux fois la même référence : la seconde ne
  // doit pas créer un jumeau ni écraser la première sans le dire.
  const seenInBatch = new Set<string>();

  posts.forEach((p, i) => {
    const n = i + 1;

    if (seenInBatch.has(p.externalId)) {
      errors.push(`#${n} : externalId "${p.externalId}" présent deux fois dans le lot — seule la première ligne est prise.`);
      actions.push({ action: "skip", reason: "doublon dans le lot" });
      return;
    }
    seenInBatch.add(p.externalId);

    // Un `id` explicite vise un post antérieur à `externalId`. S'il est
    // introuvable, on refuse : créer un document sous un id inventé ferait
    // silencieusement apparaître un post là où l'intention était d'en
    // corriger un existant.
    let found: ExistingPost | undefined;
    if (p.id) {
      found = byDocId.get(p.id);
      if (!found) {
        errors.push(`#${n} : aucun post ne porte l'id "${p.id}" — rien n'a été créé. Retire le champ "id" pour créer un nouveau post.`);
        actions.push({ action: "skip", reason: "id introuvable" });
        return;
      }
    } else {
      found = byExternalId.get(p.externalId);
    }

    if (!found) {
      actions.push({ action: "create", post: p });
      return;
    }

    // Tout ce qui n'est plus un brouillon est hors de portée d'un import :
    // publié, programmé, en cours d'envoi, ou d'état incertain. Écrasé, un
    // post déjà parti chez Blotato afficherait dans l'admin un contenu
    // différent de celui réellement publié.
    if (found.status !== "draft") {
      actions.push({ action: "skip", reason: `protégé (statut « ${found.status} »)` });
      return;
    }

    const patch: Partial<ImportPost> = {};
    // Seulement ce qui CHANGE : recopier à l'identique ferait une écriture
    // et un updatedAt à chaque réimport, pour rien.
    for (const champ of ["caption", "hashtags", "visual", "imageUrl", "date", "type", "persona", "pilier", "angle"] as const) {
      const v = p[champ];
      if (v !== undefined && v !== "" && v !== found[champ]) patch[champ] = v as never;
    }
    // L'identifiant est posé s'il manquait : l'historique devient suivable.
    if (!found.externalId) patch.externalId = p.externalId;

    if (Object.keys(patch).length === 0) {
      actions.push({ action: "skip", reason: "identique" });
      return;
    }
    actions.push({ action: "enrich", id: found.id, patch });
  });

  return { actions, errors };
};
