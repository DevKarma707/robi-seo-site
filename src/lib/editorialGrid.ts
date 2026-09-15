import type { SocialPost } from "./socialPosts";

/**
 * La grille éditoriale : de quoi fabriquer des idées au lieu d'en attendre.
 *
 * Le problème que ce module résout n'est pas « trouver une idée ». C'est que
 * chaque session d'écriture démarre sans mémoire : elle ne sait pas que les
 * quatre derniers posts parlaient tous d'un artisan débordé le soir. Elle
 * refait donc le même post, en un peu moins bien, et le compte devient
 * monotone sans que personne n'ait pris cette décision.
 *
 * Un post n'est donc plus « une idée » mais une **case** dans un espace à
 * trois axes — qui vise-t-on, quel pilier, quel levier. On garde la case
 * occupée sur le post, et la suivante se choisit dans ce qui reste.
 *
 * Trois axes, 10 × 5 × 12 : 600 cases. La redondance redevient un choix.
 */

/** Qui on montre. Tiré de la cible de `branding/EDITORIAL_LINE.md`. */
export const PERSONAS = [
  { id: "menuisier", label: "Menuisier / artisan bois", secteur: "BTP" },
  { id: "electricienne", label: "Électricienne", secteur: "BTP" },
  { id: "plombier", label: "Plombier", secteur: "BTP" },
  { id: "graphiste", label: "Graphiste freelance", secteur: "créatif" },
  { id: "photographe", label: "Photographe", secteur: "créatif" },
  { id: "developpeuse", label: "Développeuse freelance", secteur: "tech" },
  { id: "consultant", label: "Consultant indépendant", secteur: "conseil" },
  { id: "restauratrice", label: "Restauratrice", secteur: "événementiel" },
  { id: "traiteur", label: "Traiteur / événementiel", secteur: "événementiel" },
  { id: "kine", label: "Kiné / profession libérale", secteur: "santé" },
] as const;

/** Ce qu'on fait. Les parts viennent de la ligne éditoriale, section 4. */
export const PILIERS = [
  { id: "situation", label: "Situation vécue", part: 0.3 },
  { id: "produit", label: "Produit en action", part: 0.25 },
  { id: "pedagogie", label: "Pédagogie", part: 0.2 },
  { id: "preuve", label: "Preuve", part: 0.15 },
  { id: "statement", label: "Statement", part: 0.1 },
] as const;

/**
 * Par où on attaque. C'est l'axe qui manquait, et c'est celui qui fait la
 * différence : deux posts peuvent viser le même artisan sur le même pilier
 * et ne rien avoir en commun s'ils tirent sur des leviers différents.
 */
export const ANGLES = [
  { id: "temps-perdu", label: "Le temps perdu", exemple: "22h47, il te reste 3 devis" },
  { id: "argent-qui-dort", label: "L'argent qui dort", exemple: "3 factures impayées depuis juin" },
  { id: "malaise-relance", label: "Le malaise de relancer", exemple: "relancer, c'est gênant, alors on attend" },
  { id: "peur-administrative", label: "La peur administrative", exemple: "Factur-X, TVA, contrôle" },
  { id: "pas-comptable", label: "« Je ne suis pas comptable »", exemple: "personne ne t'a appris à facturer" },
  { id: "avant-apres", label: "Avant / après", exemple: "40 minutes hier, 40 secondes aujourd'hui" },
  { id: "detail-qui-tue", label: "Le détail qui tue", exemple: "la troisième ressaisie du même montant" },
  { id: "legitimite", label: "La légitimité", exemple: "un devis bâclé fait perdre le client" },
  { id: "liberte", label: "Pourquoi tu as monté ta boîte", exemple: "ce n'était pas pour la paperasse" },
  { id: "travail-invisible", label: "Le travail après le travail", exemple: "la journée finit quand la paperasse finit" },
  { id: "echeance", label: "L'échéance qui approche", exemple: "1er septembre 2026" },
  { id: "preuve-chiffree", label: "La preuve chiffrée", exemple: "2 documents gratuits par mois" },
] as const;

