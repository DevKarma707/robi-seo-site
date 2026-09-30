/**
 * Banc d'essai du héros — **développement uniquement** (`notFound()` en
 * production, absent du sitemap).
 *
 * Rejoue l'accueil avec les mêmes textes et la même offre, mais permet de
 * choisir le visuel du héro : `?v=story` (actuel), `?v=device` (téléphone
 * 3D flottant, démo en verre). Essai du 30/09/2026 pour Ralph, bureau et mobile.
 */
import { notFound } from "next/navigation";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Locale, locales, defaultLocale, localeCurrencies, priceMap } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getHeroStoryCopy } from "@/lib/i18n/heroStory";
import { getHeroDeviceCopy } from "@/lib/i18n/heroDevice";

export const metadata = { robots: { index: false, follow: false } };

const VISUALS = ["story", "device"] as const;
type Visual = (typeof VISUALS)[number];

export default async function HeroLab({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { locale: rawLocale } = await params;
  const { v } = await searchParams;
  const locale: Locale = locales.includes(rawLocale as Locale) ? (rawLocale as Locale) : defaultLocale;
  const visual: Visual = VISUALS.includes(v as Visual) ? (v as Visual) : "device";
  const dict = await getDictionary(locale);
  const currency = (localeCurrencies[locale] || localeCurrencies["fr"]).currency;
  const launch = (priceMap[locale] || priceMap["fr"]).launch;

  return (
    <>
      <Hero
        title={dict.hero.title}
        titleAccent={dict.hero.titleAccent}
        rotatingWords={dict.hero.rotatingWords}
        titleWords={dict.hero.titleWords}
        subtitle={dict.hero.subtitle}
        ctaText={dict.hero.cta}
        ctaHref="https://go.robi-app.com/?signup"
        variant="default"
        visual={visual === "story" ? "editorial" : visual}
        story={getHeroStoryCopy(locale)}
        device={getHeroDeviceCopy(locale)}
        launchOffer={{
          text: dict.pricing?.launchOfferBadge || "OFFRE LIMITEE",
          highlight:
            new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(launch) +
            " — " + (dict.pricing?.launchOfferLifetime || "Accès à vie"),
          seats: {
            locale,
            remainingText: dict.pricing?.launchOfferRemaining || "{remaining} places restantes sur {total}",
            trancheText: dict.pricing?.launchOfferTranche,
            nextText: dict.pricing?.launchOfferNext,
            deadlineText: dict.pricing?.launchOfferDeadline || "jusqu'au {date}",
          },
          lifetimeLabel: dict.pricing?.launchOfferLifetime || "Accès à vie",
        }}
      />
      <Process dict={dict} locale={locale} />
    </>
  );
}
