"use client";

import { Activity, Calendar, TrendingUp } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CountUp } from "@/components/ui/CountUp";
import { SALES_PAID, SALES_PENDING, SALES_SCALE, getHeroDeviceCopy } from "@/lib/i18n/heroDevice";
import { GLASS, H2, LEAD, SECTION, money } from "./shared";

interface DashboardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  locale?: string;
}

/**
 * Suivi et impayés : le dashboard réel de l'app (le même que dans le héros,
 * après le paiement de Maison Laurent). Les chiffres comptent et les barres
 * poussent quand le module entre à l'écran. Visible aussi sur mobile.
 */
export function Dashboard({ dict, locale = "fr" }: DashboardProps) {
  const d = dict.dashboard;
  const demo = getHeroDeviceCopy(locale);
  const revenue = demo.goalFrom + demo.scenarios[0].amount;
  const pct = Math.round((revenue / demo.goalTotal) * 100);
  const paid = [...SALES_PAID, revenue];
  const salesTotal = paid.reduce((sum, v) => sum + v, 0);

  return (
    <section className={`${SECTION} bg-white overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <ScrollReveal>
            <h2 className={`${H2} text-[#0D0630]`}>{d.title}</h2>
            <p className={`${LEAD} mt-5 text-gray-600`}>{d.description}</p>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className={`${GLASS} relative mx-auto max-w-md overflow-hidden p-5 md:p-7 text-white`}>
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(190,242,33,0.20), rgba(190,242,33,0) 70%)" }} aria-hidden="true" />
              <div className="relative space-y-3">
                <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#101540] p-5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-12" style={{ background: "linear-gradient(90deg, rgba(190,242,33,0.8), rgba(190,242,33,0))" }} aria-hidden="true" />
                  <div className="relative">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{demo.dashboard.revenueMonth}</div>
                    <div className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
                      <CountUp value={revenue} format={(n) => money(demo.locale, Math.round(n), 0)} />
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="home-fill h-full rounded-full bg-[#BEF221] shadow-[0_0_16px_rgba(190,242,33,0.55)]" style={{ "--w": `${pct}%` } as React.CSSProperties} />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] font-bold text-white/60">
                      <span>{demo.dashboard.goal} · {money(demo.locale, demo.goalTotal, 0)}</span>
                      <span className="text-[#BEF221] tabular-nums">{pct} %</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] border border-[#f5c45b]/25 bg-[#2a1b2e] p-4 text-center">
                    <div className="text-3xl font-black text-[#f0b43a]">3</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#f0b43a]">{demo.dashboard.pendingInvoices}</div>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-[#101540] p-4 text-center">
                    <div className="text-3xl font-black">1</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/70">{demo.dashboard.openQuotes}</div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-white/10 bg-[#101540] p-5 pb-7">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-white/10"><TrendingUp className="h-3.5 w-3.5" /></span>
                      {demo.dashboard.sales12m}
                    </span>
                    <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-extrabold tabular-nums">{money(demo.locale, salesTotal, 0)}</span>
                  </div>
                  <div className="mt-4 flex h-24 items-end gap-1.5 border-b border-dashed border-white/15" aria-hidden="true">
                    {paid.map((value, i) => (
                      <span key={i} className="relative flex h-full flex-1 flex-col items-center justify-end">
                        {/* En attente (gris) empilé sur l'encaissé (lime), comme dans l'app. */}
                        <i className="home-bar block w-[70%] rounded-t bg-white/25" style={{ height: `${(SALES_PENDING[i] / SALES_SCALE) * 100}%`, "--i": i } as React.CSSProperties} />
                        <i className={`home-bar block w-[70%] ${SALES_PENDING[i] ? "" : "rounded-t"} ${i === 11 ? "bg-[#BEF221] shadow-[0_0_14px_rgba(190,242,33,0.5)]" : "bg-[#BEF221]/70"}`} style={{ height: `${(value / SALES_SCALE) * 100}%`, "--i": i } as React.CSSProperties} />
                        <small className="absolute -bottom-5 text-[8px] font-semibold text-white/40">{demo.dashboard.months[i]}</small>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] border border-white/10 bg-[#101540] p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70"><Calendar className="h-3 w-3" />{demo.dashboard.goal}</div>
                    <div className="mt-2 text-2xl font-black tabular-nums">{pct} %</div>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-[#101540] p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70"><Activity className="h-3 w-3" />{demo.dashboard.avgMonth}</div>
                    <div className="mt-2 text-2xl font-black tabular-nums">{money(demo.locale, Math.round(salesTotal / 12), 0)}</div>
                  </div>
                </div>
                <p className="sr-only">{d.revenueChart}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
