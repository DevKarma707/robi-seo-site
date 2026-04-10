export const locales = ["fr", "en", "es", "pt-BR", "fr-MA", "es-419", "es-MX", "es-CO"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español (España)",
  "pt-BR": "Português (Brasil)",
  "fr-MA": "Français (Maroc)",
  "es-419": "Español (América Latina)",
  "es-MX": "Español (México)",
  "es-CO": "Español (Colombia)",
};

export const localeFlags: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  es: "🇪🇸",
  "pt-BR": "🇧🇷",
  "fr-MA": "🇲🇦",
  "es-419": "🌎",
  "es-MX": "🇲🇽",
  "es-CO": "🇨🇴",
};

export const localeCurrencies: Record<Locale, { currency: string, symbol: string }> = {
  fr: { currency: "EUR", symbol: "€" },
  en: { currency: "USD", symbol: "$" },
  es: { currency: "EUR", symbol: "€" },
  "pt-BR": { currency: "BRL", symbol: "R$" },
  "fr-MA": { currency: "MAD", symbol: "MAD" },
  "es-419": { currency: "USD", symbol: "$" },
  "es-MX": { currency: "MXN", symbol: "$" },
  "es-CO": { currency: "COP", symbol: "$" },
};

export const priceMap: Record<string, { launch: number, normal: number, monthly: number, yearly: number, biYearly: number }> = {
  fr: { launch: 59, normal: 149, monthly: 14.99, yearly: 89, biYearly: 149 },
  en: { launch: 59, normal: 149, monthly: 14.99, yearly: 89, biYearly: 149 },
  es: { launch: 59, normal: 149, monthly: 14.99, yearly: 89, biYearly: 149 },
  "pt-BR": { launch: 299, normal: 800, monthly: 59.9, yearly: 449, biYearly: 750 },
  "fr-MA": { launch: 599, normal: 1500, monthly: 149, yearly: 890, biYearly: 1490 },
  "es-MX": { launch: 1200, normal: 3000, monthly: 299, yearly: 1800, biYearly: 3000 },
  "es-CO": { launch: 249000, normal: 600000, monthly: 59000, yearly: 379000, biYearly: 600000 },
};
