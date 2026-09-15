import { CHANNEL_META, type PostChannel, type SocialPost } from "./socialPosts";

/**
 * Contrôles passés avant qu'un post ne devienne « prêt ».
 *
 * « Prêt » n'est pas une étiquette : c'est la porte de la publication
 * automatique. Une fois posée, plus personne ne regarde le post avant qu'il
 * ne soit dans le feed. Tout ce qui se vérifie mécaniquement doit donc l'être
 * ici, au dernier moment où un humain est encore devant l'écran.
 *
 * Deux niveaux, et la distinction compte : un **blocage** est une certitude
 * d'échec ou de dégât, un **avertissement** est un doute que seul Ralph peut
 * lever. Faire bloquer les doutes rendrait l'écran inutilisable et pousserait
 * à le contourner.
 */

/** Longueur maximale de légende acceptée par chaque réseau. */
const LIMITE_CARACTERES: Record<PostChannel, number> = {
  instagram: 2200,
  tiktok: 2200,
  linkedin: 3000,
};

/**
 * Registre attendu par réseau (`branding/EDITORIAL_LINE.md`).
 *
 * Ce n'est pas un détail de style : le texte d'un visuel est cuit dans
 * l'image. « Vous, vous finissez votre café » est déjà parti sur un visuel
 * Instagram — le fond était bon, le « vous » l'a rendu inutilisable.
 */
const REGISTRE: Record<PostChannel, "tutoiement" | "vouvoiement"> = {
  instagram: "tutoiement",
  tiktok: "tutoiement",
  linkedin: "vouvoiement",
};

const MARQUEURS_VOUVOIEMENT = /\b(vous|votre|vos)\b/i;
const MARQUEURS_TUTOIEMENT = /\b(tu|ton|ta|tes|toi)\b|\bt'(?:as|es|a)\b/i;

export interface Verdict {
  /** Rend la programmation impossible : échec ou dégât certain. */
  blocages: string[];
  /** À lever par un humain, mais ne justifie pas d'empêcher l'envoi. */
  avertissements: string[];
}

export const estProgrammable = (v: Verdict): boolean => v.blocages.length === 0;

/**
 * @param post    le post candidat
 * @param voisins les autres posts du calendrier, pour détecter les collisions
 * @param jourDuJour date du jour en AAAA-MM-JJ
 */
export const verifierAvantProgrammation = (
  post: SocialPost,
  voisins: SocialPost[],
  jourDuJour: string
): Verdict => {
  const blocages: string[] = [];
  const avertissements: string[] = [];

  const texte = (post.caption || "").trim();
  if (!texte) {
    blocages.push("Le texte est vide.");
  }

  // Sans visuel, le réseau refuse le post. Le laisser partir consommerait des
  // essais jusqu'à ce qu'il quitte la file tout seul, sans que rien ne dise
  // pourquoi.
  if (!post.imageUrl) {
    blocages.push("Aucun visuel n'est attaché — le réseau refusera le post.");
  } else if (!/^https:\/\//i.test(post.imageUrl)) {
    blocages.push("Le visuel doit être une adresse https://.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date || "")) {
    blocages.push("La date de publication est absente ou mal formée.");
  }

  const limite = LIMITE_CARACTERES[post.channel];
  if (texte.length > limite) {
    blocages.push(
      `Légende de ${texte.length} caractères : ${CHANNEL_META[post.channel].label} s'arrête à ${limite}.`
    );
  }

  // Une date passée n'est pas une erreur — un post en retard doit sortir —
  // mais elle signifie « part au prochain passage », pas « part le jour dit ».
  if (post.date && post.date < jourDuJour) {
    avertissements.push(`Daté du ${post.date} : il partira dès le prochain passage, pas plus tard.`);
  }

  const attendu = REGISTRE[post.channel];
  const vouvoie = MARQUEURS_VOUVOIEMENT.test(texte);
  const tutoie = MARQUEURS_TUTOIEMENT.test(texte);
  if (attendu === "tutoiement" && vouvoie && !tutoie) {
    avertissements.push(
      `${CHANNEL_META[post.channel].label} se tutoie, et le texte vouvoie.`
    );
  }
  if (attendu === "vouvoiement" && tutoie && !vouvoie) {
    avertissements.push(
      `${CHANNEL_META[post.channel].label} se vouvoie, et le texte tutoie.`
    );
  }

  // Deux posts le même jour sur le même compte, c'est de l'encombrement — et
  // le plus souvent le signe d'un doublon qu'on n'a pas vu passer.
  const collision = voisins.some(
    (v) =>
      v.id !== post.id &&
      v.date === post.date &&
      v.channel === post.channel &&
      (v.status === "ready" || v.status === "publishing" || v.status === "published")
  );
  if (collision) {
    avertissements.push(
      `Un autre post ${CHANNEL_META[post.channel].label} est déjà prévu le ${post.date}.`
    );
  }

  return { blocages, avertissements };
};
