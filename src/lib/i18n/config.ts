// === Locales actives sur le site (routes, sitemap, sélecteur) ===
export const locales = [
  "en-AE",    // Émirats Arabes Unis
  "en-AU",    // Australie
  "fr-BE",    // Belgique
  "fr-CA",    // Canada
  "fr-CI",    // Côte d'Ivoire
  "es",       // Espagne
  "en-US",    // États-Unis
  "fr",       // France
  "en-IE",    // Irlande
  "fr-LU",    // Luxembourg
  "fr-MA",    // Maroc
  "en-NL",    // Pays-Bas
  "pt-PT",    // Portugal
  "en",       // Royaume-Uni
  "fr-SN",    // Sénégal
  "fr-CH",    // Suisse
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

export const localeNames: Record<string, string> = {
  "en-AE": "Emirates",
  "en-AU": "Australia",
  "fr-BE": "Belgique",
  "fr-CA": "Canada",
  "fr-CI": "Côte d'Ivoire",
  es:      "España",
  "en-US": "United States",
  fr:      "France",
  "en-IE": "Ireland",
  "fr-LU": "Luxembourg",
  "fr-MA": "Maroc",
  "en-NL": "Netherlands",
  "pt-PT": "Portugal",
  en:      "United Kingdom",
  "fr-SN": "Sénégal",
  "fr-CH": "Suisse",
  // Masqués (conservés)
  "pt-BR": "Brasil",
  "es-MX": "México",
  "es-CO": "Colombia",
  "es-CL": "Chile",
  "es-AR": "Argentina",
};

export const localeFlags: Record<string, string> = {
  "en-AE": "🇦🇪",
  "en-AU": "🇦🇺",
  "fr-BE": "🇧🇪",
  "fr-CA": "🇨🇦",
  "fr-CI": "🇨🇮",
  es:      "🇪🇸",
  "en-US": "🇺🇸",
  fr:      "🇫🇷",
  "en-IE": "🇮🇪",
  "fr-LU": "🇱🇺",
  "fr-MA": "🇲🇦",
  "en-NL": "🇳🇱",
  "pt-PT": "🇵🇹",
  en:      "🇬🇧",
  "fr-SN": "🇸🇳",
  "fr-CH": "🇨🇭",
  // Masqués
  "pt-BR": "🇧🇷",
  "es-MX": "🇲🇽",
  "es-CO": "🇨🇴",
  "es-CL": "🇨🇱",
  "es-AR": "🇦🇷",
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
  // --- Masqués (LATAM) ---
  "pt-BR": { currency: "BRL", symbol: "R$" },
  "es-MX": { currency: "MXN", symbol: "$" },
  "es-CO": { currency: "COP", symbol: "$" },
  "es-CL": { currency: "CLP", symbol: "$" },
  "es-AR": { currency: "ARS", symbol: "$" },
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
  // --- Masqués (LATAM) ---
  "pt-BR": { launch: 299,     normal: 800,    monthly: 59,    yearly: 449,    biYearly: 750 },
  "es-MX": { launch: 1200,    normal: 3000,   monthly: 299,   yearly: 1800,   biYearly: 3000 },
  "es-CO": { launch: 249000,  normal: 600000, monthly: 59000, yearly: 379000, biYearly: 600000 },
  "es-CL": { launch: 59000,   normal: 149000, monthly: 14900, yearly: 89000,  biYearly: 149000 },
  "es-AR": { launch: 59000,   normal: 149000, monthly: 14900, yearly: 89000,  biYearly: 149000 },
};
