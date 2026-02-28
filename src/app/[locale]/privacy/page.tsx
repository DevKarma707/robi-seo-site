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
  const privacy = (dict.pages as any).privacy;

  return {
    title: privacy?.title || "Politique de Confidentialité",
    description: privacy?.description || "",
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const privacy = (dict.pages as any).privacy || {};

  const sections = [
    { title: privacy.intro || "Introduction", content: privacy.introContent || "" },
    { title: privacy.dataCollected || "Données collectées", content: privacy.dataCollectedContent || "" },
    { title: privacy.purpose || "Finalités", content: privacy.purposeContent || "" },
    { title: privacy.legalBasis || "Base légale", content: privacy.legalBasisContent || "" },
    { title: privacy.retention || "Conservation", content: privacy.retentionContent || "" },
    { title: privacy.rights || "Vos droits", content: privacy.rightsContent || "" },
    { title: privacy.security || "Sécurité", content: privacy.securityContent || "" },
    { title: privacy.cookies || "Cookies", content: privacy.cookiesContent || "" },
    { title: privacy.contact || "Contact", content: privacy.contactContent || "" },
  ];

  return (
    <>
      <Hero
        badge={privacy.heroTitle || "Privacy"}
        title={privacy.heroTitle || "Politique de"}
        titleAccent={privacy.heroTitleAccent || "Confidentialité"}
        subtitle=""
        variant="centered"
      />
      <LegalContent sections={sections} lastUpdated={privacy.lastUpdated || ""} />
      <CTA
        title={dict.cta.title}
        subtitle={dict.cta.subtitle}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
