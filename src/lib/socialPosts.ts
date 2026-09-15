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
  serverTimestamp, getDocs, deleteField, runTransaction, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  parseSocialImport, validateImportPost, planSocialImport,
  type ExistingPost, type ImportPost,
} from "./socialImport";

export type PostChannel = "instagram" | "linkedin" | "tiktok";
/**
 * `publishing` n'est jamais choisi par un humain : la file le pose le temps
 * d'une publication, pour qu'un second passage ne reprenne pas le même post.
 * Voir `socialQueue.ts`.
 */
export type PostStatus = "draft" | "ready" | "publishing" | "published";
export type PostType = "bold" | "feature" | "stats" | "testimonial" | "carrousel" | "mockup";

export interface SocialPost {
  id?: string;
  /**
   * Identité stable donnée par le générateur, et id du document Firestore
   * pour tout post créé par import. Les posts antérieurs n'en ont pas : ils
   * gardent leur id aléatoire et ne se modifient qu'en le désignant.
   */
  externalId?: string;
  /** Date de publication prévue, en AAAA-MM-JJ. Sert de clé de calendrier. */
  date: string;
  channel: PostChannel;
  type: PostType;
  /** Le texte du post, prêt à coller. */
  caption: string;
  hashtags?: string;
  /** Ce qu'il faut voir sur le visuel — sert de consigne à Higgsfield. */
  visual?: string;
  /** URL du visuel retenu. C'est celui qui part à la publication. */
  imageUrl?: string;
  /**
   * Les visuels proposés pour ce post, parmi lesquels `imageUrl` est choisi.
   *
   * La photo coûte un crédit et trente secondes ; la recomposer dans un autre
   * habillage ne coûte rien. Livrer plusieurs propositions est donc presque
   * gratuit — ce qui manquait, c'était un endroit où les poser et un geste
   * pour en retenir une.
   */
  imagePropositions?: string[];
  /**
   * La case de la grille éditoriale que ce post occupe (`editorialGrid.ts`).
   *
   * Facultatifs, et c'est assumé : les posts écrits avant la grille n'en ont
   * pas, et un post ponctuel n'a pas à en porter. Mais sans eux, la
   * génération suivante ne peut pas savoir ce qui a déjà été dit — elle ne
   * voit que des accroches, pas des angles.
   */
  persona?: string;
  pilier?: string;
  angle?: string;
  status: PostStatus;
  /** Réservation en cours, posée par la file de publication. */
  claimId?: string | null;
  claimedAt?: string | null;
  /** Renseignés par la file : ce qui s'est passé au dernier envoi. */
  publishedAt?: string | null;
  publishedUrl?: string | null;
  /** Programmé chez un fournisseur qui publiera à la date prévue. */
  scheduledVia?: "blotato" | null;
  scheduledAt?: string | null;
  scheduledFor?: string | null;
  publishError?: string | null;
  publishAttempts?: number | null;
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
  publishing: { label: "Envoi en cours", color: "#fbbf24" },
  published: { label: "Publié", color: "#10B981" },
};

/**
 * Les statuts qu'un humain peut poser lui-même.
 *
 * `publishing` en est exclu : le proposer dans l'admin permettrait de
 * fabriquer une réservation sans réservation, donc de faire disparaître un
 * post de la file jusqu'à expiration, sans que rien ne l'explique.
 */
export const STATUTS_MANUELS: PostStatus[] = ["draft", "ready", "published"];

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
  patch: { caption: string; hashtags: string; visual: string; imageUrl?: string; date?: string }
) =>
  updateDoc(doc(db, "socialPosts", id), {
    caption: patch.caption,
    // La date était le seul champ qu'aucun écran ne permettait de changer :
    // décaler un post d'un jour demandait de le supprimer et de le refaire,
    // ce qui lui faisait perdre son identifiant et son historique d'envoi.
    ...(patch.date ? { date: patch.date } : {}),
    hashtags: patch.hashtags.trim() ? patch.hashtags.trim() : deleteField(),
    visual: patch.visual.trim() ? patch.visual.trim() : deleteField(),
    // `visual` est la consigne écrite, `imageUrl` le visuel réellement
    // attaché : deux champs distincts parce qu'on décrit souvent l'image
    // avant de l'avoir. Une chaîne vide efface le champ plutôt que d'y
    // laisser un lien mort.
    imageUrl: patch.imageUrl?.trim() ? patch.imageUrl.trim() : deleteField(),
    updatedAt: serverTimestamp(),
  });

