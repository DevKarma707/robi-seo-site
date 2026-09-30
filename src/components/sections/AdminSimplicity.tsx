"use client";

import { Copy, Download, RefreshCw, XCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getHeroDeviceCopy } from "@/lib/i18n/heroDevice";
import { GLASS, H2, LEAD, SECTION, initials, money } from "./shared";

interface AdminSimplicityProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  locale?: string;
}

/**
 * Tâches administratives : la vraie liste de l'app (celle du héros) et
 * l'action « Convertir en facture » — le devis signé devient une facture.
 */
export function AdminSimplicity({ dict, locale = "fr" }: AdminSimplicityProps) {
  const ad = dict.adminSimplicity;
  const demo = getHeroDeviceCopy(locale);
  const quote = demo.scenarios[1];
  const invoice = demo.scenarios[0];
  const rows = [
    { client: quote.client, number: quote.number, amount: quote.amount, badge: "accepted" as const, active: true },
    ...quote.rows.map((r) => ({ ...r, active: false })),
  ];
  const badgeClass = (badge: string) =>
    badge === "accepted" || badge === "paid" ? "bg-[#BEF221] text-[#0D0630]"
    : badge === "late" ? "border border-[#f87171]/60 text-[#f87171]"
    : badge === "draft" ? "border border-white/25 text-white/70"
    : "bg-white/10 text-white/80";
  const actions = [
    { icon: RefreshCw, label: ad.convertToInvoice, highlight: true },
    { icon: Copy, label: ad.duplicate },
    { icon: XCircle, label: ad.markRefused },
    { icon: Download, label: ad.export },
  ];

  return (
    <section className={`${SECTION} bg-white overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <ScrollReveal>
            <h2 className={`${H2} text-[#0D0630]`}>{ad.title}</h2>
            <p className={`${LEAD} mt-5 text-gray-600`}>{ad.description}</p>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className={`${GLASS} relative mx-auto max-w-md overflow-hidden p-5 md:p-7 text-white`}>
              <div className="pointer-events-none absolute -left-24 -bottom-28 h-64 w-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(24,49,79,0.95), rgba(24,49,79,0) 70%)" }} aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold tracking-tight">{demo.list.quotes}</h3>
                  <span className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] text-white/45">{demo.list.search}</span>
                </div>

                <div className="mt-4 space-y-2">
                  {rows.map((row, i) => (
                    <div key={row.number} className={`home-rise flex items-center gap-3 rounded-2xl border p-3 ${row.active ? "border-[#BEF221]/50 bg-[#BEF221]/[0.08]" : "border-white/10 bg-white/[0.04]"}`} style={{ "--i": i } as React.CSSProperties}>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-bold text-white/70">{initials(row.client)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{row.client}</span>
                        <span className="block text-[10px] font-bold tracking-wider text-white/40">{row.number}</span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-extrabold tabular-nums">{money(demo.locale, row.amount)}</span>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${badgeClass(row.badge)}`}>{demo.badges[row.badge]}</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Le menu d'actions, puis la facture née du devis */}
                <div className="home-rise mt-3 rounded-2xl bg-white p-2 text-[#0D0630] shadow-xl" style={{ "--i": 3 } as React.CSSProperties}>
                  {actions.map((action, i) => (
                    <div key={i} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] ${action.highlight ? "bg-[#0D0630] font-bold text-white" : "text-gray-600"}`}>
                      <action.icon className={`h-3.5 w-3.5 ${action.highlight ? "text-[#BEF221]" : ""}`} />
                      {action.label}
                    </div>
                  ))}
                </div>
                <div className="home-rise mt-3 flex items-center gap-3 rounded-2xl border border-[#BEF221]/50 bg-[#BEF221] p-3 text-[#0D0630]" style={{ "--i": 5 } as React.CSSProperties}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0D0630] text-[11px] font-bold text-[#BEF221]">{initials(quote.client)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold">{invoice.created}</span>
                    <span className="block text-[10px] font-bold tracking-wider opacity-70">{invoice.number.replace(/\d+$/, "005")} · {quote.client}</span>
                  </span>
                  <span className="text-sm font-black tabular-nums">{money(demo.locale, quote.amount)}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
