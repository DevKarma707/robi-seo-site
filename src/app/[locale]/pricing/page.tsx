import { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Card } from "@/components/ui/Card";
import { Shield, Zap, HeartHandshake } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
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
    title: dict.pages.pricing.title,
    description: dict.pages.pricing.description,
    keywords: ["prix robi ai", "tarif facturation freelance", "logiciel facturation prix"],
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const p = dict.pages.pricing;

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
                name: p.badge,
                item: `https://robi.ai/${locale}/pricing`,
              },
            ],
          }),
        }}
      />

      <Hero
        badge={p.badge}
        title={p.heroTitle}
        titleAccent={p.heroTitleAccent}
        subtitle={p.heroSubtitle}
        variant="centered"
      />

      <Pricing
        title={dict.pricing.title}
        subtitle={dict.pricing.subtitle}
        dict={dict}
        locale={locale}
      />

      {/* Guarantees */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              {p.guarantees}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0}>
              <Card className="text-center h-full">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#BEF221]/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-[#BEF221]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {p.freeTrial}
                </h3>
                <p className="text-gray-500">
                  {p.freeTrialDesc}
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="text-center h-full">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#BEF221]/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-[#BEF221]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {p.moneyBack}
                </h3>
                <p className="text-gray-500">
                  {p.moneyBackDesc}
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="text-center h-full">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#BEF221]/20 flex items-center justify-center">
                  <HeartHandshake className="w-8 h-8 text-[#BEF221]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {p.humanSupport}
                </h3>
                <p className="text-gray-500">
                  {p.humanSupportDesc}
                </p>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <FAQ
        title={p.faqTitle}
        items={[
          { question: p.faq1q, answer: p.faq1a },
          { question: p.faq2q, answer: p.faq2a },
          { question: p.faq3q, answer: p.faq3a },
          { question: p.faq4q, answer: p.faq4a },
          { question: p.faq5q, answer: p.faq5a },
        ]}
      />

      <CTA
        title={dict.cta.title}
        subtitle={dict.cta.subtitle}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
