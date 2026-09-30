import { Metadata } from "next";
import Link from "next/link";
import { tools, t } from "@/data/seo-config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";
import { Calculator, FileText, Scale, ArrowRight, ReceiptText } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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
    ...pageSeo(locale, "/tools"),
    title: `${dict.nav.tools}`,
    description: dict.meta.description,
    keywords: ["outils freelance", "calculateur tjm", "simulateur charges freelance"],
  };
}

const toolIcons: Record<string, React.ElementType> = {
  "generateur-facture": ReceiptText,
  "calculateur-tjm": Calculator,
  "simulateur-charges": Scale,
  "generateur-mentions-legales": FileText,
};

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const toolsDict = (dict.pages as any).tools;

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
                name: dict.nav.tools,
                item: `https://robi-app.com/${locale}/tools`,
              },
            ],
          }),
        }}
      />

      <Hero
        badge={toolsDict?.heroBadge || dict.nav.tools}
        title={toolsDict?.heroTitle || dict.nav.tools}
        titleAccent={toolsDict?.heroTitleAccent || ""}
        subtitle={toolsDict?.heroSubtitle || ""}
        variant="centered"
      />

      <section className="py-16 md:py-24 lg:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {tools.map((tool, index) => {
              const Icon = toolIcons[tool.slug] || Calculator;
              return (
                <ScrollReveal key={tool.slug} delay={index * 100} className="h-full">
                  <Link href={`/${locale}/tools/${tool.slug}`} className="block h-full">
                    <Card className="h-full group cursor-pointer text-center">
                      <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-[#0D0630] flex items-center justify-center">
                        <Icon className="w-7 h-7 text-[#BEF221]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0D0630] mb-3 decoration-[#BEF221] decoration-2 underline-offset-4 group-hover:underline">
                        {t(tool.name, locale)}
                      </h3>
                      <p className="text-gray-500 mb-4">{t(tool.description, locale)}</p>
                      <span className="inline-flex items-center gap-2 text-[#0D0630] font-semibold">
                        {dict.common.learnMore}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Card>
                  </Link>
                </ScrollReveal>
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
