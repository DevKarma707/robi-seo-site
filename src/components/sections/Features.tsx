"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BarChart3, Bot, Check, CreditCard, Mail, Mic, ShieldCheck, Zap } from "lucide-react";
import { getHeroDeviceCopy } from "@/lib/i18n/heroDevice";
import { H2, LEAD, SECTION } from "./shared";

interface FeaturesProps {
  title?: string;
  titleAccent?: string;
  subtitle?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  locale?: string;
}

/**
 * « Tous les outils » en grille bento : deux grandes tuiles (la dictée et
 * la conformité Factur-X, l'angle n°1 du site) puis quatre petites.
 */
export function Features({ title = "", titleAccent, subtitle, dict, locale = "fr" }: FeaturesProps) {
  const f = dict.features;
  const demo = getHeroDeviceCopy(locale);
  const small = [
    { icon: Zap, ...f.automation },
    { icon: CreditCard, ...f.payments },
    { icon: Mail, ...f.emails },
    { icon: BarChart3, ...f.dashboard },
  ];

  return (
    <section id="features" className={`${SECTION} bg-gray-50 relative`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className={`${H2} text-[#0D0630]`}>
            {title}{" "}
            {titleAccent && (
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">{titleAccent}</span>
                <span className="absolute inset-x-0 bottom-1 h-3 rounded bg-[#BEF221] md:h-4" aria-hidden="true" />
              </span>
            )}
          </h2>
          {subtitle && subtitle.trim().length > 1 && <p className={`${LEAD} mt-4 text-gray-500`}>{subtitle}</p>}
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-12">
          {/* Dictée */}
          <ScrollReveal className="col-span-2 lg:col-span-7">
            <div className="group relative h-full overflow-hidden rounded-[28px] bg-[#0D0630] p-6 md:p-9 text-white transition-transform duration-500 hover:-translate-y-1">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(190,242,33,0.22), rgba(190,242,33,0) 70%)" }} aria-hidden="true" />
              <div className="relative grid gap-6 md:grid-cols-[1fr_1.05fr] md:items-center">
                <div>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#BEF221] text-[#0D0630]"><Bot className="h-6 w-6" strokeWidth={2.2} /></span>
                  <h3 className="mt-5 text-2xl font-extrabold tracking-tight md:text-3xl">{f.aiInvoicing.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65 md:text-base">{f.aiInvoicing.description}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70"><Mic className="h-3.5 w-3.5 text-[#BEF221]" />{demo.youSay}</span>
                    <span className="flex items-end gap-[2px]" aria-hidden="true">
                      {[6, 12, 18, 9, 15, 7, 13, 10].map((h, i) => <i key={i} className="home-bar block w-[2px] rounded bg-[#BEF221]" style={{ height: h, "--i": i } as React.CSSProperties} />)}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm font-medium leading-snug">« {demo.scenarios[0].prompt} »</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-[#BEF221] px-3 py-2 text-[12px] font-semibold text-[#0D0630]">{demo.scenarios[0].reply}</div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Conformité Factur-X */}
          <ScrollReveal className="col-span-2 lg:col-span-5" delay={100}>
            <div className="relative h-full overflow-hidden rounded-[28px] border border-gray-200 bg-white p-6 md:p-9 transition-transform duration-500 hover:-translate-y-1">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0D0630] text-[#BEF221]"><ShieldCheck className="h-6 w-6" /></span>
              <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-[#0D0630] md:text-3xl">{f.compliant.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500 md:text-base">{f.compliant.description}</p>
              {demo.facturX && <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0D0630] px-3.5 py-2 text-xs font-bold text-white">
                  <span className="h-3 w-[18px] rounded-[3px]" style={{ background: "linear-gradient(90deg,#0055a4 0 33.4%,#fff 33.4% 66.7%,#ef4135 66.7%)" }} aria-hidden="true" />
                  Factur-X
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-2 text-xs font-bold text-[#0D0630]"><Check className="h-3.5 w-3.5 text-[#5b7a00]" strokeWidth={3} />EN 16931</span>
              </div>}
            </div>
          </ScrollReveal>

          {small.map((item, index) => (
            <ScrollReveal key={index} className="col-span-1 lg:col-span-3" delay={160 + index * 80}>
              <div className="h-full rounded-[24px] border border-gray-200 bg-white p-4 md:p-7 transition-transform duration-500 hover:-translate-y-1">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#BEF221]/20 text-[#0D0630] md:h-11 md:w-11"><item.icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-[15px] font-extrabold leading-tight tracking-tight text-[#0D0630] md:text-lg">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500 md:text-sm">{item.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
