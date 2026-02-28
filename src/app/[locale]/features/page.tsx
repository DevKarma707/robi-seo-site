import { Metadata } from "next";
import Link from "next/link";
import { features, t } from "@/data/seo-config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
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

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = featureIcons[feature.slug as keyof typeof featureIcons] || Bot;
              const isLarge = index === 0 || index === features.length - 1;

              return (
                <Link
                  key={feature.slug}
                  href={`/${locale}/features/${feature.slug}`}
                  className={isLarge ? "md:col-span-2" : ""}
                >
                  <Card
                    variant={index === 0 ? "dark" : "default"}
                    className={`h-full group cursor-pointer ${isLarge ? "md:flex md:items-center md:gap-12" : ""}`}
                  >
                    <div className={`${isLarge ? "md:w-1/3" : ""}`}>
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                          index === 0
                            ? "bg-[#BEF221]/20 border border-[#BEF221]/30"
                            : "bg-[#BEF221]/10 border border-[#BEF221]/20"
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 ${index === 0 ? "text-[#BEF221]" : "text-[#BEF221]"}`}
                        />
                      </div>
                    </div>
                    <div className={`${isLarge ? "md:w-2/3" : ""}`}>
                      <div className="flex items-start justify-between mb-4">
                        <h3
                          className={`text-2xl font-bold group-hover:text-[#BEF221] transition-colors ${
                            index === 0 ? "text-gray-900" : "text-gray-900"
                          }`}
                        >
                          {t(feature.name, locale)}
                        </h3>
                        <ArrowRight
                          className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${
                            index === 0 ? "text-[#BEF221]" : "text-[#BEF221]"
                          }`}
                        />
                      </div>
                      <p className={index === 0 ? "text-gray-500" : "text-gray-500"}>
                        {t(feature.description, locale)}
                      </p>
                    </div>
                  </Card>
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