export type PersonaId = (typeof PERSONAS)[number]["id"];
export type PilierId = (typeof PILIERS)[number]["id"];
export type AngleId = (typeof ANGLES)[number]["id"];

/** La case qu'un post occupe. */
export interface Case {
  pilier: PilierId;
  persona?: PersonaId;
  angle: AngleId;
}

/**
 * Espacements minimaux, en nombre de posts.
 *
 * Ce ne sont pas des seuils esthétiques : c'est la distance en dessous de
 * laquelle un abonné qui fait défiler son fil reconnaît le post précédent. Un
 * même métier deux fois de suite se voit tout de suite ; un même levier se
 * remarque un peu plus tard, d'où l'écart plus large.
 */
export const ECART_PERSONA = 3;
export const ECART_ANGLE = 5;

const ids = <T extends { id: string }>(xs: readonly T[]) => xs.map((x) => x.id);

/** Les posts, du plus ancien au plus récent. */
const parDate = (posts: SocialPost[]) =>
  [...posts].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

export interface Diagnostic {
  /** Combien de posts portent déjà une case renseignée. */
  renseignes: number;
  /** Piliers sous leur part cible, du plus en retard au moins. */
  piliersEnRetard: { id: PilierId; label: string; observe: number; cible: number }[];
  /** Personas jamais utilisés, ou pas depuis longtemps. */
  personasFroids: PersonaId[];
  /** Angles jamais utilisés, ou pas depuis longtemps. */
  anglesFroids: AngleId[];
  /** Ce qui est trop frais pour ressortir maintenant. */
  interdits: { personas: PersonaId[]; angles: AngleId[] };
}

/**
 * Ce que l'historique dit de ce qu'il faut écrire ensuite.
 *
 * Volontairement descriptif : il constate des manques, il n'écrit pas les
 * posts. Un générateur qui reçoit « ces cases sont libres » produit du neuf ;
 * un générateur à qui on dit « sois original » produit des variantes du
 * dernier post qu'il a lu.
 */
export const diagnostiquer = (posts: SocialPost[]): Diagnostic => {
  const ordonnes = parDate(posts);
  const avecCase = ordonnes.filter((p) => p.pilier || p.angle || p.persona);

  // Part observée par pilier, comparée à la cible de la ligne éditoriale.
  const totalPiliers = ordonnes.filter((p) => p.pilier).length;
  const piliersEnRetard = PILIERS.map((pil) => {
    const n = ordonnes.filter((p) => p.pilier === pil.id).length;
    return {
      id: pil.id,
      label: pil.label,
      observe: totalPiliers ? n / totalPiliers : 0,
      cible: pil.part,
    };
  })
    .filter((p) => p.observe < p.cible)
    .sort((a, b) => a.observe - a.cible - (b.observe - b.cible));

  /**
   * « Froid » = jamais servi, ou servi il y a longtemps. Le jamais-servi passe
   * devant : c'est là que se trouve le vrai neuf, alors qu'un angle ancien
   * n'est qu'un retour.
   */
  const froids = <T extends string>(
    tous: readonly T[],
    champ: (p: SocialPost) => string | undefined
  ): T[] => {
    const dernierIndex = new Map<string, number>();
    ordonnes.forEach((p, i) => {
      const v = champ(p);
      if (v) dernierIndex.set(v, i);
    });
    return [...tous].sort((a, b) => {
      const ia = dernierIndex.has(a) ? dernierIndex.get(a)! : -1;
      const ib = dernierIndex.has(b) ? dernierIndex.get(b)! : -1;
      return ia - ib;
    });
  };

  const derniers = (n: number) => ordonnes.slice(-n);

  return {
    renseignes: avecCase.length,
    piliersEnRetard,
    personasFroids: froids(ids(PERSONAS) as PersonaId[], (p) => p.persona),
    anglesFroids: froids(ids(ANGLES) as AngleId[], (p) => p.angle),
    interdits: {
      personas: derniers(ECART_PERSONA)
        .map((p) => p.persona)
        .filter((v): v is PersonaId => !!v),
      angles: derniers(ECART_ANGLE)
        .map((p) => p.angle)
        .filter((v): v is AngleId => !!v),
    },
  };
};

