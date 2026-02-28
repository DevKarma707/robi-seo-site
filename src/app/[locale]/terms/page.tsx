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
  const terms = (dict.pages as any).terms;

  return {
    title: terms?.title || "CGU",
    description: terms?.description || "",
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
  const terms = (dict.pages as any).terms || {};

  const sections = [
    { title: terms.object || "Objet", content: terms.objectContent || "" },
    { title: terms.access || "Accès au service", content: terms.accessContent || "" },
    { title: terms.services || "Description du service", content: terms.servicesContent || "" },
    { title: terms.pricing || "Tarifs et paiement", content: terms.pricingContent || "" },
    { title: terms.obligations || "Obligations de l'utilisateur", content: terms.obligationsContent || "" },
    { title: terms.ourObligations || "Obligations de Robi AI", content: terms.ourObligationsContent || "" },
    { title: terms.liability || "Responsabilité", content: terms.liabilityContent || "" },
    { title: terms.termination || "Résiliation", content: terms.terminationContent || "" },
    { title: terms.law || "Droit applicable", content: terms.lawContent || "" },
  ];

  return (
    <>
      <Hero
        badge={terms.heroTitle || "CGU"}
        title={terms.heroTitle || "Conditions Générales"}
        titleAccent={terms.heroTitleAccent || "d'Utilisation"}
        subtitle=""
        variant="centered"
      />
      <LegalContent sections={sections} lastUpdated={terms.lastUpdated || ""} />
      <CTA
        title={dict.cta.title}
        subtitle={dict.cta.subtitle}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
