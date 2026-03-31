import { Metadata } from "next";
import { notFound } from "next/navigation";
import { industries, t } from "@/data/seo-config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Check, X, Zap, Clock, AlertTriangle } from "lucide-react";

// Generate static pages for all industries
export async function generateStaticParams() {
  return industries.map((industry) => ({
    slug: industry.slug,
  }));
}

// Generate metadata for each industry page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const industry = industries.find((i) => i.slug === slug);

  if (!industry) {
    return {
      title: "Page not found",
    };
  }

  return {
    title: t(industry.title, locale),
    description: t(industry.description, locale),
    keywords: industry.keywords,
    openGraph: {
      title: t(industry.title, locale),
      description: t(industry.description, locale),
      type: "website",
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const industry = industries.find((i) => i.slug === slug);

  if (!industry) {
    notFound();
  }

  const industryName = t(industry.name, locale).toLowerCase();
  const ind = dict.pages.industries;

  return (
    <>
      {/* JSON-LD Schema for Industry */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: `Robi AI - ${t(industry.name, locale)}`,
            applicationCategory: "BusinessApplication",
            description: t(industry.description, locale),
            offers: {
              "@type": "Offer",
              price: "14.99",
              priceCurrency: "EUR",
            },
          }),
        }}
      />

      <Hero
        badge={`${ind.solutionFor} ${t(industry.name, locale)}`}
        title={t(industry.heroTitle, locale)}
        subtitle={t(industry.description, locale)}
        ctaText={ind.tryFree}
        ctaHref="https://www.robi-app.com"
        variant="centered"
      />

      {/* Pain Points Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="warning" className="mb-4">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {ind.commonProblems}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              {ind.challengesOf} {industryName}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industry.painPoints.map((pain, index) => (
              <Card key={index} variant="default" className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t(pain, locale)}</h3>
                <p className="text-gray-500">
                  {ind.robiSolves}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="success" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              {ind.solutionsRobi}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              {ind.featuresFor} {industryName}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industry.features.map((feature, index) => (
              <Card key={index} variant="accent" className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#BEF221] flex items-center justify-center">
                  <Check className="w-8 h-8 text-[#0D0630]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t(feature, locale)}
                </h3>
                <p className="text-gray-500">
                  {ind.builtIn}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Time Savings Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#BEF221]/20 mb-8">
            <Clock className="w-10 h-10 text-[#BEF221]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
            {ind.save10h}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t(industry.name, locale)} {ind.save10hDesc}
          </p>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <p className="text-4xl font-black text-[#BEF221]">30s</p>
              <p className="text-gray-500 text-sm">{ind.toCreateQuote}</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#BEF221]">2x</p>
              <p className="text-gray-500 text-sm">{ind.paidFaster}</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#BEF221]">0</p>
              <p className="text-gray-500 text-sm">{ind.manualReminder}</p>
            </div>
          </div>
        </div>
      </section>

      <Pricing locale={locale} dict={dict} />

      <FAQ
        items={[
          {
            question: ind.faq1q.replace("{name}", industryName),
            answer: ind.faq1a.replace("{name}", industryName),
          },
          {
            question: ind.faq2q,
            answer: ind.faq2a,
          },
          {
            question: ind.faq3q,
            answer: ind.faq3a,
          },
          {
            question: ind.faq4q,
            answer: ind.faq4a,
          },
        ]}
      />

      <CTA
        title={ind.readySimplify}
        subtitle={ind.joinIndustry.replace("{name}", industryName)}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
