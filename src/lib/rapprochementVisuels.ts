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
  const parId = new Map<string, { url: string; slide: number }[]>();
  const utilises = new Set<string>();

  for (const f of fichiers) {
    const id = identifiantDepuisNom(f.name);
    if (!id) continue;
    const liste = parId.get(id.externalId) ?? [];
    liste.push({ url: f.url, slide: id.slide ?? 1 });
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
    // Déjà attaché et on ne remplace pas : rien à faire, mais le visuel n'est
    // pas orphelin pour autant.
    if (post.imageUrl && !remplacer) continue;
    attacher.push({ post, url: trouves[0].url });
  }

  const orphelins = [...parId.keys()]
    .filter((id) => !utilises.has(id))
    .sort();

  return { attacher, sansVisuel, orphelins };
};
