import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { LegalContent } from "@/components/sections/LegalContent";
import { CTA } from "@/components/sections/CTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const legal = (dict.pages as any).legal;

  return {
    title: legal?.title || "Mentions Légales",
    description: legal?.description || "",
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const legal = (dict.pages as any).legal || {};

  const sections = [
    { title: legal.editor || "Éditeur", content: legal.editorContent || "" },
    { title: legal.hosting || "Hébergement", content: legal.hostingContent || "" },
    { title: legal.ip || "Propriété intellectuelle", content: legal.ipContent || "" },
    { title: legal.liability || "Responsabilité", content: legal.liabilityContent || "" },
    { title: legal.law || "Droit applicable", content: legal.lawContent || "" },
  ];

  return (
    <>
      <Hero
        badge={legal.heroTitle || "Mentions"}
        title={legal.heroTitle || "Mentions"}
        titleAccent={legal.heroTitleAccent || "Légales"}
        subtitle=""
        variant="centered"
      />
      <LegalContent sections={sections} lastUpdated={legal.lastUpdated || ""} />
      <CTA
        title={dict.cta.title}
        subtitle={dict.cta.subtitle}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