/**
 * Propose `combien` cases libres, prêtes à écrire.
 *
 * Déterministe : deux appels sur le même historique donnent la même liste. Un
 * tirage au sort empêcherait de reproduire un lot, donc de comprendre ce qui
 * a été proposé et pourquoi.
 *
 * L'ordre des piliers suit le retard sur la cible, puis les parts. Les
 * personas et les angles avancent en parallèle dans leur liste de « froids »,
 * en sautant ce qui est trop récent.
 */
/**
 * Combien de fois chaque pilier revient dans un lot, et dans quel ordre.
 *
 * Une simple rotation donnerait autant de posts à chaque pilier — donc 20 %
 * de « statement » là où la ligne éditoriale en veut 10 %, et un compte deux
 * fois plus bavard que prévu. Les parts sont donc appliquées au lot lui-même.
 *
 * Reste à répartir : les places sont attribuées à la plus grosse part
 * restante, en évitant de reprendre le pilier précédent tant qu'un autre est
 * disponible. Deux `bold` consécutifs sont explicitement interdits par la
 * ligne éditoriale, et la règle vaut pour les autres piliers.
 */
const repartirPiliers = (d: Diagnostic, combien: number): PilierId[] => {
  // Le retard sur la cible donne un bonus, pour rattraper sur la durée sans
  // renverser le mélange d'un seul lot.
  const bonus = new Map(d.piliersEnRetard.map((p, i) => [p.id, (d.piliersEnRetard.length - i) * 0.02]));
  const restes = new Map<PilierId, number>(
    PILIERS.map((p) => [p.id, combien * (p.part + (bonus.get(p.id) ?? 0))])
  );

  const suite: PilierId[] = [];
  for (let i = 0; i < combien; i++) {
    const precedent = suite[suite.length - 1];
    const candidats = [...restes.entries()]
      .filter(([, r]) => r > 0)
      .sort((a, b) => b[1] - a[1]);
    // Éviter la répétition, sauf s'il ne reste que ce pilier-là.
    const choisi =
      candidats.find(([id]) => id !== precedent)?.[0] ??
      candidats[0]?.[0] ??
      PILIERS[0].id;
    suite.push(choisi);
    restes.set(choisi, (restes.get(choisi) ?? 0) - 1);
  }
  return suite;
};

export const proposerCases = (posts: SocialPost[], combien: number): Case[] => {
  const d = diagnostiquer(posts);

  const ordrePiliers = repartirPiliers(d, combien);

  const personas = d.personasFroids.filter((p) => !d.interdits.personas.includes(p));
  const angles = d.anglesFroids.filter((a) => !d.interdits.angles.includes(a));

  const sorties: Case[] = [];
  for (let i = 0; i < combien; i++) {
    const pilier = ordrePiliers[i];
    const angle = angles[i % angles.length];
    // Le statement ne montre personne : c'est une punchline plein écran.
    const persona = pilier === "statement" ? undefined : personas[i % personas.length];
    sorties.push({ pilier, angle, ...(persona ? { persona } : {}) });
  }
  return sorties;
};

const libelle = <T extends { id: string; label: string }>(xs: readonly T[], id?: string) =>
  xs.find((x) => x.id === id)?.label ?? id ?? "—";

export const libellePersona = (id?: string) => libelle(PERSONAS, id);
export const libellePilier = (id?: string) => libelle(PILIERS, id);
export const libelleAngle = (id?: string) => libelle(ANGLES, id);
