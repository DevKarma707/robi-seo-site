import { Metadata } from "next";
import { notFound } from "next/navigation";
import { comparisons, t } from "@/data/seo-config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTA } from "@/components/sections/CTA";
import { Check, X, Minus } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  Locale,
  isContentIndexable,
  priceMap,
  localeCurrencies,
} from "@/lib/i18n/config";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export async function generateStaticParams() {
  return comparisons.map((comparison) => ({
    slug: comparison.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const comparison = comparisons.find((c) => c.slug === slug);

  if (!comparison) {
    return { title: "Comparison not found" };
  }

  return {
    title: t(comparison.title, locale as Locale),
    description: t(comparison.description, locale as Locale),
    keywords: comparison.keywords,
    alternates: {
      canonical: `https://robi-app.com/${locale}/comparisons/${slug}`,
    },
    robots: isContentIndexable(locale) ? undefined : { index: false, follow: true },
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const comparison = comparisons.find((c) => c.slug === slug);

  if (!comparison) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);
  const comp = dict.pages.comparisons;

  const prices = priceMap[locale] || priceMap["fr"];
  const currencyInfo = localeCurrencies[locale] || localeCurrencies["fr"];
  const robiPrice = `${prices.monthly}${currencyInfo.symbol}`;

  // Default competitor column, overridden per-competitor by `comparison.matrix`
  // in seo-config.ts (a competitor with no override keeps these defaults).
  const defaultMatrix: Record<string, boolean | "partial"> = {
    invoiceCreation: true,
    quoteCreation: true,
    aiInvoicing: false,
    autoReminders: "partial",
    stripePaypal: "partial",
    mobileApp: "partial",
    localSupport: true,
    customTemplates: true,
    accountingExport: true,
    aiDashboards: false,
  };
  const matrix = { ...defaultMatrix, ...(comparison.matrix ?? {}) };

  const featureLabels = comp.comparisonFeatures as Record<string, string>;
  const comparisonFeatures = Object.keys(defaultMatrix).map((key) => ({
    name: featureLabels[key],
    robi: true,
    competitor: matrix[key],
  }));

  const pricing = comparison.pricing;
  const competitorPriceLabel = pricing
    ? t(pricing.label, locale as Locale)
    : null;
  const competitorPriceNote = pricing ? t(pricing.note, locale as Locale) : null;

  const fill = (s: string) =>
    s
      .replace("{competitor}", comparison.competitor)
      .replace("{robiPrice}", robiPrice)
      .replace("{competitorPricing}", competitorPriceNote ?? "")
      .replace("{date}", pricing?.checkedAt ?? "")
      .trim();

  const faqItems = [
    { q: fill(comp.faq.q1), a: fill(comp.faq.a1) },
    { q: fill(comp.faq.q2), a: fill(comp.faq.a2) },
    { q: fill(comp.faq.q3), a: fill(comp.faq.a3) },
    { q: fill(comp.faq.q4), a: fill(comp.faq.a4) },
  ];

  const pageUrl = `https://robi-app.com/${locale}/comparisons/${slug}`;

  return (
    <>
      {/* JSON-LD — Robi AI as SoftwareApplication, with its price */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Robi AI",
            applicationCategory: "BusinessApplication",
            applicationSubCategory: "Invoicing Software",
            operatingSystem: "Web, iOS, Android",
            url: "https://robi-app.com",
            description: t(comparison.description, locale as Locale),
            offers: {
              "@type": "Offer",
              price: prices.monthly,
              priceCurrency: currencyInfo.currency,
              priceValidUntil: "2026-12-31",
              availability: "https://schema.org/InStock",
              url: `https://robi-app.com/${locale}/pricing`,
            },
            // Pas d'aggregateRating : Google exige des avis réellement
            // collectés et affichés sur la page. À rétablir quand un vrai
            // système d'avis alimentera ces chiffres.
          }),
        }}
      />

      {/* JSON-LD — the competitor as SoftwareApplication, with its price */}
      {pricing && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: comparison.competitor,
              applicationCategory: "BusinessApplication",
              applicationSubCategory: "Invoicing Software",
              operatingSystem: "Web",
              ...(comparison.url ? { url: comparison.url } : {}),
              offers: {
                "@type": "Offer",
                price: pricing.price,
                priceCurrency: pricing.currency,
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
      )}

      {/* JSON-LD — FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      {/* JSON-LD — BreadcrumbList */}
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
              {
                "@type": "ListItem",
                position: 2,
                name: comp.badge,
                item: `https://robi-app.com/${locale}/comparisons`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: `Robi AI vs ${comparison.competitor}`,
                item: pageUrl,
              },
            ],
          }),
        }}
      />
      <Hero
        badge={comp.badge}
        title={`Robi AI vs ${comparison.competitor}`}
        subtitle={t(comparison.description, locale as Locale)}
        variant="centered"
      />

      {/* Comparison Table */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              {comp.detailedComparison}
            </h2>
            <p className="text-gray-500 mt-4">
              {comp.discoverDifferences.replace("{competitor}", comparison.competitor)}
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="rounded-3xl overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="grid grid-cols-3 bg-gray-100 text-gray-900 p-6">
                <div className="font-bold">{comp.feature}</div>
                <div className="text-center font-bold">
                  <span className="text-[#BEF221]">Robi AI</span>
                </div>
                <div className="text-center font-bold">{comparison.competitor}</div>
              </div>

              {/* Rows */}
              {comparisonFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-3 p-6 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="font-medium text-gray-900">{feature.name}</div>
                  <div className="flex justify-center">
                    {feature.robi ? (
                      <div className="w-8 h-8 rounded-full bg-[#BEF221] flex items-center justify-center">
                        <Check className="w-5 h-5 text-[#0D0630]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                        <X className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {feature.competitor === true ? (
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-400" />
                      </div>
                    ) : feature.competitor === "partial" ? (
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Minus className="w-5 h-5 text-yellow-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                        <X className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Legend */}
          <div className="flex justify-center gap-8 mt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#BEF221] flex items-center justify-center">
                <Check className="w-4 h-4 text-[#0D0630]" />
              </div>
              {comp.included}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Minus className="w-4 h-4 text-yellow-400" />
              </div>
              {comp.partial}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="w-4 h-4 text-red-400" />
              </div>
              {comp.notIncluded}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing comparison */}
      {pricing && (
        <section className="py-24 bg-gray-50 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                {fill(comp.pricingTitle)}
              </h2>
              <p className="text-gray-500 mt-4">{fill(comp.pricingSubtitle)}</p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ScrollReveal delay={0}>
                <Card className="h-full text-center">
                  <div className="text-lg font-bold text-gray-900 mb-2">
                    Robi AI
                  </div>
                  <div className="text-4xl font-black text-gray-900">
                    {robiPrice}
                    <span className="text-lg font-medium text-gray-500">
                      {comp.perMonth}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-4">{comp.robiPriceNote}</p>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <Card className="h-full text-center">
                  <div className="text-lg font-bold text-gray-900 mb-2">
                    {comparison.competitor}
                  </div>
                  <div className="text-4xl font-black text-gray-900">
                    {pricing.price === 0 ? comp.freeLabel : `${pricing.price}€`}
                    {pricing.price !== 0 && (
                      <span className="text-lg font-medium text-gray-500">
                        {comp.perMonth}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 mt-4">{competitorPriceLabel}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {competitorPriceNote}
                  </p>
                </Card>
              </ScrollReveal>
            </div>

            <ScrollReveal>
              <div className="mt-12 rounded-3xl border border-gray-200 bg-white p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {comp.verdictTitle}
                </h3>
                <p className="text-gray-500">{fill(comp.verdictBody)}</p>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Why Choose Robi */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <Badge variant="accent" className="mb-4">
              {comp.exclusiveAdvantages}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              {comp.whyChoose}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0}>
              <Card className="h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {comp.conversationalAI}
                </h3>
                <p className="text-gray-500">
                  {comp.conversationalAIDesc}
                </p>
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <Card className="h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {comp.smartReminders}
                </h3>
                <p className="text-gray-500">
                  {comp.smartRemindersDesc}
                </p>
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <Card variant="dark" className="h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {comp.realTimeSaving}
                </h3>
                <p className="text-gray-600">
                  {comp.realTimeSavingDesc}
                </p>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ — mirrors the FAQPage JSON-LD above */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              {comp.faqTitle}
            </h2>
          </ScrollReveal>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <ScrollReveal key={index} delay={index * 50}>
                <details className="group rounded-2xl border border-gray-200 bg-white p-6">
                  <summary className="cursor-pointer list-none font-bold text-gray-900">
                    {item.q}
                  </summary>
                  <p className="text-gray-500 mt-4">{item.a}</p>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <CTA
        title={comp.switchFrom.replace("{competitor}", comparison.competitor)}
        subtitle={comp.freeMigration}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
