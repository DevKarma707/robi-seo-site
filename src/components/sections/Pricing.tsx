"use client";

import { Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Locale, localeCurrencies } from "@/lib/i18n/config";

interface PricingProps {
  title?: string;
  subtitle?: string;
  dict?: any;
  locale?: Locale;
}

const priceMap: Record<Locale, { launch: number; normal: number; monthly: number; yearly: number; biYearly: number; }> = {
  fr: { launch: 59, normal: 149, monthly: 14, yearly: 89, biYearly: 149 },
  en: { launch: 69, normal: 159, monthly: 15, yearly: 99, biYearly: 159 },
  es: { launch: 59, normal: 149, monthly: 14, yearly: 89, biYearly: 149 },
  "pt-BR": { launch: 299, normal: 749, monthly: 69, yearly: 449, biYearly: 749 },
  "fr-MA": { launch: 599, normal: 1499, monthly: 139, yearly: 899, biYearly: 1499 },
  "es-419": { launch: 69, normal: 159, monthly: 15, yearly: 99, biYearly: 159 },
  "es-MX": { launch: 999, normal: 2499, monthly: 249, yearly: 1499, biYearly: 2499 },
  "es-CO": { launch: 249000, normal: 600000, monthly: 59000, yearly: 379000, biYearly: 600000 },
};

