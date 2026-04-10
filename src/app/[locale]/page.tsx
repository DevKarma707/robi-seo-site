import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Features } from "@/components/sections/Features";
import { Dashboard } from "@/components/sections/Dashboard";
import { QuoteSignature } from "@/components/sections/QuoteSignature";
import { AdminSimplicity } from "@/components/sections/AdminSimplicity";
import { Payments } from "@/components/sections/Payments";
import { Pricing } from "@/components/sections/Pricing";
import { MadeForYou } from "@/components/sections/MadeForYou";
import { Trust } from "@/components/sections/Trust";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { StickyMobileCTA } from "@/components/ui/StickyMobileCTA";
import { Locale, locales, defaultLocale, localeCurrencies, priceMap } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

function getValidLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getValidLocale(rawLocale);
  const dict = await getDictionary(locale);

  const prices = priceMap[locale] || priceMap["fr"];
  const currencyInfo = localeCurrencies[locale] || localeCurrencies["fr"];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Robi AI",
                item: `https://robi-app.com/${locale}`,
              },
            ],
          }),
        }}
      />

      {/* JSON-LD Schema - SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Robi AI",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web, iOS, Android",
            description: dict.meta.description,
            offers: {
              "@type": "Offer",
              price: prices.monthly,
              priceCurrency: currencyInfo.currency,
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "2000",
            },
          }),
        }}
      />

      {/* JSON-LD Schema - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Robi AI",
            url: "https://robi-app.com",
            logo: "https://robi-app.com/logo.png",
            description: dict.meta.description,
            sameAs: [
              "https://instagram.com/robi.ai.app",
              "https://x.com/iamrobiai",
              "https://linkedin.com/company/robi-ai",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "Customer Support",
              availableLanguage: ["fr", "en", "es"],
            },
          }),
        }}
      />

      {/* JSON-LD Schema - FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: dict.faq.q1,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: dict.faq.a1,
                },
              },
              {
                "@type": "Question",
                name: dict.faq.q2,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: dict.faq.a2,
                },
              },
              {
                "@type": "Question",
                name: dict.faq.q3,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: dict.faq.a3,
                },
              },
              {
                "@type": "Question",
                name: dict.faq.q4,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: dict.faq.a4,
                },
              },
              {
                "@type": "Question",
                name: dict.faq.q5,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: dict.faq.a5,
                },
              },
            ],
          }),
        }}
      />

      <Hero
        title={dict.hero.title}
        titleAccent={dict.hero.titleAccent}
        subtitle={dict.hero.subtitle}
        ctaText={dict.hero.cta}
        ctaHref="https://go.robi-app.com"
        secondaryCtaText={dict.hero.secondaryCta}
        secondaryCtaHref="https://go.robi-app.com"
        variant="default"
        socialProof={{
          text: dict.hero.socialProof,
          highlight: dict.hero.socialProofHighlight,
          end: dict.hero.socialProofEnd,
        }}
        launchOffer={{
          text: dict.pricing?.launchOfferBadge || "OFFRE LIMITEE",
          highlight: "59€ — " + (dict.pricing?.launchOfferLifetime || "Acces a vie"),
        }}
      />

      <Process dict={dict} />

      <QuoteSignature dict={dict} />

      <AdminSimplicity dict={dict} />

      <Features
        title={dict.features.title}
        titleAccent={dict.features.titleAccent}
        subtitle={dict.features.titleEnd}
        dict={dict}
      />

      <Dashboard dict={dict} />

      <Payments dict={dict} locale={locale} />

      <Pricing
        title={dict.pricing.title}
        subtitle={dict.pricing.subtitle}
        dict={dict}
        locale={locale}
      />

      <MadeForYou dict={dict} />

      <Trust dict={dict} />

      <FAQ title={dict.faq.title} badge={dict.faq.badge} dict={dict} />

      <CTA
        title={dict.cta.title}
        subtitle={dict.cta.subtitle}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />

      {/* Sticky mobile CTA bar */}
      <StickyMobileCTA text={dict.hero.cta} />
    </>
  );
}
