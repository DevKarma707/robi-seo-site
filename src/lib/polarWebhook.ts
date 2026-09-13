import crypto from "crypto";

/**
 * Vérification des signatures Polar (norme Standard Webhooks).
 *
 * Extrait de la route pour être testable : ce code décide si une requête qui
 * prétend venir de Polar est crue, et c'est la porte d'entrée du chemin de
 * l'argent.
 *
 * La signature couvre `id.timestamp.payload`. L'horodatage était bien inclus
 * dans la chaîne signée mais jamais VÉRIFIÉ : une requête légitime interceptée
 * restait donc valable indéfiniment et pouvait être rejouée à volonté. La
 * norme impose une fenêtre de tolérance — c'est ce qui manquait.
 */

/** Cinq minutes de part et d'autre, valeur recommandée par Standard Webhooks. */
export const DEFAULT_TOLERANCE_SEC = 300;

export interface WebhookHeaders {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
}

export interface VerifyResult {
  ok: boolean;
  /** Motif technique : pour les logs, jamais pour la réponse HTTP. */
  reason?: string;
}

/**
 * Comparaison à temps constant de deux chaînes.
 *
 * `timingSafeEqual` exige des longueurs égales et lève sinon ; une différence
 * de longueur signifie de toute façon que la signature ne correspond pas.
 */
const safeEqual = (a: string, b: string): boolean => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
};

export const verifyPolarSignature = (
  payload: string,
  headers: WebhookHeaders,
  secret: string,
  now: number = Date.now(),
  toleranceSec: number = DEFAULT_TOLERANCE_SEC,
): VerifyResult => {
  const { id, timestamp, signature } = headers;

  // Un secret absent doit refuser, jamais laisser passer : sans cette garde,
  // une variable d'environnement oubliée ouvrirait le webhook à tout le monde.
  if (!secret) return { ok: false, reason: "secret absent" };
  if (!id || !timestamp || !signature) return { ok: false, reason: "en-têtes incomplets" };

  const sentAtSec = Number(timestamp);
  if (!Number.isFinite(sentAtSec)) return { ok: false, reason: "horodatage illisible" };

  // La fenêtre joue dans les deux sens : trop vieux est un rejeu, trop récent
  // trahit une horloge faussée ou un horodatage forgé.
  const driftSec = Math.abs(now / 1000 - sentAtSec);
  if (driftSec > toleranceSec) {
    return { ok: false, reason: `hors fenêtre (${Math.round(driftSec)} s)` };
  }

  const signedPayload = `${id}.${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("base64");

  // Plusieurs signatures peuvent coexister pendant une rotation de secret :
  // elles sont séparées par des espaces, chacune préfixée de sa version.
  for (const entry of signature.split(" ")) {
    const parts = entry.split(",");
    if (parts.length !== 2) continue;
    const [version, hash] = parts;
    if (version !== "v1") continue;
    if (safeEqual(hash, expected)) return { ok: true };
  }

  return { ok: false, reason: "aucune signature ne correspond" };
};

/**
 * Montant Polar en centimes → unité monétaire.
 *
 * Renvoie null plutôt que NaN quand le montant est absent : `undefined / 100`
 * donnait `NaN`, transmis tel quel aux plateformes d'affiliation, qui
 * enregistraient alors une transaction sans montant exploitable.
 */
export const toMajorUnits = (amountInCents: unknown): number | null => {
  const n = Number(amountInCents);
  if (!Number.isFinite(n)) return null;
  return n / 100;
};
