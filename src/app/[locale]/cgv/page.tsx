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
  const cgv = (dict.pages as any).cgv;

  return {
    title: cgv?.title || "CGV",
    description: cgv?.description || "",
  };
}

export default async function CGVPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const cgv = (dict.pages as any).cgv || {};

  const sections = [
    { title: cgv.object || "Objet", content: cgv.objectContent || "" },
    { title: cgv.offers || "Offres et tarifs", content: cgv.offersContent || "" },
    { title: cgv.payment || "Modalités de paiement", content: cgv.paymentContent || "" },
    { title: cgv.withdrawal || "Droit de rétractation", content: cgv.withdrawalContent || "" },
    { title: cgv.duration || "Durée et résiliation", content: cgv.durationContent || "" },
    { title: cgv.ip || "Propriété intellectuelle", content: cgv.ipContent || "" },
    { title: cgv.liability || "Limitation de responsabilité", content: cgv.liabilityContent || "" },
    { title: cgv.data || "Protection des données", content: cgv.dataContent || "" },
    { title: cgv.law || "Droit applicable", content: cgv.lawContent || "" },
  ];

  return (
    <>
      <Hero
        badge={cgv.heroTitle || "CGV"}
        title={cgv.heroTitle || "Conditions Générales"}
        titleAccent={cgv.heroTitleAccent || "de Vente"}
        subtitle=""
        variant="centered"
      />
      <LegalContent sections={sections} lastUpdated={cgv.lastUpdated || ""} />
      <CTA
        title={dict.cta.title}
        subtitle={dict.cta.subtitle}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
