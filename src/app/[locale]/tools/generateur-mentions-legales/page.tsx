import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { GenerateurMentionsClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const t = (dict.pages as any).tools?.mentions;

  return {
    title: t?.title || "Générateur de Mentions Légales",
    description: t?.subtitle || "Créez vos mentions légales conformes RGPD",
    keywords: ["mentions légales", "RGPD", "legal notice generator"],
  };
}

export default async function GenerateurMentionsLegalesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const toolsDict = (dict.pages as any).tools || {};

  return (
    <GenerateurMentionsClient
      dict={toolsDict.mentions || {}}
      freeTool={toolsDict.freeTool || "Outil gratuit"}
      ctaDict={dict.cta}
      locale={locale}
    />
  );
}
