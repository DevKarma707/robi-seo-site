import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { CalculateurTJMClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const t = (dict.pages as any).tools?.calculateur;

  return {
    title: t?.title || "Calculateur de TJM",
    description: t?.subtitle || "Calculez votre Tarif Journalier Moyen",
    keywords: ["calculateur tjm", "tarif journalier moyen", "freelance calculator"],
  };
}

export default async function CalculateurTJMPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const toolsDict = (dict.pages as any).tools || {};

  return (
    <CalculateurTJMClient
      dict={toolsDict.calculateur || {}}
      freeTool={toolsDict.freeTool || "Outil gratuit"}
      ctaDict={dict.cta}
      locale={locale}
    />
  );
}
