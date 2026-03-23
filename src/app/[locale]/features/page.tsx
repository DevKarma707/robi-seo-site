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
                item: `https://robi.ai/${locale}`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: dict.nav.features,
                item: `https://robi.ai/${locale}/features`,
              },
            ],
          }),
        }}
      />

      <Hero
        badge={dict.nav.features}
        title={dict.features.title}
        titleAccent={dict.features.titleAccent}
        subtitle={dict.features.titleEnd}
        variant="centered"
      />

      <section className="py-24 bg-[#0D0630]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = featureIcons[feature.slug as keyof typeof featureIcons] || Bot;

              return (
                <Link
                  key={feature.slug}
                  href={`/${locale}/features/${feature.slug}`}
                  className="group"
                >
                  <div className="h-full rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-[#BEF221]/40 hover:bg-white/10 hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-[#BEF221]/10 border border-[#BEF221]/20 group-hover:bg-[#BEF221]/20 transition-colors">
                      <Icon className="w-7 h-7 text-[#BEF221]" />
                    </div>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-[#BEF221] transition-colors">
                        {t(feature.name, locale)}
                      </h3>
                      <ArrowRight className="w-5 h-5 text-[#BEF221] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </div>
                    <p className="text-white/60 leading-relaxed">
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
