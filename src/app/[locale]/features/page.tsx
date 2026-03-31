import { Metadata } from "next";
import Link from "next/link";
import { features, t } from "@/data/seo-config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { CTA } from "@/components/sections/CTA";
import { ArrowRight, Bot, Zap, Bell, CreditCard, BarChart3 } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return {
    title: `${dict.nav.features} | Robi AI`,
    description: dict.meta.description,
    keywords: ["fonctionnalités robi", "facturation ia", "logiciel facturation features"],
  };
}

const featureIcons = {
  "facturation-ia": Bot,
  "devis-automatique": Zap,
  "relance-automatique": Bell,
  "paiement-en-ligne": CreditCard,
  "tableau-de-bord": BarChart3,
};

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return (
    <>
      {/* JSON-LD for BreadcrumbList */}
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
                name: "Home",
                item: `https://robi-app.com/${locale}`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: dict.nav.features,
                item: `https://robi-app.com/${locale}/features`,
              },
            ],
          }),
        }}
      />

      <Hero
        badge={dict.nav.features}
        title={dict.features.title}
        titleAccent={dict.features.titleAccent}
        subtitle=""
        ctaText=""
        variant="centered"
      />

      <section className="py-20 bg-[#0D0630]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* First row - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {features.slice(0, 3).map((feature) => {
              const Icon = featureIcons[feature.slug as keyof typeof featureIcons] || Bot;
              return (
                <Link
                  key={feature.slug}
                  href={`/${locale}/features/${feature.slug}`}
                  className="group"
                >
                  <div className="h-full rounded-2xl p-7 bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-[#BEF221]/40 hover:bg-white/10 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#BEF221]/10 border border-[#BEF221]/20 group-hover:bg-[#BEF221]/20 transition-colors">
                      <Icon className="w-6 h-6 text-[#BEF221]" />
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-[#BEF221] transition-colors">
                        {t(feature.name, locale)}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-[#BEF221] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {t(feature.description, locale)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          {/* Second row - 2 cards centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[calc(66.666%+0.75rem)] mx-auto">
            {features.slice(3).map((feature) => {
              const Icon = featureIcons[feature.slug as keyof typeof featureIcons] || Bot;
              return (
                <Link
                  key={feature.slug}
                  href={`/${locale}/features/${feature.slug}`}
                  className="group"
                >
                  <div className="h-full rounded-2xl p-7 bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-[#BEF221]/40 hover:bg-white/10 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#BEF221]/10 border border-[#BEF221]/20 group-hover:bg-[#BEF221]/20 transition-colors">
                      <Icon className="w-6 h-6 text-[#BEF221]" />
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-[#BEF221] transition-colors">
                        {t(feature.name, locale)}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-[#BEF221] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {t(feature.description, locale)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <CTA
        title={dict.cta.title}
        subtitle={dict.cta.subtitle}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
