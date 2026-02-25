import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { SimulateurChargesClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const t = (dict.pages as any).tools?.simulateur;

  return {
    title: t?.title || "Simulateur de Charges",
    description: t?.subtitle || "Estimez vos charges sociales et fiscales",
    keywords: ["simulateur charges freelance", "charges sociales", "tax simulator"],
  };
}

export default async function SimulateurChargesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const toolsDict = (dict.pages as any).tools || {};

  return (
    <SimulateurChargesClient
      dict={toolsDict.simulateur || {}}
      freeTool={toolsDict.freeTool || "Outil gratuit"}
      ctaDict={dict.cta}
      locale={locale}
    />
  );
}
