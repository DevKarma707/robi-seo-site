"use client";

import { Check, Eye, FileText, PenTool, Send } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getHeroDeviceCopy } from "@/lib/i18n/heroDevice";
import { GLASS, H2, LEAD, SECTION, money, today } from "./shared";

interface QuoteSignatureProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  locale?: string;
}

/**
 * Signature des devis : l'historique réel de l'app (créé, envoyé, e-mail
 * ouvert, signé) dans une carte verre sombre ; la signature se trace quand
 * le module entre à l'écran. Même devis que le héros (Atelier Dubois).
 */
export function QuoteSignature({ dict, locale = "fr" }: QuoteSignatureProps) {
  const qs = dict.quoteSignature;
  const demo = getHeroDeviceCopy(locale);
  const sc = demo.scenarios[1];
  const day = today(demo.locale);
  const when = (time: string) => `${demo.detail.on} ${day} ${demo.detail.at} ${time}`;
  const steps = [
    { icon: FileText, label: sc.created, time: "20:12" },
    { icon: Send, label: sc.sent, time: "20:13" },
    { icon: Eye, label: demo.detail.emailOpen, time: "20:30" },
    { icon: PenTool, label: qs.stepSigned, time: "20:41", done: true },
  ];

  return (
    <section className={`${SECTION} bg-gray-50 overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <ScrollReveal className="relative order-2 lg:order-1">
            <div className={`${GLASS} relative mx-auto max-w-md overflow-hidden p-6 md:p-8 text-white`}>
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(190,242,33,0.22), rgba(190,242,33,0) 70%)" }} aria-hidden="true" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-white/50">{sc.docLabel} {sc.number}</div>
                    <div className="mt-1 text-xl font-extrabold tracking-tight">{sc.client}</div>
                  </div>
                  <div className="text-right text-xl font-black tabular-nums">{money(demo, sc.amount)}</div>
                </div>

                <ol className="mt-6 space-y-3">
                  {steps.map((step, i) => (
                    <li key={i} className={`home-rise flex items-center gap-3 rounded-2xl border p-3 ${step.done ? "border-[#BEF221]/50 bg-[#BEF221]/10" : "border-white/10 bg-white/[0.05]"}`} style={{ "--i": i } as React.CSSProperties}>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${step.done ? "bg-[#BEF221] text-[#0D0630]" : "bg-white/10 text-[#BEF221]"}`}>
                        <step.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">{step.label}</span>
                        <span className="block text-[11px] text-white/50 tabular-nums">{when(step.time)}</span>
                      </span>
                      {step.done && <Check className="h-4 w-4 text-[#BEF221]" strokeWidth={3} />}
                    </li>
                  ))}
                </ol>

                {/* La signature se trace */}
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-[#0D0630]">
                  <div>
                    <div className="text-sm font-extrabold">{qs.signedRemotely}</div>
                    <div className="text-[11px] text-gray-500">{sc.client}</div>
                  </div>
                  <svg width="120" height="44" viewBox="0 0 120 44" fill="none" aria-hidden="true">
                    <path className="home-draw" pathLength={1} d="M6 32 C 14 10, 24 6, 30 22 C 34 34, 42 36, 48 20 C 52 9, 60 10, 62 24 C 64 34, 74 30, 80 18 C 86 8, 96 14, 114 12" stroke="#0D0630" strokeWidth="2.6" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="order-1 lg:order-2" delay={120}>
            <h2 className={`${H2} text-[#0D0630]`}>{qs.title}</h2>
            <p className={`${LEAD} mt-5 text-gray-600`}>{qs.description}</p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
