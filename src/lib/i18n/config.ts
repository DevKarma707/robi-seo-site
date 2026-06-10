// === Locales actives sur le site (routes, sitemap, sélecteur) ===
export const locales = [
  "en",       // Royaume-Uni
  "en-AE",    // Émirats Arabes Unis
  "en-AU",    // Australie
  "en-IE",    // Irlande
  "en-NL",    // Pays-Bas
  "en-US",    // États-Unis
  "es",       // Espagne
  "fr",       // France
  "fr-BE",    // Belgique
  "fr-CA",    // Canada
  "fr-CH",    // Suisse
  "fr-CI",    // Côte d'Ivoire
  "fr-LU",    // Luxembourg
  "fr-MA",    // Maroc
  "fr-SN",    // Sénégal
  "pt-PT",    // Portugal
] as const;

// === Locales masquées (LATAM niveau 2 — e-invoicing obligatoire) ===
// Tout est conservé (config, prix, dictionnaires, fichiers JSON).
// Pour réactiver : déplacer la locale de hiddenLocales vers locales.
export const hiddenLocales = [
  "pt-BR",    // Brésil — NFS-e municipale
  "es-MX",    // Mexique — CFDI 4.0
  "es-CO",    // Colombie — DIAN
  "es-CL",    // Chili — SII
  "es-AR",    // Argentine — AFIP
] as const;

export type Locale = (typeof locales)[number];
// Type élargi qui inclut aussi les locales masquées (pour les dicts/prix)
export type AnyLocale = Locale | (typeof hiddenLocales)[number];

export const defaultLocale: Locale = "fr";

// Langues où le contenu éditorial existe vraiment (FR/EN/ES). Les pages de
// niche templatisées (industries, features, comparisons) ne sont indexées que
// dans ces langues — les variantes des 13 autres locales sont en noindex pour
// éviter le contenu mince dupliqué ("Explorée, actuellement non indexée").
export const indexableContentLocales: string[] = ["fr", "en", "es"];
export const isContentIndexable = (locale: string) =>
  indexableContentLocales.includes(locale);

export const localeNames: Record<string, string> = {
  en:      "United Kingdom",
  "en-AE": "Emirates",
  "en-AU": "Australia",
  "en-IE": "Ireland",
  "en-NL": "Netherlands",
  "en-US": "United States",
  es:      "España",
  fr:      "France",
  "fr-BE": "Belgique",
  "fr-CA": "Canada",
  "fr-CH": "Suisse",
  "fr-CI": "Côte d'Ivoire",
  "fr-LU": "Luxembourg",
  "fr-MA": "Maroc",
  "fr-SN": "Sénégal",
  "pt-PT": "Portugal",
};

export const localeFlags: Record<string, string> = {
  en:      "🇬🇧",
  "en-AE": "🇦🇪",
  "en-AU": "🇦🇺",
  "en-IE": "🇮🇪",
  "en-NL": "🇳🇱",
  "en-US": "🇺🇸",
  es:      "🇪🇸",
  fr:      "🇫🇷",
  "fr-BE": "🇧🇪",
  "fr-CA": "🇨🇦",
  "fr-CH": "🇨🇭",
  "fr-CI": "🇨🇮",
  "fr-LU": "🇱🇺",
  "fr-MA": "🇲🇦",
  "fr-SN": "🇸🇳",
  "pt-PT": "🇵🇹",
};

export const localeCurrencies: Record<string, { currency: string; symbol: string }> = {
  // Zone Euro
  fr:      { currency: "EUR", symbol: "€" },
  es:      { currency: "EUR", symbol: "€" },
  "fr-BE": { currency: "EUR", symbol: "€" },
  "en-IE": { currency: "EUR", symbol: "€" },
  "fr-LU": { currency: "EUR", symbol: "€" },
  "en-NL": { currency: "EUR", symbol: "€" },
  "pt-PT": { currency: "EUR", symbol: "€" },
  // Livres sterling
  en:      { currency: "GBP", symbol: "£" },
  // Dollars US
  "en-US": { currency: "USD", symbol: "$" },
  // Dollars australiens
  "en-AU": { currency: "AUD", symbol: "A$" },
  // Francs suisses
  "fr-CH": { currency: "CHF", symbol: "CHF" },
  // Dollars canadiens
  "fr-CA": { currency: "CAD", symbol: "CA$" },
  // Dirham marocain
  "fr-MA": { currency: "MAD", symbol: "MAD" },
  // Dirham émirati
  "en-AE": { currency: "AED", symbol: "AED" },
  // Franc CFA (BCEAO)
  "fr-SN": { currency: "XOF", symbol: "CFA" },
  "fr-CI": { currency: "XOF", symbol: "CFA" },
};

export const priceMap: Record<string, { launch: number; normal: number; monthly: number; yearly: number; biYearly: number }> = {
  // Zone Euro
  fr:      { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
  es:      { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
  "fr-BE": { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
  "en-IE": { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
  "fr-LU": { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
  "en-NL": { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
  "pt-PT": { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
  // Livres sterling
  en:      { launch: 49,      normal: 129,    monthly: 12,    yearly: 75,     biYearly: 125 },
  // Dollars US
  "en-US": { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
  // Dollars australiens
  "en-AU": { launch: 99,      normal: 249,    monthly: 22,    yearly: 139,    biYearly: 229 },
  // Francs suisses
  "fr-CH": { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
  // Dollars canadiens
  "fr-CA": { launch: 89,      normal: 199,    monthly: 19,    yearly: 119,    biYearly: 199 },
  // Dirham marocain
  "fr-MA": { launch: 599,     normal: 1500,   monthly: 149,   yearly: 890,    biYearly: 1490 },
  // Dirham émirati
  "en-AE": { launch: 229,     normal: 549,    monthly: 49,    yearly: 329,    biYearly: 549 },
  // Franc CFA — Sénégal & Côte d'Ivoire
  "fr-SN": { launch: 29000,   normal: 75000,  monthly: 7500,  yearly: 45000,  biYearly: 75000 },
  "fr-CI": { launch: 29000,   normal: 75000,  monthly: 7500,  yearly: 45000,  biYearly: 75000 },
};
