import { Metadata } from "next";
import Link from "next/link";
import { industries, industryCategories, t } from "@/data/seo-config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";
import { ArrowRight, Hammer, Code, Palette, PartyPopper, Briefcase, Heart } from "lucide-react";

import { pageSeo } from "@/lib/seo/pageSeo";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return {
    ...pageSeo(locale, "/industries"),
    title: dict.pages.industries.title,
    description: dict.pages.industries.description,
    keywords: [
      "facturation par métier",
      "logiciel facturation artisan",
      "facturation freelance",
    ],
  };
}

const categoryIcons: Record<string, any> = {
  btp: Hammer,
  tech: Code,
  creatif: Palette,
  evenementiel: PartyPopper,
  conseil: Briefcase,
  sante: Heart,
};

export default async function IndustriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const ind = dict.pages.industries;

  // Group industries by category
  const industriesByCategory = industryCategories.map((category) => ({
    ...category,
    industries: industries.filter((i) => i.category === category.id),
  }));

  return (
    <>
      <Hero
        badge={ind.heroBadge}
        title={ind.heroTitle}
        titleAccent={ind.heroTitleAccent}
        subtitle={ind.heroSubtitle}
        variant="centered"
      />

      <section className="py-16 md:py-24 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {industriesByCategory.map((category) => {
            const Icon = categoryIcons[category.id] || Briefcase;
            return (
              <div key={category.id} className="mb-16 last:mb-0">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#0D0630] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#BEF221]" />
                  </div>
                  <h2 className="text-[28px] md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] [text-wrap:balance] text-[#0D0630]">
                    {t(category.name, locale)}
                  </h2>
                  <span className="text-sm text-gray-400 ml-2">
                    {category.industries.length} {ind.professions}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.industries.map((industry) => (
                    <Link key={industry.slug} href={`/${locale}/industries/${industry.slug}`}>
                      <Card className="h-full group cursor-pointer hover:border-[#BEF221] transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-900">
                            {t(industry.name, locale)}
                          </h3>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#BEF221] transition-colors flex-shrink-0" />
                        </div>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                          {t(industry.heroTitle, locale)}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {industry.features.slice(0, 2).map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-[#BEF221]/25 text-[#0D0630] font-medium px-2 py-0.5 rounded-full"
                            >
                              {t(feature, locale)}
                            </span>
                          ))}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-[28px] md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] [text-wrap:balance] text-[#0D0630] mb-8">
            {ind.adaptedTo} <span className="underline decoration-[#BEF221] decoration-4 underline-offset-4">{industries.length}{ind.professionsSuffix}</span>
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-black tracking-tight tabular-nums text-[#0D0630]">{industries.length}</p>
              <p className="text-gray-500 text-sm">Industries</p>
            </div>
            <div>
              <p className="text-4xl font-black tracking-tight tabular-nums text-[#0D0630]">{industryCategories.length}</p>
              <p className="text-gray-500 text-sm">{ind.categories}</p>
            </div>
            <div>
              <p className="text-4xl font-black tracking-tight tabular-nums text-[#0D0630]">∞</p>
              <p className="text-gray-500 text-sm">{ind.customization}</p>
            </div>
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
