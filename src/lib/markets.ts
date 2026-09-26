/**
 * Les marchés de Robi : un marché = une langue = un compte par réseau.
 *
 * Décision du 14/09/2026 (branding/EDITORIAL_LINE.md §7) : du texte cuit dans
 * une image ne se traduit pas, donc un compte Instagram par langue. Le
 * calendrier, le brief, la file de publication et les campagnes ads portent
 * tous cette dimension — sans elle, on ne saurait pas dire ce qui a été
 * publié pour qui, ni sur quel compte un post doit partir.
 *
 * Fichier pur, sans Firebase : lu par les scripts de vérification et par le
 * serveur (routage Blotato) autant que par l'admin.
 */

export type MarketId = "fr" | "en" | "es" | "pt";

export interface Market {
  id: MarketId;
  /** Nom court, tel qu'il s'affiche dans un filtre. */
  label: string;
  /** La langue des textes ET des visuels de ce marché. */
  langue: string;
  drapeau: string;
  /** Locale de l'app / du site (i18n) : fr, en, es, pt. */
  locale: string;
  /**
   * Adresse au lecteur sur Instagram/TikTok. Le brief la rappelle : un
   * « vous » sur un visuel Instagram français l'a déjà rendu inutilisable,
   * et l'espagnol tutoie autant que le français.
   */
  adresse: string;
  /** Devise du prix affiché — jamais de « € » sur un visuel anglophone hors zone euro. */
  devise: string;
  /** Pays visés en priorité par les ads. Indicatif : la config vivante est dans Firestore. */
  pays: string[];
}

export const MARKETS: readonly Market[] = [
  { id: "fr", label: "France", langue: "français", drapeau: "🇫🇷", locale: "fr", adresse: "tu", devise: "€", pays: ["FR", "BE", "CH", "MA"] },
  { id: "en", label: "Anglophone", langue: "anglais", drapeau: "🇬🇧", locale: "en", adresse: "you (direct, casual)", devise: "€ / £ / $ selon le pays", pays: ["GB", "IE", "US", "CA", "AU"] },
  { id: "es", label: "Espagne", langue: "espagnol", drapeau: "🇪🇸", locale: "es", adresse: "tú", devise: "€", pays: ["ES", "MX", "AR", "CO"] },
  { id: "pt", label: "Portugal / Brésil", langue: "portugais", drapeau: "🇵🇹", locale: "pt", adresse: "você", devise: "€ / R$", pays: ["PT", "BR"] },
] as const;

export const MARKET_IDS = MARKETS.map((m) => m.id) as MarketId[];

export const MARKET_META: Record<MarketId, Market> = Object.fromEntries(
  MARKETS.map((m) => [m.id, m])
) as Record<MarketId, Market>;

/**
 * Le marché historique. Tous les posts écrits avant l'ajout du champ sont
 * français : c'est le compte principal et 90 % des clients. Lire « fr » en
 * l'absence du champ évite de réécrire l'historique.
 */
export const MARCHE_DEFAUT: MarketId = "fr";

export const estMarket = (v: unknown): v is MarketId =>
  typeof v === "string" && (MARKET_IDS as string[]).includes(v);

/** Le marché d'un post, `fr` s'il n'en porte pas. */
export const marketOf = (p: { market?: string | null }): MarketId =>
  estMarket(p.market) ? p.market : MARCHE_DEFAUT;
