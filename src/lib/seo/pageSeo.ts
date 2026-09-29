import type { Metadata } from "next";
import { locales, indexableContentLocales, isContentIndexable } from "@/lib/i18n/config";

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
 */
export function pageSeo(
  locale: string,
  path: string,
  scope: "content" | "regional" = "content",
): Pick<Metadata, "alternates" | "robots"> {
  const set = scope === "regional" ? locales : indexableContentLocales;
  const indexable = scope === "regional" || isContentIndexable(locale);
  return {
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        ...Object.fromEntries(set.map((l) => [l, `/${l}${path}`])),
        "x-default": `/fr${path}`,
      },
    },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
  };
}