// ─── Import JSON ──────────────────────────────────────────────────────
/**
 * Le format seul ne suffit pas : Date.parse("2026-02-30") est valide en JS et
 * bascule au 2 mars. Sans l'aller-retour ci-dessous, un post daté d'un jour
 * inexistant serait accepté puis affiché sur une autre date que celle écrite.
 */
/**
 * Même contrat que les autres imports de l'admin : un tableau d'objets,
 * les invalides sont signalés sans faire échouer le lot.
 *
 * La déduplication se fait sur date + réseau + début de texte : relancer le
 * skill sur un mois déjà importé ne doit pas dupliquer le calendrier.
 */
export const importPostsFromJson = async (
  jsonStr: string
): Promise<{ imported: number; updated: number; skipped: number; errors: string[] }> => {
  const lu = parseSocialImport(jsonStr);
  if (!lu.ok) throw new Error(lu.error);

  const errors: string[] = [];
  const posts: ImportPost[] = [];
  lu.items.forEach((raw, i) => {
    const r = validateImportPost(raw, i);
    if (r.ok) posts.push(r.post);
    else errors.push(r.error);
  });

  // Les statuts réclamés mais non appliqués sont dits, pas tus : sans ça, un
  // générateur qui produit « ready » croirait ses posts prêts à partir.
  const forces = posts.filter((p) => p.statusIgnored).length;
  if (forces) {
    errors.push(`${forces} post(s) demandaient un statut autre que brouillon : ignoré. Le passage en « prêt » se fait dans l'admin, après relecture.`);
  }

  const snap = await getDocs(col());
  const existing: ExistingPost[] = snap.docs.map((d) => {
    const p = d.data() as SocialPost;
    return {
      id: d.id,
      externalId: p.externalId,
      date: p.date,
      channel: p.channel,
      type: p.type,
      caption: p.caption,
      hashtags: p.hashtags,
      visual: p.visual,
      imageUrl: p.imageUrl,
      status: p.status,
    };
  });

  const { actions, errors: planErrors } = planSocialImport(posts, existing);
  errors.push(...planErrors);

  let imported = 0;
  let updated = 0;
  let skipped = actions.filter((a) => a.action === "skip").length;

  const aEcrire = actions.filter((a) => a.action !== "skip");
  if (aEcrire.length === 0) return { imported, updated, skipped, errors };

  // Une transaction plutôt qu'un batch : il faut RELIRE la cible avant
  // d'écrire. Deux imports lancés en même temps — deux onglets, un double
  // clic — verraient sinon chacun une base vide et créeraient deux fois le
  // même post.
  await runTransaction(db, async (tx) => {
    imported = 0;
    updated = 0;

    const cibles = aEcrire.map((a) => ({
      action: a,
      // L'id du document EST l'externalId pour tout post créé par import :
      // le doublon devient impossible par construction, pas seulement
      // improbable après vérification.
      ref: a.action === "create" ? doc(col(), a.post.externalId) : doc(col(), a.id),
    }));

    // Firestore impose toutes les lectures avant la première écriture.
    const lus = await Promise.all(cibles.map((c) => tx.get(c.ref)));

    cibles.forEach(({ action, ref }, i) => {
      const dejaLa = lus[i].exists();

      if (action.action === "create") {
        if (dejaLa) {
          // Apparu entre le plan et la transaction : ne rien écraser.
          skipped++;
          errors.push(`"${action.post.externalId}" existait déjà au moment de l'écriture — rien n'a été remplacé.`);
          return;
        }
        const { statusIgnored, id: _ignore, ...champs } = action.post;
        void statusIgnored;
        void _ignore;
        tx.set(ref, { ...champs, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        imported++;
        return;
      }

      if (!dejaLa) {
        // Supprimé entre-temps. `update` lèverait et emporterait tout le lot.
        skipped++;
        errors.push(`Le post visé (${ref.id}) n'existe plus — mise à jour abandonnée.`);
        return;
      }
      tx.update(ref, { ...action.patch, updatedAt: serverTimestamp() });
      updated++;
    });
  });

  return { imported, updated, skipped, errors };
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
