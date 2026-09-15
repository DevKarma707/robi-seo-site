/**
 * Règles de la file de publication, isolées de Firestore.
 *
 * Le problème que ce module résout : sans réservation, `GET` rend tous les
 * posts « prêts » et dus, à chaque appel. Si l'automatisation publie puis
 * meurt avant d'appeler `POST`, le post est toujours « prêt » — et repart au
 * passage suivant. Le compte publie deux fois la même chose, et personne ne
 * s'en rend compte avant de le voir dans le feed.
 *
 * D'où la réservation : sortir un post de la file et le rendre sont deux
 * opérations distinctes, et seul celui qui l'a réservé peut le rendre.
 *
 * Tout est ici en fonctions pures pour être vérifiable sans Firestore
 * (`npm run check:social`) : ce sont exactement les cas tordus — rappel en
 * double, réservation périmée, deux exécutions qui se chevauchent — qu'on ne
 * sait pas provoquer à la main en production.
 */

/**
 * Durée au-delà de laquelle une réservation est considérée abandonnée.
 *
 * Arbitrage : trop court, on republie par-dessus une exécution simplement
 * lente — exactement le défaut qu'on corrige. Trop long, un plantage gèle le
 * post pour toute la durée. Une publication réelle (upload du visuel compris)
 * se compte en secondes ; quinze minutes laissent donc deux ordres de
 * grandeur de marge avant qu'on parle d'abandon.
 */
export const DUREE_RESERVATION_MS = 15 * 60 * 1000;

/**
 * Nombre d'échecs consécutifs après lequel un post quitte la file.
 *
 * Un échec isolé ne doit rien rétrograder : une coupure réseau ne justifie
 * pas de redemander une validation humaine. Mais réessayer sans fin un post
 * qui échoue toujours (visuel supprimé, compte déconnecté) ne le réparera
 * jamais tout seul — au bout du cinquième, c'est un humain qu'il faut.
 */
export const ECHECS_AVANT_ABANDON = 5;

export type StatutFile = "draft" | "ready" | "publishing" | "published";

/** Ce que la file a besoin de savoir d'un post. */
export interface PostEnFile {
  id: string;
  date: string;
  status: StatutFile;
  imageUrl?: string | null;
  claimId?: string | null;
  /** Horodatage ISO de la réservation en cours. */
  claimedAt?: string | null;
  publishAttempts?: number | null;
  /** Déjà programmé chez un fournisseur qui publiera lui-même (ex. "blotato"). */
  scheduledVia?: string | null;
}

/** Date du jour en AAAA-MM-JJ, le format dans lequel les dates sont stockées. */
export const jour = (maintenant: Date): string => maintenant.toISOString().slice(0, 10);

/**
 * Un post est-il réservable maintenant ?
 *
 * La comparaison de dates est lexicographique parce que le stockage est en
 * AAAA-MM-JJ : pas de conversion, pas de fuseau. Et c'est bien `<=` et non
 * `==` — un post dont le jour est passé parce que l'automatisation n'a pas
 * tourné doit sortir, pas être oublié.
 */
export const estReservable = (post: PostEnFile, maintenant: Date): boolean => {
  // Programmé chez Blotato : c'est lui qui publie à l'heure dite. Le sortir
  // d'ici le publierait une seconde fois.
  if (post.scheduledVia) return false;
  if (post.date > jour(maintenant)) return false;
  if (post.status === "ready") return true;
  // Une réservation abandonnée redevient disponible, sinon un plantage
  // retirerait le post de la file définitivement, sans trace visible.
  if (post.status === "publishing") return reservationPerimee(post, maintenant);
  return false;
};

export const reservationPerimee = (post: PostEnFile, maintenant: Date): boolean => {
  if (!post.claimedAt) return true;
  const debut = Date.parse(post.claimedAt);
  // Une date illisible est traitée comme périmée : mieux vaut republier un
  // post qu'en geler un pour toujours sur une valeur corrompue.
  if (Number.isNaN(debut)) return true;
  return maintenant.getTime() - debut >= DUREE_RESERVATION_MS;
};

/** Les champs à écrire pour réserver un post. */
export const patchReservation = (claimId: string, maintenant: Date) => ({
  status: "publishing" as const,
  claimId,
  claimedAt: maintenant.toISOString(),
});

export type Reglement =
  | { accepte: true; patch: Record<string, unknown>; statut: StatutFile }
  /** Déjà réglé à l'identique : on ne réécrit rien, mais ce n'est pas une erreur. */
  | { accepte: true; patch: null; statut: StatutFile; dejaFait: true }
  | { accepte: false; motif: "reservation_inconnue" | "reservation_perdue" };

/**
 * Que faire du résultat annoncé par l'automatisation.
 *
 * C'est ici que se joue la protection contre le double envoi : un rappel qui
 * ne présente pas la réservation en cours n'écrit rien. Un rappel rejoué en
 * double, ou émis par une exécution dont la réservation a expiré et a été
 * reprise par une autre, est donc sans effet au lieu d'écraser l'état écrit
 * par la bonne.
 */
export const reglerPublication = (
  post: PostEnFile,
  claimId: string,
  ok: boolean,
  extra: { url?: string; erreur?: string },
  maintenant: Date
): Reglement => {
  // Un rappel rejoué sur un post déjà publié est un doublon inoffensif : on
  // répond « c'est fait » plutôt qu'une erreur, pour ne pas pousser
  // l'automatisation à réessayer une publication qui a réussi.
  if (post.status === "published") {
    return { accepte: true, patch: null, statut: "published", dejaFait: true };
  }
  if (post.status !== "publishing" || !post.claimId) {
    return { accepte: false, motif: "reservation_inconnue" };
  }
  if (post.claimId !== claimId) {
    return { accepte: false, motif: "reservation_perdue" };
  }

  if (ok) {
    return {
      accepte: true,
      statut: "published",
      patch: {
        status: "published",
        publishedAt: maintenant.toISOString(),
        ...(extra.url ? { publishedUrl: extra.url } : {}),
        publishError: null,
        claimId: null,
        claimedAt: null,
        publishAttempts: 0,
      },
    };
  }

  const essais = (post.publishAttempts ?? 0) + 1;
  const abandon = essais >= ECHECS_AVANT_ABANDON;
  return {
    accepte: true,
    statut: abandon ? "draft" : "ready",
    patch: {
      // Après abandon le post retombe en brouillon : il reste au calendrier,
      // visible et corrigeable, mais ne repart plus tout seul.
      status: abandon ? "draft" : "ready",
      publishError: (extra.erreur || "échec inconnu").slice(0, 500),
      publishAttempts: essais,
      claimId: null,
      claimedAt: null,
    },
  };
};

/**
 * Un post réservé est-il réellement publiable ?
 *
 * Sans visuel la plupart des réseaux refusent le post. Le dire ici évite à
 * l'appelant de le redécouvrir par une erreur d'API, et évite surtout de
 * consommer une réservation pour rien.
 */
export const manqueVisuel = (post: PostEnFile): boolean => !post.imageUrl;
