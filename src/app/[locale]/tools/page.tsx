import { Metadata } from "next";
import Link from "next/link";
import { tools, t } from "@/data/seo-config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";
import { Calculator, FileText, Scale, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return {
    title: `${dict.nav.tools} | Robi AI`,
    description: dict.meta.description,
    keywords: ["outils freelance", "calculateur tjm", "simulateur charges freelance"],
  };
}

const toolIcons: Record<string, React.ElementType> = {
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
      <Hero
        badge={toolsDict?.heroBadge || dict.nav.tools}
        title={toolsDict?.heroTitle || dict.nav.tools}
        titleAccent={toolsDict?.heroTitleAccent || ""}
        subtitle={toolsDict?.heroSubtitle || ""}
        variant="centered"
      />

      <section className="py-24 bg-[#0D0630] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(190,242,33,0.04),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tools.map((tool, index) => {
              const Icon = toolIcons[tool.slug] || Calculator;
              return (
                <ScrollReveal key={tool.slug} delay={index * 100}>
                  <Link href={`/${locale}/tools/${tool.slug}`}>
                    <Card className="h-full group cursor-pointer text-center">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#BEF221]/20 flex items-center justify-center group-hover:bg-[#BEF221] transition-colors">
                        <Icon className="w-10 h-10 text-[#BEF221] group-hover:text-[#0D0630] transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#BEF221] transition-colors">
                        {t(tool.name, locale)}
                      </h3>
                      <p className="text-white/50 mb-4">{t(tool.description, locale)}</p>
                      <span className="inline-flex items-center gap-2 text-[#BEF221] font-medium">
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
