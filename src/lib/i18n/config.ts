export const locales = [
  "es-AR",    // Argentine
  "en-AU",    // Australie
  "fr-BE",    // Belgique
  "pt-BR",    // Brésil
  "fr-CA",    // Canada
  "es-CL",    // Chili
  "es-CO",    // Colombie
  "es",       // Espagne
  "fr",       // France
  "fr-MA",    // Maroc
  "es-MX",    // Mexique
  "fr-CH",    // Suisse
  "en",       // Royaume-Uni
  "en-US",    // États-Unis
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const localeNames: Record<Locale, string> = {
  "es-AR": "Argentina",
  "en-AU": "Australia",
  "fr-BE": "Belgique",
  "pt-BR": "Brasil",
  "fr-CA": "Canada",
  "es-CL": "Chile",
  "es-CO": "Colombia",
  es:      "España",
  fr:      "France",
  "fr-MA": "Maroc",
  "es-MX": "México",
  "fr-CH": "Suisse",
  en:      "United Kingdom",
  "en-US": "United States",
};

export const localeFlags: Record<Locale, string> = {
  fr:      "🇫🇷",
  en:      "🇬🇧",
  es:      "🇪🇸",
  "pt-BR": "🇧🇷",
  "fr-MA": "🇲🇦",
  "es-MX": "🇲🇽",
  "es-CO": "🇨🇴",
  "es-CL": "🇨🇱",
  "es-AR": "🇦🇷",
  "en-US": "🇺🇸",
  "en-AU": "🇦🇺",
  "fr-BE": "🇧🇪",
  "fr-CH": "🇨🇭",
  "fr-CA": "🇨🇦",
};

export const localeCurrencies: Record<Locale, { currency: string; symbol: string }> = {
  fr:      { currency: "EUR", symbol: "€" },
  en:      { currency: "GBP", symbol: "£" },
  es:      { currency: "EUR", symbol: "€" },
  "pt-BR": { currency: "BRL", symbol: "R$" },
  "fr-MA": { currency: "MAD", symbol: "MAD" },
  "es-MX": { currency: "MXN", symbol: "$" },
  "es-CO": { currency: "COP", symbol: "$" },
  "es-CL": { currency: "CLP", symbol: "$" },
  "es-AR": { currency: "ARS", symbol: "$" },
  "en-US": { currency: "USD", symbol: "$" },
  "en-AU": { currency: "AUD", symbol: "A$" },
  "fr-BE": { currency: "EUR", symbol: "€" },
  "fr-CH": { currency: "CHF", symbol: "CHF" },
  "fr-CA": { currency: "CAD", symbol: "CA$" },
};

export const priceMap: Record<string, { launch: number; normal: number; monthly: number; yearly: number; biYearly: number }> = {
  // Zone Euro
  fr:      { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
  es:      { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
  "fr-BE": { launch: 59,      normal: 149,    monthly: 14,    yearly: 89,     biYearly: 149 },
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
  // Réal brésilien
  "pt-BR": { launch: 299,     normal: 800,    monthly: 59,    yearly: 449,    biYearly: 750 },
  // Dirham marocain
  "fr-MA": { launch: 599,     normal: 1500,   monthly: 149,   yearly: 890,    biYearly: 1490 },
  // Peso mexicain
  "es-MX": { launch: 1200,    normal: 3000,   monthly: 299,   yearly: 1800,   biYearly: 3000 },
  // Peso colombien
  "es-CO": { launch: 249000,  normal: 600000, monthly: 59000, yearly: 379000, biYearly: 600000 },
  // Peso chilien
  "es-CL": { launch: 59000,   normal: 149000, monthly: 14900, yearly: 89000,  biYearly: 149000 },
  // Peso argentin
  "es-AR": { launch: 59000,   normal: 149000, monthly: 14900, yearly: 89000,  biYearly: 149000 },
};
