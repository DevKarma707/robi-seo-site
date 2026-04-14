import { Locale } from "./config";

const dictionaries: Record<Locale, () => Promise<any>> = {
  // Fichiers dédiés
  fr:      () => import("./locales/fr.json").then((m) => m.default),
  en:      () => import("./locales/en.json").then((m) => m.default),
  es:      () => import("./locales/es.json").then((m) => m.default),
  "pt-BR": () => import("./locales/pt-BR.json").then((m) => m.default),
  "fr-MA": () => import("./locales/fr-MA.json").then((m) => m.default),
  "es-MX": () => import("./locales/es-MX.json").then((m) => m.default),
  "es-CO": () => import("./locales/es-CO.json").then((m) => m.default),
  // Nouvelles locales — réutilisent les fichiers de base
  "es-CL": () => import("./locales/es.json").then((m) => m.default),   // Chili → espagnol
  "es-AR": () => import("./locales/es.json").then((m) => m.default),   // Argentine → espagnol
  "en-US": () => import("./locales/en.json").then((m) => m.default),   // USA → anglais
  "en-AU": () => import("./locales/en.json").then((m) => m.default),   // Australie → anglais
  "fr-BE": () => import("./locales/fr.json").then((m) => m.default),   // Belgique → français
  "fr-CH": () => import("./locales/fr.json").then((m) => m.default),   // Suisse → français
  "fr-CA": () => import("./locales/fr.json").then((m) => m.default),   // Canada → français
};

// Deep merge utility to prevent undefined UI errors
function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}

function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

export const getDictionary = async (locale: Locale) => {
  const dict = await dictionaries[locale]();
  if (locale === "fr") return dict;

  // Choisir la langue de fallback selon la locale
  const frLocales = ["fr-MA", "fr-BE", "fr-CH", "fr-CA"];
  const enLocales = ["en-US", "en-AU"];
  const ptLocales = ["pt-BR"];

  let fallbackLocale: Locale = "fr";
  if (enLocales.includes(locale)) fallbackLocale = "en";
  else if (ptLocales.includes(locale)) fallbackLocale = "en";
  else if (frLocales.includes(locale)) fallbackLocale = "fr";
  // es, es-MX, es-CO, es-CL, es-AR → fallback "fr" (merge complète)

  const fallbackDict = await dictionaries[fallbackLocale]();
  return deepMerge(fallbackDict, dict);
};
