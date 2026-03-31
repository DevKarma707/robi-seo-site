import { Metadata } from "next";
import Link from "next/link";
import { comparisons, t } from "@/data/seo-config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";
import { ArrowRight, Swords } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const comp = dict.pages.comparisons;

  return {
    title: `${comp.badge} | Robi AI`,
    description: dict.meta.description,
    keywords: ["robi ai vs", "comparatif facturation", "alternative facturation"],
  };
}

export default async function ComparisonsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const comp = dict.pages.comparisons;

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
                name: comp.badge,
                item: `https://robi-app.com/${locale}/comparisons`,
              },
            ],
          }),
        }}
      />

      <Hero
        badge={comp.badge}
        title={comp.whyChoose.replace("?", "")}
        titleAccent=""
        subtitle={comp.freeMigration}
        variant="centered"
      />

      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comparisons.map((comparison, index) => (
              <ScrollReveal key={comparison.slug} delay={index * 100}>
                <Link href={`/${locale}/comparisons/${comparison.slug}`}>
                  <Card className="h-full group cursor-pointer">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#BEF221]/20 flex items-center justify-center group-hover:bg-[#BEF221] transition-colors">
                        <Swords className="w-7 h-7 text-[#BEF221] group-hover:text-[#0D0630] transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#BEF221] transition-colors">
                          Robi AI vs {comparison.competitor}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-500 mb-6">
                      {t(comparison.description, locale)}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[#BEF221] font-medium">
                      {comp.detailedComparison}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
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
