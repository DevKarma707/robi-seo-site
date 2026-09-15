/**
 * Client Blotato — le fournisseur choisi pour le premier mois de publication
 * automatique (essai ; Postiz auto-hébergé reste l'option si on veut
 * internaliser ensuite — la file d'attente ne dépend pas du fournisseur).
 *
 * Contrat (help.blotato.com/api) :
 *   GET  https://backend.blotato.com/v2/users/me/accounts   → { items: [{ id, platform, fullname, username }] }
 *   POST https://backend.blotato.com/v2/posts               → { postSubmissionId, scheduledTime }
 *   en-tête `blotato-api-key`.
 *
 * Tout ce qui décide du contenu envoyé (texte, cible, options par réseau)
 * est en fonctions pures, vérifiées par scripts/checkBlotato.ts : c'est là
 * que se jouent les cas qu'on ne veut pas découvrir sur un compte public —
 * un hashtag collé au texte, TikTok sans ses drapeaux obligatoires, un
 * réseau sans compte connecté.
 */

const BASE = "https://backend.blotato.com/v2";

export type Plateforme = "instagram" | "linkedin" | "tiktok" | "facebook";

export interface CompteBlotato {
  id: string;
  platform: string;
  fullname?: string;
  username?: string;
}

/** Ce que la file rend pour un post à publier. */
export interface PostAPublier {
  id: string;
  channel: string;
  caption: string;
  hashtags?: string | null;
  imageUrl?: string | null;
}

/** Corps d'un POST /v2/posts. */
export interface CorpsBlotato {
  post: {
    accountId: string;
    content: { text: string; mediaUrls: string[]; platform: Plateforme };
    target: Record<string, unknown> & { targetType: Plateforme };
  };
  scheduledTime?: string;
}

/**
 * Texte final : légende, puis les hashtags séparés par une ligne vide.
 * Instagram les lit partout ; LinkedIn les préfère en fin de post.
 */
export const texteFinal = (caption: string, hashtags?: string | null): string =>
  [caption.trim(), (hashtags ?? "").trim()].filter(Boolean).join("\n\n");

/**
 * Le compte à utiliser pour un réseau.
 *
 * `forces` (BLOTATO_ACCOUNTS, JSON {"instagram":"123"}) l'emporte : un
 * utilisateur avec deux comptes Instagram connectés (perso + Robi) ne doit
 * pas dépendre de l'ordre de la liste. Sans forçage, le premier compte du
 * réseau fait l'affaire.
 */
export const compteFor = (
  channel: string,
  comptes: CompteBlotato[],
  forces: Record<string, string> = {}
): CompteBlotato | null => {
  if (forces[channel]) {
    return comptes.find((c) => c.id === forces[channel]) ?? { id: forces[channel], platform: channel };
  }
  return comptes.find((c) => c.platform === channel) ?? null;
};

/**
 * Cible par réseau, avec ce que Blotato exige en plus du type.
 *
 * TikTok : les sept drapeaux sont obligatoires. Ils décrivent un post Robi
 * standard : public, commentaires ouverts, pas de duo/stitch (visuel fixe),
 * contenu de marque et IA assumés — les visuels sont générés, la mention
 * est honnête et évite un retrait a posteriori.
 * Facebook : la page cible est un identifiant à fournir (BLOTATO_FACEBOOK_PAGE_ID).
 */
export const cibleFor = (
  channel: string,
  options: { facebookPageId?: string } = {}
): CorpsBlotato["post"]["target"] | null => {
  switch (channel) {
    case "instagram":
    case "linkedin":
      return { targetType: channel };
    case "tiktok":
      return {
        targetType: "tiktok",
        privacyLevel: "PUBLIC_TO_EVERYONE",
        disabledComments: false,
        disabledDuet: true,
        disabledStitch: true,
        isBrandedContent: false,
        isYourBrand: true,
        isAiGenerated: true,
      };
    case "facebook":
      if (!options.facebookPageId) return null;
      return { targetType: "facebook", pageId: options.facebookPageId };
    default:
      return null;
  }
};

export type Preparation =
  | { ok: true; corps: CorpsBlotato }
  | { ok: false; motif: string };

/**
 * Le corps complet d'une publication, ou la raison pour laquelle on ne
 * l'envoie pas. Rien ne part sans visuel : Instagram et TikTok le refusent,
 * et un post LinkedIn sans image n'est pas ce qu'on a validé dans l'admin.
 */
export const preparer = (
  post: PostAPublier,
  comptes: CompteBlotato[],
  options: { forces?: Record<string, string>; facebookPageId?: string } = {}
): Preparation => {
  if (!post.imageUrl) return { ok: false, motif: "visuel_manquant" };
  const compte = compteFor(post.channel, comptes, options.forces);
  if (!compte) return { ok: false, motif: `aucun_compte_${post.channel}` };
  const target = cibleFor(post.channel, options);
  if (!target) return { ok: false, motif: `cible_non_configuree_${post.channel}` };
  const texte = texteFinal(post.caption, post.hashtags);
  if (!texte) return { ok: false, motif: "texte_vide" };
  return {
    ok: true,
    corps: {
      post: {
        accountId: compte.id,
        content: { text: texte, mediaUrls: [post.imageUrl], platform: target.targetType },
        target,
      },
    },
  };
};

// ─── Appels réseau ─────────────────────────────────────────────────────

const headers = (apiKey: string) => ({
  "blotato-api-key": apiKey,
  "content-type": "application/json",
});

export const listerComptes = async (apiKey: string): Promise<CompteBlotato[]> => {
  const r = await fetch(`${BASE}/users/me/accounts`, { headers: headers(apiKey) });
  if (!r.ok) throw new Error(`Blotato accounts ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const body = (await r.json()) as { items?: CompteBlotato[] };
  return (body.items ?? []).map((c) => ({ ...c, id: String(c.id) }));
};

export const publier = async (
  apiKey: string,
  corps: CorpsBlotato
): Promise<{ postSubmissionId: string; scheduledTime?: string }> => {
  const r = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify(corps),
  });
  if (!r.ok) throw new Error(`Blotato publish ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return (await r.json()) as { postSubmissionId: string; scheduledTime?: string };
};
