import type { Metadata } from "next";
import { locales, indexableContentLocales, isContentIndexable } from "@/lib/i18n/config";
import { localePath } from "@/lib/seo/localizedPaths";

/**
 * Adresse officielle (canonical), versions linguistiques (hreflang) et
 * indexation d'une page — une seule règle pour tout le site.
 *
 * Avant le 29/09/2026, le layout posait `canonical: /{locale}` sur TOUTES les
 * pages qui ne le redéfinissaient pas : 165 pages FR/EN/ES (les 117 métiers,
 * fonctionnalités, outils, tarifs, blog, légal) déclaraient l'accueil comme
 * version officielle, et Google les écartait comme doublons. Les hreflang
 * pointaient aussi tous vers les accueils.
 *
 * - `content` (défaut) : le texte n'existe qu'en FR/EN/ES. Ces trois versions
 *   sont indexables et se citent entre elles ; les variantes régionales
 *   (fr-BE, en-US…) répètent le même texte → noindex, follow.
 * - `regional` : la page change vraiment selon le marché (accueil, tarifs en
 *   devise locale) → toutes les locales sont indexables et se citent.
 * - `fr-only` : page écrite pour la France seule (modèle de devis
 *   auto-entrepreneur…) → indexable en `fr` uniquement, sans hreflang.
 *
 * `path` est la route interne (slug français) : l'adresse publique de chaque
 * langue vient de lib/seo/localizedPaths (« /facture-ai » → « /en/ai-invoice-generator »).
 */
export function pageSeo(
  locale: string,
  path: string,
  scope: "content" | "regional" | "fr-only" = "content",
): Pick<Metadata, "alternates" | "robots"> {
  if (scope === "fr-only") {
    return {
      alternates: { canonical: `/fr${path}`, languages: { fr: `/fr${path}`, "x-default": `/fr${path}` } },
      ...(locale === "fr" ? {} : { robots: { index: false, follow: true } }),
    };
  }
  const set = scope === "regional" ? locales : indexableContentLocales;
  const indexable = scope === "regional" || isContentIndexable(locale);
  return {
    alternates: {
      canonical: localePath(locale, path),
      languages: {
        ...Object.fromEntries(set.map((l) => [l, localePath(l, path)])),
        "x-default": localePath("fr", path),
      },
    },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
  };
}
