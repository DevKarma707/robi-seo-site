import { Locale } from "./config";
import { regionalOverrides } from "./regionalOverrides";
import { getMarketCopy } from "@/lib/seo/marketCopy";

const dictionaries: Record<string, () => Promise<any>> = {
  // Fichiers dédiés
  fr:      () => import("./locales/fr.json").then((m) => m.default),
  en:      () => import("./locales/en.json").then((m) => m.default),
  es:      () => import("./locales/es.json").then((m) => m.default),
  "fr-MA": () => import("./locales/fr-MA.json").then((m) => m.default),
  // LATAM — fichiers dédiés (masqués mais conservés)
  "pt-BR": () => import("./locales/pt-BR.json").then((m) => m.default),
  "es-MX": () => import("./locales/es-MX.json").then((m) => m.default),
  "es-CO": () => import("./locales/es-CO.json").then((m) => m.default),
  "es-CL": () => import("./locales/es.json").then((m) => m.default),
  "es-AR": () => import("./locales/es.json").then((m) => m.default),
  // Locales qui réutilisent les fichiers existants
  "en-US": () => import("./locales/en.json").then((m) => m.default),   // USA → anglais
  "en-AU": () => import("./locales/en.json").then((m) => m.default),   // Australie → anglais
  "en-IE": () => import("./locales/en.json").then((m) => m.default),   // Irlande → anglais
  "en-NL": () => import("./locales/en.json").then((m) => m.default),   // Pays-Bas → anglais
  "en-AE": () => import("./locales/en.json").then((m) => m.default),   // Émirats → anglais
  "pt-PT": () => import("./locales/pt-PT.json").then((m) => m.default), // Portugal → portugais européen (25/10/2026)
  "fr-BE": () => import("./locales/fr.json").then((m) => m.default),   // Belgique → français
  "fr-CH": () => import("./locales/fr.json").then((m) => m.default),   // Suisse → français
  "fr-CA": () => import("./locales/fr.json").then((m) => m.default),   // Canada → français
  "fr-LU": () => import("./locales/fr.json").then((m) => m.default),   // Luxembourg → français
  "fr-SN": () => import("./locales/fr.json").then((m) => m.default),   // Sénégal → français
  "fr-CI": () => import("./locales/fr.json").then((m) => m.default),   // Côte d'Ivoire → français
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

/**
 * Titre/description du marché (lib/seo/marketCopy) et retouches de FAQ par
 * pays (regionalOverrides) par-dessus le fichier de langue.
 */
function localize(dict: any, locale: string) {
  const market = getMarketCopy(locale);
  const withOverrides = regionalOverrides[locale] ? deepMerge(dict, regionalOverrides[locale]) : dict;
  return { ...withOverrides, meta: { ...withOverrides.meta, title: market.homeTitle, description: market.homeDescription } };
}

export const getDictionary = async (locale: Locale) => localize(await loadDictionary(locale), locale);

const loadDictionary = async (locale: Locale) => {
  const dict = await dictionaries[locale]();
  if (locale === "fr") return dict;

  // Choisir la langue de fallback selon la locale
  const frLocales = ["fr-MA", "fr-BE", "fr-CH", "fr-CA", "fr-LU", "fr-SN", "fr-CI"];
  const enLocales = ["en-US", "en-AU", "en-IE", "en-NL", "en-AE"];
  const ptLocales = ["pt-BR", "pt-PT"];

  let fallbackLocale: Locale = "fr";
  if (enLocales.includes(locale)) fallbackLocale = "en";
  else if (ptLocales.includes(locale)) fallbackLocale = "en";
  else if (frLocales.includes(locale)) fallbackLocale = "fr";

  const fallbackDict = await dictionaries[fallbackLocale]();
  return deepMerge(fallbackDict, dict);
};
