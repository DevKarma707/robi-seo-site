import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { locales, Locale, defaultLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function getValidLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getValidLocale(rawLocale);
  const dict = await getDictionary(locale);

  return {
    title: {
      default: dict.meta.title,
      template: `%s | Robi AI`,
    },
    description: dict.meta.description,
    alternates: {
      canonical: `https://robi-app.com/${locale}`,
      languages: {
        fr: "https://robi-app.com/fr",
        en: "https://robi-app.com/en",
        es: "https://robi-app.com/es",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getValidLocale(rawLocale);
  const dict = await getDictionary(locale);

  return (
    <html lang={locale}>
      <head>
        {/* Favicon — same method as go.robi-app.com */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Warm up go.robi-app.com before the user clicks a CTA */}
        <link rel="preconnect" href="https://go.robi-app.com" />
        <link rel="dns-prefetch" href="https://go.robi-app.com" />
        <link rel="prefetch" href="https://go.robi-app.com" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Header locale={locale} dict={dict} />
        <main>{children}</main>
        <Footer locale={locale} dict={dict} />
      </body>
    </html>
  );
}