export function Pricing({
  title,
  subtitle,
  dict,
  locale = "fr",
}: PricingProps) {
  const p = dict?.pricing || {};
  const prices = priceMap[locale] || priceMap["fr"];
  const currencyInfo = localeCurrencies[locale] || localeCurrencies["fr"];

  // Helper function to format price using Intl API
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyInfo.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyInfo.currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const features = [
    p.features?.unlimitedInvoices || "Factures et devis illimités",
    p.features?.autoReminders || "Relances et notifications automatiques",
    p.features?.voiceCreation || "Création par la voix grâce à l'IA",
    p.features?.designCustomization || "Personnalisation design avancée",
    p.features?.oneClickPayment || "Paiement en un clic",
  ];

  const yearlyPerMonth = formatCurrency(prices.yearly / 12);
  const biYearlyPerMonth = formatCurrency(prices.biYearly / 24);
  const biYearlySavings = formatPrice(Math.round(prices.monthly * 24 - prices.biYearly));

  return (
    <section id="pricing" className="py-24 bg-[#0D0630] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#BEF221_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            {title || "Des prix simples, sans frais cachés"}
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            {subtitle || "Choisissez le plan qui correspond à votre croissance."}
          </p>
        </ScrollReveal>

        {/* Launch Offer Banner */}
        <ScrollReveal className="mb-12 max-w-4xl mx-auto">
          <div className="bg-[#BEF221] rounded-3xl p-1 relative overflow-hidden">
            <div className="bg-[#0D0630] rounded-[calc(1.5rem-4px)] p-6 md:p-10 text-center relative">
              <div className="absolute top-0 right-0 p-4">
                <TrendingUp className="text-[#BEF221] w-8 h-8 opacity-20" />
              </div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#BEF221] text-[#0D0630] text-xs font-black uppercase tracking-wider mb-6">
                {p.launchOfferBadge || "OFFRE LIMITÉE"}
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                {p.launchOfferTitle || "Accès à Vie - Robi Pro"}
              </h3>
              <p className="text-white/60 mb-8 max-w-lg mx-auto">
                {p.launchOfferSubtitle || "Pour les 1000 premiers utilisateurs uniquement"}
              </p>
              <div className="flex items-center justify-center gap-3 md:gap-4 mb-3 md:mb-6">
                <span className="text-4xl md:text-6xl font-black text-white">{formatPrice(prices.launch)}</span>
                <div className="text-left">
                  <p className="text-white/40 line-through text-xs md:text-sm">
                    {p.launchOfferNormalPrice || "Prix normal"} : {formatPrice(prices.normal)}
                  </p>
                  <p className="text-[#BEF221] font-bold text-xs md:text-sm">
                    {p.launchOfferLifetime || "Accès à vie • Robi Pro"}
                  </p>
                </div>
              </div>
              <Button
                href="https://app.robi-app.com"
                variant="primary"
                className="w-full max-w-md font-black tracking-wider !text-xs md:!text-base"
              >
                {p.launchOfferCta ? `${p.launchOfferCta} (${formatPrice(prices.launch)})` : `PROFITER DE L'OFFRE (${formatPrice(prices.launch)})`}
              </Button>
            </div>
          </div>
        </ScrollReveal>

        <div className="flex flex-row md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-8 md:pb-0 snap-x snap-mandatory hide-scrollbar md:overflow-visible">
          {/* Mensuel */}
          <ScrollReveal className="min-w-[75vw] md:min-w-0 snap-center">
            <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
              <div className="text-center mb-5 md:mb-8">
                <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-3">
                  {p.monthly || "Mensuel"}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-5xl font-black text-white">{formatPrice(prices.monthly)}</span>
                  <span className="text-white/50 text-xs md:text-base">{p.month || "/mois"}</span>
                </div>
                <p className="text-white/40 text-xs md:text-sm mt-1 md:mt-2">
                  {p.noCommitment || "Sans engagement"}
                </p>
              </div>
              <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8 flex-1">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white/60" />
                    </div>
                    <span className="text-xs md:text-sm text-white/60">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                href="https://app.robi-app.com"
                variant="outline"
                className="w-full font-black tracking-wider text-sm !border-white/40 !text-white hover:!bg-white hover:!text-[#0D0630]"
              >
                {p.ctaMonthly || "CHOISIR MENSUEL"}
              </Button>
            </div>
          </ScrollReveal>

          {/* Annuel */}
          <ScrollReveal className="min-w-[75vw] md:min-w-0 snap-center">
            <div className="flex flex-col h-full rounded-2xl border-2 border-[#BEF221] bg-white/5 p-4 md:p-6 relative md:scale-[1.02] shadow-[0_0_40px_rgba(190,242,33,0.15)]">
              <div className="hidden md:block absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-3 md:px-4 py-1 rounded-full bg-[#BEF221] text-[#0D0630] text-[10px] md:text-xs font-black uppercase tracking-wider whitespace-nowrap">
                  {p.mostPopular || "LE PLUS POPULAIRE"}
                </span>
              </div>
              <div className="text-center mb-5 md:mb-6 pt-0 md:pt-2">
                <p className="text-[#BEF221] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3">
                  {p.yearly || "Annuel"}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-5xl font-black text-white">{formatPrice(prices.yearly)}</span>
                  <span className="text-white/50">{p.year || "/an"}</span>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  {yearlyPerMonth}{p.month || "/mois"}
                </p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#BEF221] text-[#0D0630] text-xs font-black">
                  {p.monthsSaved || "= 2 MOIS OFFERTS"}
                </span>
              </div>
              <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8 flex-1">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#BEF221] flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#0D0630]" />
                    </div>
                    <span className="text-sm text-white/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                href="https://app.robi-app.com"
                variant="primary"
                className="w-full font-black tracking-wider text-sm"
              >
                {p.ctaYearly || "CHOISIR ANNUEL"}
              </Button>
            </div>
          </ScrollReveal>

          {/* Bi-annuel */}
          <ScrollReveal className="min-w-[75vw] md:min-w-0 snap-center">
            <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 relative">
              <div className="hidden md:block absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-3 md:px-4 py-1 rounded-full bg-[#1a1040] border border-white/20 text-white text-[10px] md:text-xs font-black uppercase tracking-wider whitespace-nowrap">
                  {p.bestOffer || "MEILLEURE OFFRE"}
                </span>
              </div>
              <div className="text-center mb-5 md:mb-6 pt-0 md:pt-2">
                <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3">
                  {p.biYearly || "Bi-annuel"}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-5xl font-black text-white">{formatPrice(prices.biYearly)}</span>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  {biYearlyPerMonth}{p.month || "/mois"}
                </p>
                <p className="text-[#BEF221] text-sm font-bold mt-1">
                  {(p.savingsBiYearly || "Économisez").replace(/[0-9€$R]/g, '')} {biYearlySavings}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  {p.exclusiveWebOffer || "Offre exclusive web"}
                </p>
              </div>
              <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8 flex-1">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white/60" />
                    </div>
                    <span className="text-xs md:text-sm text-white/60">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                href="https://app.robi-app.com"
                variant="outline"
                className="w-full font-black tracking-wider text-sm !border-white/40 !text-white hover:!bg-white hover:!text-[#0D0630]"
              >
                {p.ctaBiYearly || "CHOISIR BI-ANNUEL"}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
