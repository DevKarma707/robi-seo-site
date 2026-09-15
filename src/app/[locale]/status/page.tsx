import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { CTA } from "@/components/sections/CTA";
import { StatusBoard, type StatusDict } from "@/components/sections/StatusBoard";
import { getPublicStatus } from "@/lib/publicStatus";

// Reachable by URL but deliberately unlinked: a status page only pays off once
// enough users hit an outage at the same time to check it before writing to
// support. Before launch it would mostly advertise our own hiccups. To publish
// it, add a `status` entry to `footer.company` in Footer.tsx and a `footer.status`
// label to fr/en/es.json. The real value today is /api/status, which an external
// monitor can poll.
//
// The report is recomputed upstream every minute at most; rendering it at
// request time keeps the page honest without hammering the function
// (publicStatus.ts memoizes for 60 s).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const status = (dict.pages as any).status || {};

  return {
    title: status.metaTitle || "Statut des services",
    description: status.metaDescription || "",
    alternates: { canonical: `/${locale}/status` },
    // A live status page has nothing to rank on, and a "degraded" snapshot
    // sitting in Google's cache would misinform.
    robots: { index: false, follow: true },
  };
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const status = (dict.pages as any).status || {};
  const initial = await getPublicStatus();

  return (
    <>
      <Hero
        badge={status.badge}
        title={status.heroTitle || "Statut des services"}
        subtitle={status.heroSubtitle || ""}
        variant="centered"
      />
      <StatusBoard initial={initial} dict={status as StatusDict} locale={locale} />
      <CTA
        title={dict.cta.title}
        subtitle={dict.cta.subtitle}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
