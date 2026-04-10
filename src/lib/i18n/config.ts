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
