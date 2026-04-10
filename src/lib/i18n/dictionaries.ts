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

// Deep merge utility to prevent undefined UI errors
function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
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
  
  // Safe dict: always merge missing keys from 'en' or 'fr'
  const fallbackLocale = locale === "pt-BR" ? "en" : "fr";
  const fallbackDict = await dictionaries[fallbackLocale]();
  
  // The locale dict overrides the fallback dict
  return deepMerge(fallbackDict, dict);
};
