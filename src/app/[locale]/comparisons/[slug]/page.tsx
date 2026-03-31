import { Metadata } from "next";
import { notFound } from "next/navigation";
import { comparisons, t } from "@/data/seo-config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTA } from "@/components/sections/CTA";
import { Check, X, Minus } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
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

  // Comparison features matrix using dict keys
  const comparisonFeatures = [
    { name: comp.comparisonFeatures.invoiceCreation, robi: true, competitor: true },
    { name: comp.comparisonFeatures.quoteCreation, robi: true, competitor: true },
    { name: comp.comparisonFeatures.aiInvoicing, robi: true, competitor: false },
    { name: comp.comparisonFeatures.autoReminders, robi: true, competitor: "partial" as const },
    { name: comp.comparisonFeatures.stripePaypal, robi: true, competitor: "partial" as const },
    { name: comp.comparisonFeatures.mobileApp, robi: true, competitor: "partial" as const },
    { name: comp.comparisonFeatures.localSupport, robi: true, competitor: true },
    { name: comp.comparisonFeatures.customTemplates, robi: true, competitor: true },
    { name: comp.comparisonFeatures.accountingExport, robi: true, competitor: true },
    { name: comp.comparisonFeatures.aiDashboards, robi: true, competitor: false },
  ];

  return (
    <>
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

      {/* Why Choose Robi */}
      <section className="py-24 bg-gray-50 relative">
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

      <CTA
        title={comp.switchFrom.replace("{competitor}", comparison.competitor)}
        subtitle={comp.freeMigration}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
