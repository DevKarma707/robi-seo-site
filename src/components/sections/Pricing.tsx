"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { LaunchSeats, useLaunchOffer, formatLaunchPrice, formatCurrentLaunchPrice } from "@/components/ui/LaunchSeats";
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
  const launchLabel = tranche ? formatCurrentLaunchPrice(tranche.price, locale) : formatPrice(prices.launch);
  const lowest30d = tranche && tranche.index > 0 ? formatLaunchPrice(offre?.lowestPrice30d, locale) : null;
  const launchSoldOut = !!tranche && !tranche.purchasable;
  const fillPrice = (tpl: string, price: string) => tpl.replace("{price}", price);
  const nfSeats = new Intl.NumberFormat(locale);
  const fillSeats = (tpl: string, n: number) => tpl.replace("{seats}", nfSeats.format(n));
  const paliers = (offre?.paliers || []).filter((x) => formatLaunchPrice(x.price, locale));

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

  const plans = [
    {
      key: "monthly",
      label: p.monthly || "Mensuel",
      price: formatPrice(prices.monthly),
      unit: p.month || "/mois",
      sub: p.noCommitment || "Sans engagement",
      extra: null as string | null,
      badge: null as string | null,
      cta: p.ctaMonthly || "CHOISIR MENSUEL",
      featured: false,
    },
    {
      key: "yearly",
      label: p.yearly || "Annuel",
      price: formatPrice(prices.yearly),
      unit: p.year || "/an",
      sub: `${yearlyPerMonth}${p.month || "/mois"}`,
      extra: p.monthsSaved || "= 2 MOIS OFFERTS",
      badge: p.mostPopular || "LE PLUS POPULAIRE",
      cta: p.ctaYearly || "CHOISIR ANNUEL",
      featured: true,
    },
    {
      key: "biYearly",
      label: p.biYearly || "Bi-annuel",
      price: formatPrice(prices.biYearly),
      unit: "",
      sub: `${biYearlyPerMonth}${p.month || "/mois"}`,
      extra: `${(p.savingsBiYearly || "Économisez").replace(/[0-9€$R.,]/g, "").trim()} ${biYearlySavings}`,
      badge: p.bestOffer || "MEILLEURE OFFRE",
      cta: p.ctaBiYearly || "CHOISIR BI-ANNUEL",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-[#0D0630] relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-40 -translate-x-1/2 w-[900px] max-w-full h-[520px] bg-[radial-gradient(closest-side,rgba(190,242,33,.07),transparent)]" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight">
            {title || "Des prix simples, sans frais cachés"}
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            {subtitle || "Choisissez le plan qui correspond à votre croissance."}
          </p>
        </ScrollReveal>

        {/* Offre de lancement — deux colonnes : l'urgence à gauche (places,
            paliers, chrono), le prix et l'action à droite. Prix, places et
            paliers lus en direct ; chrono seulement si une vraie date limite
            est fixée dans Admin › Lancement. */}
        <ScrollReveal className="mb-8">
          <div className="rounded-[26px] p-px bg-[linear-gradient(135deg,#BEF221_0%,rgba(190,242,33,.3)_35%,rgba(190,242,33,.06)_65%,rgba(190,242,33,.5)_100%)]">
            <div className="relative overflow-hidden rounded-[25px] bg-[linear-gradient(160deg,#170d4a_0%,#0D0630_65%)] grid md:grid-cols-[1.15fr_1fr]">
              <div aria-hidden="true" className="pointer-events-none absolute -top-1/2 -left-1/4 w-2/3 h-full bg-[radial-gradient(closest-side,rgba(190,242,33,.13),transparent)]" />

              {/* Gauche — l'offre et son urgence */}
              <div className="relative px-6 pt-8 pb-6 md:p-10 flex flex-col gap-6 text-center md:text-left">
                <span className="self-center md:self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#BEF221] text-[#0D0630] text-[11px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D0630] animate-pulse" />
                  {p.launchOfferBadge || "OFFRE LIMITÉE"}
                </span>
                <h3 className="text-2xl md:text-[34px] font-black text-white tracking-tight leading-[1.1] text-balance">
                  {paliers.length > 1
                    ? (p.launchTiersTitle || "Accès à vie. Le prix monte à chaque palier.")
                    : (p.launchSingleTitle || "Robi Pro à vie. Un seul paiement.")}
                </h3>

                {paliers.length > 1 ? (
                  <div className="grid grid-cols-3 gap-2 text-left">
                    {paliers.map((pa) => {
                      const courant = pa.index === tranche?.index;
                      const passe = tranche ? pa.index < tranche.index : false;
                      const pct = pa.seats ? Math.min(100, Math.round((pa.sold / pa.seats) * 100)) : 0;
                      return (
                        <div key={pa.index} className={`rounded-xl border px-3 py-2.5 flex flex-col gap-2 ${courant ? "border-[#BEF221] bg-[#BEF221]/10" : "border-white/10 bg-black/20 opacity-55"}`}>
                          <span className={`text-lg font-black ${passe ? "line-through text-white/50" : "text-white"}`}>{formatLaunchPrice(pa.price, locale)}</span>
                          <span className="h-1 rounded-full bg-white/10 overflow-hidden"><span className="block h-full rounded-full bg-[#BEF221]" style={{ width: `${passe ? 100 : pct}%` }} /></span>
                          <span className={`text-[11px] leading-tight ${courant ? "text-[#BEF221] font-bold" : "text-white/50"}`}>
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
                    className="md:!mx-0 !max-w-md w-full"
                    remainingText={p.launchOfferRemaining || "{remaining} places restantes sur {total}"}
                    trancheText={p.launchOfferTranche || "{remaining} places restantes à {price}"}
                    nextText={p.launchOfferNext || "ensuite {price}"}
                    deadlineText={p.launchOfferDeadline || "jusqu'au {date}"}
                  />
                )}

                {chrono && (
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <span className="text-white/55 text-[11px] font-bold uppercase tracking-widest">{p.launchEndsIn || "L'offre se termine dans"}</span>
                    <div className="flex items-start gap-1.5 font-mono font-bold tabular-nums">
                      {chrono.map((u, i) => (
                        <div key={u.l} className="flex items-start gap-1.5">
                          {i > 0 && <span className="text-white/30 text-lg pt-1">:</span>}
                          <div className="flex flex-col items-center">
                            <span className="text-xl text-white bg-white/[.06] border border-white/10 rounded-lg px-2 py-1 min-w-[2.4em] text-center">{u.v}</span>
                            <span className="font-sans text-[9px] tracking-widest uppercase text-white/40 mt-1">{u.l}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Droite — le prix et l'action */}
              <div className="relative m-3 mt-0 md:m-3 rounded-[20px] bg-black/30 border border-white/10 px-6 py-7 md:px-8 md:py-9 flex flex-col justify-center gap-5 text-center">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-white/45 text-sm">
                    {p.launchOfferNormalPrice || "Prix normal"} <span className="line-through">{formatPrice(prices.normal)}</span>
                  </p>
                  <span className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none py-1">{launchLabel}</span>
                  <p className="text-[#BEF221] font-bold">{p.launchOnce || "Une fois. Pour toujours."}</p>
                  <p className="text-white/50 text-xs">{p.launchOfferLifetime || "Accès à vie • Robi Pro"}</p>
                </div>

                {lowest30d && (
                  // Obligation Omnibus dès qu'un prix a monté : le plus bas des 30 derniers jours.
                  <p className="text-white/40 text-[11px]">
                    {fillPrice(p.launchOfferLowest || "Prix le plus bas pratiqué ces 30 derniers jours : {price}", lowest30d)}
                  </p>
                )}
                {launchSoldOut ? (
                  <p className="text-white/70 font-bold">
                    {p.launchOfferSoldOut || "Toutes les places à ce prix sont parties."}
                  </p>
                ) : (
                  <Button
                    href="https://go.robi-app.com/?signup"
                    variant="primary"
                    className="w-full font-black tracking-wider !text-sm shadow-[0_18px_50px_-18px_rgba(190,242,33,.6)]"
                  >
                    {p.launchOfferCta ? `${p.launchOfferCta} (${launchLabel})` : `PROFITER DE L'OFFRE (${launchLabel})`}
                  </Button>
                )}
                <p className="text-white/40 text-[11px] -mt-1">{p.launchFine || "Paiement unique · sans abonnement caché"}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Abonnements — cartes compactes : les fonctionnalités sont les
            mêmes partout, elles sont listées une seule fois en dessous. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 pt-3">
          {plans.map((plan) => (
            <ScrollReveal key={plan.key}>
              <div className={`relative h-full flex flex-col rounded-2xl p-6 ${plan.featured ? "border-2 border-[#BEF221] bg-[#BEF221]/[.06]" : "border border-white/10 bg-white/[.04]"}`}>
                {plan.badge && (
                  <span className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${plan.featured ? "bg-[#BEF221] text-[#0D0630]" : "bg-[#1a1040] border border-white/20 text-white"}`}>
                    {plan.badge}
                  </span>
                )}
                <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${plan.featured ? "text-[#BEF221]" : "text-white/50"}`}>
                  {plan.label}
                </p>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-4xl md:text-[44px] font-black text-white tracking-tight leading-none">{plan.price}</span>
                  {plan.unit && <span className="text-white/50 text-sm">{plan.unit}</span>}
                </div>
                <p className="text-white/55 text-sm mt-2">{plan.sub}</p>
                <div className="min-h-[28px] mt-2 mb-6">
                  {plan.extra && (
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-black ${plan.featured ? "bg-[#BEF221] text-[#0D0630]" : "bg-[#BEF221]/10 text-[#BEF221]"}`}>
                      {plan.extra}
                    </span>
                  )}
                </div>
                <Button
                  href="https://go.robi-app.com/?signup"
                  variant={plan.featured ? "primary" : "outline"}
                  className={`mt-auto w-full font-black tracking-wider !text-sm ${plan.featured ? "" : "!border-white/30 !text-white hover:!bg-white hover:!text-[#0D0630]"}`}
                >
                  {plan.cta}
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-5">
          <div className="rounded-2xl border border-white/10 bg-white/[.03] px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest md:max-w-[9rem] shrink-0">
              {p.includedTitle || "Inclus dans toutes les formules"}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5 flex-1">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-white/75">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#BEF221] shrink-0">
                    <Check className="w-3 h-3 text-[#0D0630]" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
