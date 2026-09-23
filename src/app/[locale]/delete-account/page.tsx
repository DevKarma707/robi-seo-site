import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { LegalContent } from "@/components/sections/LegalContent";

// Page exigée par Google Play (et utile pour l'App Store) : une adresse
// publique qui explique comment supprimer son compte, y compris sans l'app.
// Déclarée dans la fiche Play (Sécurité des données → suppression de compte).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const page = (dict.pages as any).deleteAccount;

  return {
    title: page?.title || "Supprimer mon compte",
    description: page?.description || "",
    robots: { index: false, follow: true },
  };
}

export default async function DeleteAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const page = (dict.pages as any).deleteAccount || {};

  const sections = [
    { title: page.inApp || "Depuis l'application", content: page.inAppContent || "" },
    { title: page.byEmail || "Par email", content: page.byEmailContent || "" },
    { title: page.deleted || "Ce qui est supprimé", content: page.deletedContent || "" },
    { title: page.kept || "Ce qui est conservé, et pourquoi", content: page.keptContent || "" },
    { title: page.delay || "Délais", content: page.delayContent || "" },
  ];

  return (
    <>
      <Hero
        badge={page.badge || "Compte"}
        title={page.heroTitle || "Supprimer votre"}
        titleAccent={page.heroTitleAccent || "compte Robi"}
        subtitle=""
        variant="centered"
      />
      <LegalContent sections={sections} lastUpdated={page.lastUpdated || ""} />
    </>
  );
}
