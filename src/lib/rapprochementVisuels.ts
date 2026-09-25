import type { SocialPost } from "./socialPosts";

/**
 * Rapproche les visuels de la médiathèque des posts qui les attendent.
 *
 * Tout tient à une convention tenue de bout en bout : le compositeur nomme
 * chaque visuel `robi_post_<externalId>.jpg`, et le post porte ce même
 * `externalId`. Le rapprochement est donc mécanique — il n'y a rien à deviner,
 * et c'est précisément pour ça que la convention existe.
 *
 * Sans ça, attacher dix visuels demandait dix fois : ouvrir le post, éditer,
 * choisir dans la médiathèque, enregistrer. Quarante gestes pour une
 * correspondance que le nom de fichier donnait déjà.
 */

/** Ce qu'on sait d'un fichier de la médiathèque, réduit à l'utile. */
export interface FichierMediatheque {
  name: string;
  url: string;
  /** Chemin complet dans le bucket. Sert à reconnaître une URL périmée. */
  path?: string;
}

export interface Rapprochement {
  /** Le post et le visuel retenu pour lui. */
  attacher: { post: SocialPost; url: string }[];
  /** Posts sans visuel correspondant — il faudra les traiter à la main. */
  sansVisuel: SocialPost[];
  /** Visuels qui ne correspondent à aucun post : signe d'un identifiant changé. */
  orphelins: string[];
}

const EXTENSIONS = /\.(jpe?g|png|webp)$/i;
/** `2026-10-01-plombier-ig-a`, `…-ig-b-v2` → le post `2026-10-01-plombier-ig`. */
const VARIANTE = /^(.+)-[ab](?:-v\d+)?$/;

/**
 * Le chemin de l'objet dans le bucket, extrait d'une URL de téléchargement.
 *
 * Une URL Firebase Storage porte un jeton qui est REGÉNÉRÉ à chaque envoi :
 * remplacer `robi_post_x.jpg` par une nouvelle version donne une nouvelle
 * URL, et l'ancienne cesse de fonctionner. Un post qui garde l'ancienne
 * affiche alors une vignette cassée, sans que rien ne l'explique.
 *
 * Comparer les chemins plutôt que les URL permet de distinguer deux cas que
 * tout oppose : la même image ré-envoyée (on remet l'URL à jour, c'est une
 * réparation) et une autre image choisie à la main (on n'y touche pas).
 */
export const cheminDepuisUrl = (url: string): string | null => {
  try {
    // .../o/partage%2Freseaux%2Frobi_post_x.jpg?alt=media&token=…
    const m = new URL(url).pathname.match(/\/o\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
};

/**
 * `robi_post_2026-09-plombier-ig.jpg` → `2026-09-plombier-ig`
 * `robi_post_2026-09-facturx-ig_02.jpg` → `2026-09-facturx-ig` (slide 2)
 */
export const identifiantDepuisNom = (nom: string): { externalId: string; slide?: number } | null => {
  if (!EXTENSIONS.test(nom)) return null;
  const sansExt = nom.replace(EXTENSIONS, "");
  if (!sansExt.startsWith("robi_post_")) return null;
  const corps = sansExt.slice("robi_post_".length);
  // Un suffixe `_01` désigne une slide de carrousel, pas un post différent.
  const m = corps.match(/^(.*)_(\d{2})$/);
  if (m) return { externalId: m[1], slide: Number(m[2]) };
  return { externalId: corps };
};

/**
 * Décide quoi attacher à quoi.
 *
 * Ne touche pas aux posts qui ont déjà un visuel : un rapprochement qui
 * écrase un choix fait à la main serait pire que pas de rapprochement du
 * tout. Passer `remplacer` le permet, explicitement.
 */
export const rapprocher = (
  posts: SocialPost[],
  fichiers: FichierMediatheque[],
  remplacer = false
): Rapprochement => {
  /** externalId → visuels, la slide 1 (ou l'unique) en tête. */
  const parId = new Map<string, { url: string; slide: number; path: string }[]>();
  const utilises = new Set<string>();
  /** Versions A/B (`…-ig-a.jpg`, `…-ig-b-v2.jpg`) : rattachées par le JSON d'import. */
  const variantes = new Set<string>();

  for (const f of fichiers) {
    const id = identifiantDepuisNom(f.name);
    if (!id) continue;
    // Une version A/B ne s'attache pas par son nom — c'est l'`imageUrl` du
    // JSON qui la rattache. La compter comme orpheline affichait « 26 visuels
    // sans post » juste après un import parfaitement rattaché.
    const v = id.externalId.match(VARIANTE);
    if (v) { variantes.add(v[1]); continue; }
    const liste = parId.get(id.externalId) ?? [];
    liste.push({ url: f.url, slide: id.slide ?? 1, path: f.path ?? cheminDepuisUrl(f.url) ?? "" });
    parId.set(id.externalId, liste);
  }
  for (const liste of parId.values()) liste.sort((a, b) => a.slide - b.slide);

  const attacher: { post: SocialPost; url: string }[] = [];
  const sansVisuel: SocialPost[] = [];

  for (const post of posts) {
    if (!post.externalId) { sansVisuel.push(post); continue; }
    const trouves = parId.get(post.externalId);
    if (!trouves?.length) { sansVisuel.push(post); continue; }
    utilises.add(post.externalId);
    const retenu = trouves[0];

    if (post.imageUrl && !remplacer) {
      // Même fichier, URL différente : le visuel a été ré-envoyé et le jeton
      // a changé. On rafraîchit — sans quoi le post pointe vers une URL morte.
      // Ce n'est pas écraser un choix, c'est le suivre.
      const memeFichier =
        retenu.path !== "" && cheminDepuisUrl(post.imageUrl) === retenu.path;
      if (!memeFichier || post.imageUrl === retenu.url) continue;
    }
    attacher.push({ post, url: retenu.url });
  }

  const connus = new Set(posts.map((p) => p.externalId).filter(Boolean));
  const orphelins = [
    ...[...parId.keys()].filter((id) => !utilises.has(id)),
    ...[...variantes].filter((id) => !connus.has(id)),
  ].sort();

  return { attacher, sansVisuel, orphelins };
};
