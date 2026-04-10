import { Locale } from "./config";

const dictionaries: Record<Locale, () => Promise<any>> = {
  fr: () => import("./locales/fr.json").then((module) => module.default),
  en: () => import("./locales/en.json").then((module) => module.default),
  es: () => import("./locales/es.json").then((module) => module.default),
  // Nouveaux marchés - Fichiers dédiés configurés
  "pt-BR": () => import("./locales/pt-BR.json").then((module) => module.default),
  "fr-MA": () => import("./locales/fr-MA.json").then((module) => module.default),
  "es-419": () => import("./locales/es-419.json").then((module) => module.default),
  "es-MX": () => import("./locales/es-MX.json").then((module) => module.default),
  "es-CO": () => import("./locales/es-CO.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};
