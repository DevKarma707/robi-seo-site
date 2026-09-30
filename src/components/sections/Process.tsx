"use client";

import { Bot, Check, Mic, Send, BellRing } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getHeroDeviceCopy } from "@/lib/i18n/heroDevice";
import { H2, LEAD, SECTION, money } from "./shared";

interface ProcessProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any;
  locale?: string;
}

/**
 * « De A à Z » : quatre étapes reliées par une ligne lime qui se dessine.
 * Chaque étape montre un vrai fragment de l'app, repris du héros (même
 * client, même montant). Sur mobile, les étapes défilent au doigt.
 */
export function Process({ dict, locale = "fr" }: ProcessProps) {
  const t = dict.process;
  const demo = getHeroDeviceCopy(locale);
  const sc = demo.scenarios[0];
  const amount = money(demo.locale, sc.amount);

  const steps = [
    {
      title: t.step1.title, description: t.step1.description,
      visual: (
        <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-3.5 text-left">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/70"><Mic className="h-3 w-3 text-[#BEF221]" />{demo.youSay}</span>
            <span className="flex items-end gap-[2px]" aria-hidden="true">
              {[6, 11, 16, 9, 14, 7, 12].map((h, i) => <i key={i} className="block w-[2px] rounded bg-[#BEF221]" style={{ height: h }} />)}
            </span>
          </div>
          <p className="mt-2 text-[12px] font-medium leading-snug text-white">« {sc.prompt} »</p>
        </div>
      ),
    },
    {
      title: t.step2.title, description: t.step2.description,
      visual: (
        <div className="flex flex-col items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#BEF221] text-[#0D0630] shadow-[0_0_34px_rgba(190,242,33,0.55)]"><Send className="h-5 w-5" strokeWidth={2.4} /></span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white"><Check className="h-3 w-3 text-[#BEF221]" strokeWidth={3} />{sc.sentChip}</span>
        </div>
      ),
    },
    {
      title: t.step3.title, description: t.step3.description,
      visual: (
        <div className="flex items-center gap-3 rounded-2xl bg-white/95 p-3 text-left text-[#17102b]">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0D0630] text-[#BEF221]"><Bot className="h-6 w-6" strokeWidth={2.2} /></span>
          <span className="min-w-0">
            <span className="block text-[8px] font-bold uppercase tracking-wider text-[#5d5870]">{demo.app} · {demo.now}</span>
            <span className="block text-[13px] font-extrabold leading-tight">{sc.doneTitle}</span>
            <span className="block truncate text-[11px] font-medium text-[#3f3a55]">{sc.client} · {amount}</span>
          </span>
        </div>
      ),
    },
    {
      title: t.step4.title, description: t.step4.description,
      visual: (
        <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-3.5 text-left">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#BEF221]/15 text-[#BEF221]"><BellRing className="h-4 w-4" /></span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-bold text-white">{demo.scenarios[0].rows[2]?.client}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#f87171]">{demo.badges.late}</span>
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-white/60">{demo.sending[1]}</p>
        </div>
      ),
    },
  ];

  return (
    <section id="process" className={`${SECTION} bg-white relative overflow-hidden`}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className={`${H2} text-[#0D0630]`}>
            {t.title}{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">{t.titleAccent}</span>
              <span className="absolute inset-x-0 bottom-1 h-3 rounded bg-[#BEF221] md:h-4" aria-hidden="true" />
            </span>
          </h2>
          <p className={`${LEAD} mt-4 text-gray-500`}>{t.subtitle}</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative">
            {/* La ligne qui relie les étapes (bureau) */}
            <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[19px] hidden h-[2px] bg-gray-200 lg:block" aria-hidden="true">
              <div className="home-line h-full bg-[#BEF221]" />
            </div>
            <div className="home-snap -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0">
              {steps.map((step, index) => (
                <div key={index} className="home-rise w-[78%] shrink-0 sm:w-[46%] lg:w-auto" style={{ "--i": index } as React.CSSProperties}>
                  <div className="relative z-10 mx-auto mb-5 grid h-10 w-10 place-items-center rounded-full bg-[#0D0630] text-sm font-black text-[#BEF221] ring-8 ring-white lg:mx-auto">
                    {index + 1}
                  </div>
                  <div className="flex h-[150px] items-center justify-center rounded-[24px] bg-[#0D0630] p-5 shadow-[0_24px_60px_rgba(13,6,48,0.18)]">
                    <div className="w-full max-w-[250px]">{step.visual}</div>
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold tracking-tight text-[#0D0630] lg:text-xl">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500 lg:text-[15px]">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
