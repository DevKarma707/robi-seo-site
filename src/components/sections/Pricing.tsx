"use client";

import { Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Locale } from "@/lib/i18n/config";

interface PricingProps {
  title?: string;
  subtitle?: string;
  dict?: any;
  locale?: Locale;
}

export function Pricing({
  title,
  subtitle,
  dict,
  locale = "fr",
}: PricingProps) {
  const p = dict?.pricing || {};

  const features = [
    p.features?.unlimitedInvoices || "Factures et devis illimités",
    p.features?.autoReminders || "Relances et notifications automatiques",
    p.features?.voiceCreation || "Création par la voix grâce à l'IA",
    p.features?.designCustomization || "Personnalisation design avancée",
    p.features?.oneClickPayment || "Paiement en un clic",
  ];

  return (
    <section id="pricing" className="py-14 md:py-24 bg-[#0D0630] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#BEF221]/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-3 md:mb-4">
            {title || p.title || "Choisissez votre plan"}
          </h2>
          <p className="text-sm md:text-lg text-white/60">
            {subtitle || p.subtitle || "Passez à la vitesse supérieure avec Robi Pro"}
          </p>
        </ScrollReveal>

        {/* Launch offer banner */}
        <ScrollReveal className="mb-10">
          <div className="relative rounded-2xl border border-[#BEF221]/30 bg-[#BEF221]/5 p-5 md:p-8 overflow-hidden">
            <div className="absolute top-4 right-4 text-[#BEF221]/20">
              <TrendingUp className="w-12 h-12" />
            </div>
            <div className="text-center">
              <span className="inline-block mb-3 px-3 py-1 rounded-full bg-[#BEF221] text-[#0D0630] text-xs font-black uppercase tracking-wider">
                {p.launchOfferBadge || "OFFRE LIMITÉE"}
              </span>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-[#BEF221] mb-2">
                {p.launchOfferTitle || "OFFRE DE LANCEMENT EXCLUSIVE"}
              </h3>
              <p className="text-xs md:text-base text-white/70 mb-4 md:mb-6">
                {p.launchOfferSubtitle || "Pour les 1000 premiers utilisateurs uniquement"}
              </p>
              <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
                <span className="text-3xl md:text-6xl font-black text-white">59€</span>
                <div className="text-left">
                  <p className="text-white/40 line-through text-sm">
                    {p.launchOfferNormalPrice || "Prix normal"} : 149€
                  </p>
                  <p className="text-[#BEF221] font-bold text-sm">
                    {p.launchOfferLifetime || "Accès à vie • Robi Pro"}
                  </p>
                </div>
              </div>
              <Button
                href="https://go.robi-app.com"
                variant="primary"
                className="w-full max-w-md font-black tracking-wider !text-xs md:!text-base"
              >
                {p.launchOfferCta || "PROFITER DE L'OFFRE (59€)"}
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* 3 Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mensuel */}
          <ScrollReveal delay={0}>
            <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
              <div className="text-center mb-5 md:mb-6">
                <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3">
                  {p.monthly || "Mensuel"}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-5xl font-black text-white">14€</span>
                  <span className="text-white/50">{p.month || "/mois"}</span>
                </div>
                <p className="text-white/40 text-sm mt-2">
                  {p.noCommitment || "Sans engagement"}
                </p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white/60" />
                    </div>
                    <span className="text-sm text-white/60">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                href="https://go.robi-app.com"
                variant="outline"
                className="w-full font-black tracking-wider text-sm !border-white/40 !text-white hover:!bg-white hover:!text-[#0D0630]"
              >
                {p.ctaMonthly || "CHOISIR MENSUEL"}
              </Button>
            </div>
          </ScrollReveal>

          {/* Annuel — LE PLUS POPULAIRE */}
          <ScrollReveal delay={100}>
            <div className="flex flex-col h-full rounded-2xl border-2 border-[#BEF221] bg-white/5 p-5 md:p-6 relative scale-[1.02] shadow-[0_0_40px_rgba(190,242,33,0.15)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-3 md:px-4 py-1 rounded-full bg-[#BEF221] text-[#0D0630] text-[10px] md:text-xs font-black uppercase tracking-wider whitespace-nowrap">
                  {p.mostPopular || "LE PLUS POPULAIRE"}
                </span>
              </div>
              <div className="text-center mb-5 md:mb-6 pt-2">
                <p className="text-[#BEF221] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3">
                  {p.yearly || "Annuel"}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-5xl font-black text-white">89€</span>
                  <span className="text-white/50">{p.year || "/an"}</span>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  {p.perMonthAnnual || "7,42€/mois"}
                </p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#BEF221] text-[#0D0630] text-xs font-black">
                  {p.monthsSaved || "= 2 MOIS OFFERTS"}
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
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
                href="https://go.robi-app.com"
                variant="primary"
                className="w-full font-black tracking-wider text-sm"
              >
                {p.ctaYearly || "CHOISIR ANNUEL"}
              </Button>
            </div>
          </ScrollReveal>

          {/* Bi-annuel — MEILLEURE OFFRE */}
          <ScrollReveal delay={200}>
            <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-3 md:px-4 py-1 rounded-full bg-[#1a1040] border border-white/20 text-white text-[10px] md:text-xs font-black uppercase tracking-wider whitespace-nowrap">
                  {p.bestOffer || "MEILLEURE OFFRE"}
                </span>
              </div>
              <div className="text-center mb-5 md:mb-6 pt-2">
                <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3">
                  {p.biYearly || "Bi-annuel"}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-5xl font-black text-white">149€</span>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  {p.perMonthBiYearly || "6,21€/mes"}
                </p>
                <p className="text-[#BEF221] text-sm font-bold mt-1">
                  {p.savingsBiYearly || "Économisez 210€"}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  {p.exclusiveWebOffer || "Offre exclusive web"}
                </p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white/60" />
                    </div>
                    <span className="text-sm text-white/60">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                href="https://go.robi-app.com"
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
