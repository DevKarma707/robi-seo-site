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
  const cgu = (dict.pages as any).cguWeb || (dict.pages as any).terms;

  return {
    title: cgu?.title || "CGU App Web",
    description: cgu?.description || "",
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const cgu = (dict.pages as any).cguWeb || (dict.pages as any).terms || {};

  const sections = [
    { title: cgu.object || "Objet", content: cgu.objectContent || "" },
    { title: cgu.access || "Accès au service", content: cgu.accessContent || "" },
    { title: cgu.account || "Création de compte", content: cgu.accountContent || "" },
    { title: cgu.features || "Fonctionnalités", content: cgu.featuresContent || "" },
    { title: cgu.obligations || "Obligations de l'utilisateur", content: cgu.obligationsContent || "" },
    { title: cgu.data || "Données personnelles", content: cgu.dataContent || "" },
    { title: cgu.ip || "Propriété intellectuelle", content: cgu.ipContent || "" },
    { title: cgu.liability || "Limitation de responsabilité", content: cgu.liabilityContent || "" },
    { title: cgu.termination || "Suspension et résiliation", content: cgu.terminationContent || "" },
    { title: cgu.law || "Droit applicable", content: cgu.lawContent || "" },
  ];

  return (
    <>
      <Hero
        badge={cgu.badge || "CGU App Web"}
        title={cgu.heroTitle || "CGU — Application"}
        titleAccent={cgu.heroTitleAccent || "Web"}
        subtitle=""
        variant="centered"
      />
      <LegalContent sections={sections} lastUpdated={cgu.lastUpdated || ""} />
      <CTA
        title={dict.cta.title}
        subtitle={dict.cta.subtitle}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
