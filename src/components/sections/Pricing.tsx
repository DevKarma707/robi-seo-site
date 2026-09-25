"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { LaunchSeats, useLaunchOffer, formatLaunchPrice } from "@/components/ui/LaunchSeats";
import { Locale, localeCurrencies, priceMap } from "@/lib/i18n/config";

interface PricingProps {
  title?: string;
  subtitle?: string;
  dict?: any;
  locale?: Locale;
  fadeBottom?: boolean;
}

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

  // Offre de lancement par tranches (59 € → 79 € → 99 €) : le prix affiché
  // est celui de la tranche courante, lu en direct. Tant qu'il n'est pas
  // connu (chargement, fonction pas encore redéployée), on garde le prix de
  // la grille — jamais un chiffre inventé.
  const offre = useLaunchOffer();
  const tranche = offre?.tranche;
  const launchLabel = formatLaunchPrice(tranche?.price, locale) ?? formatPrice(prices.launch);
  const lowest30d = tranche && tranche.index > 0 ? formatLaunchPrice(offre?.lowestPrice30d, locale) : null;
  const launchSoldOut = !!tranche && !tranche.purchasable;
  const fillPrice = (tpl: string, price: string) => tpl.replace("{price}", price);
  const nfSeats = new Intl.NumberFormat(locale);
  const fillSeats = (tpl: string, n: number) => tpl.replace("{seats}", nfSeats.format(n));
  const paliers = (offre?.paliers || []).filter((x) => x.price);

  // Chrono vers la VRAIE date limite de l'offre (Admin › Lancement), s'il y en a une.
  const [now, setNow] = useState(() => Date.now());
  const fin = offre?.deadline ? Date.parse(offre.deadline) : NaN;
  const chronoActif = Number.isFinite(fin) && fin > now;
  useEffect(() => {
    if (!chronoActif) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [chronoActif]);
  const chrono = chronoActif ? (() => {
    const s = Math.floor((fin - now) / 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const j = Math.floor(s / 86400);
    const u = [
      { v: pad(Math.floor((s % 86400) / 3600)), l: p.launchUnitH || "h" },
      { v: pad(Math.floor((s % 3600) / 60)), l: p.launchUnitM || "min" },
      { v: pad(s % 60), l: p.launchUnitS || "s" },
    ];
    return j > 0 ? [{ v: String(j), l: p.launchUnitD || "j" }, ...u] : u;
  })() : null;

  const yearlyPerMonth = formatCurrency(prices.yearly / 12);
  const biYearlyPerMonth = formatCurrency(prices.biYearly / 24);
  const biYearlySavings = formatPrice(Math.round(prices.monthly * 24 - prices.biYearly));

  return (
    <section id="pricing" className="py-24 bg-[#0D0630] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            {title || "Des prix simples, sans frais cachés"}
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            {subtitle || "Choisissez le plan qui correspond à votre croissance."}
          </p>
        </ScrollReveal>

        {/* Offre de lancement — carte à paliers (version B). Prix, places et
            paliers lus en direct ; chrono seulement si une vraie date limite
            est fixée dans Admin › Lancement. */}
        <ScrollReveal className="mb-12 max-w-4xl mx-auto">
          <div className="rounded-[26px] p-[2px] bg-[linear-gradient(135deg,#BEF221_0%,rgba(190,242,33,.25)_40%,rgba(190,242,33,.05)_70%,#BEF221_100%)]">
            <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(170deg,#150c44_0%,#0D0630_60%)] px-5 py-8 md:px-10 md:py-10 text-center flex flex-col gap-6">
              <div aria-hidden="true" className="pointer-events-none absolute -top-1/3 -right-1/4 w-2/3 h-[90%] bg-[radial-gradient(closest-side,rgba(190,242,33,.16),transparent)]" />
              <span className="self-center inline-block px-4 py-1.5 rounded-full bg-[#BEF221] text-[#0D0630] text-xs font-black uppercase tracking-wider">
                {p.launchOfferBadge || "OFFRE LIMITÉE"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
                {p.launchTiersTitle || "Accès à vie. Le prix monte à chaque palier."}
              </h3>

              {paliers.length > 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
                  {paliers.map((pa) => {
                    const courant = pa.index === tranche?.index;
                    const passe = tranche ? pa.index < tranche.index : false;
                    const pct = pa.seats ? Math.min(100, Math.round((pa.sold / pa.seats) * 100)) : 0;
                    return (
                      <div key={pa.index} className={`rounded-xl border px-3.5 py-3 flex flex-col gap-2 ${courant ? "border-[#BEF221] bg-[#BEF221]/10" : "border-white/10 bg-black/20"} ${!courant ? "opacity-55" : ""}`}>
                        <span className={`text-xl font-black ${passe ? "line-through text-white/50" : "text-white"}`}>{formatLaunchPrice(pa.price, locale)}</span>
                        <span className="h-1.5 rounded-full bg-white/10 overflow-hidden"><span className="block h-full rounded-full bg-[#BEF221]" style={{ width: `${passe ? 100 : pct}%` }} /></span>
                        <span className={`text-[11.5px] ${courant ? "text-[#BEF221] font-bold" : "text-white/50"}`}>
                          {courant
                            ? `${p.launchTierNow || "En cours"}${pa.remaining !== null ? ` · ${fillSeats(p.launchTierSeats || "{seats} places", pa.remaining)}` : ""}`
                            : pa.seats === null
                              ? (p.launchTierOpen || "Dernier palier")
                              : fillSeats(p.launchTierSeats || "{seats} places", pa.seats)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <LaunchSeats
                  locale={locale}
                  remainingText={p.launchOfferRemaining || "{remaining} places restantes sur {total}"}
                  trancheText={p.launchOfferTranche || "{remaining} places restantes à {price}"}
                  nextText={p.launchOfferNext || "ensuite {price}"}
                  deadlineText={p.launchOfferDeadline || "jusqu'au {date}"}
                />
              )}

              <div className="flex items-center justify-center gap-4 md:gap-5 flex-wrap">
                <span className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">{launchLabel}</span>
                <div className="text-left flex flex-col gap-0.5">
                  <p className="text-white/40 line-through text-xs md:text-sm">
                    {p.launchOfferNormalPrice || "Prix normal"} : {formatPrice(prices.normal)}
                  </p>
                  <p className="text-[#BEF221] font-bold text-sm md:text-base">{p.launchOnce || "Une fois. Pour toujours."}</p>
                  <p className="text-white/50 text-xs">{p.launchOfferLifetime || "Accès à vie • Robi Pro"}</p>
                </div>
              </div>

              {chrono && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-white/70 text-[13px]">{p.launchEndsIn || "L'offre se termine dans"}</span>
                  <div className="flex items-start gap-1.5 font-mono font-bold tabular-nums">
                    {chrono.map((u, i) => (
                      <div key={u.l} className="flex items-start gap-1.5">
                        {i > 0 && <span className="text-white/40 text-xl pt-1.5">:</span>}
                        <div className="flex flex-col items-center">
                          <span className="text-2xl text-white bg-black/35 border border-[#BEF221]/45 rounded-lg px-2.5 py-1 min-w-[2.6em] text-center">{u.v}</span>
                          <span className="font-sans text-[9.5px] tracking-widest uppercase text-white/45 mt-1">{u.l}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lowest30d && (
                // Obligation Omnibus dès qu'un prix a monté : le plus bas des 30 derniers jours.
                <p className="text-white/40 text-[11px] -mb-2">
                  {fillPrice(p.launchOfferLowest || "Prix le plus bas pratiqué ces 30 derniers jours : {price}", lowest30d)}
                </p>
              )}
              {launchSoldOut ? (
                <p className="text-white/70 font-bold">
                  {p.launchOfferSoldOut || "Toutes les places à ce prix sont parties."}
                </p>
              ) : (
                <Button
                  href="https://go.robi-app.com"
                  variant="primary"
                  className="w-full max-w-md self-center font-black tracking-wider !text-sm md:!text-base shadow-[0_18px_50px_-18px_rgba(190,242,33,.6)]"
                >
                  {p.launchOfferCta ? `${p.launchOfferCta} (${launchLabel})` : `PROFITER DE L'OFFRE (${launchLabel})`}
                </Button>
              )}
              <p className="text-white/40 text-[11.5px] -mt-2">{p.launchFine || "Paiement unique · sans abonnement caché"}</p>
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
                href="https://go.robi-app.com"
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
                href="https://go.robi-app.com"
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
