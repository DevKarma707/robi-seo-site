"use client";

import { Cloud, Lock, Server, ShieldCheck } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { H2, SECTION } from "./shared";

interface TrustProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

/**
 * Sécurité et conformité : carte verre à contour lime (plus d'aplat lime,
 * contraire à la charte), trois preuves lisibles, tout visible sur mobile.
 */
export function Trust({ dict }: TrustProps) {
  const tr = dict.trust;
  const proofs = [
    { icon: Server, title: tr.hostingTitle, description: tr.hostingDesc },
    { icon: Cloud, title: tr.cloudTitle, description: tr.cloudDesc },
    { icon: Lock, title: tr.encryptionTitle, description: tr.encryptionDesc },
  ];

  return (
    <section className={`${SECTION} bg-[#0D0630] relative overflow-hidden`}>
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(24,49,79,0.9), rgba(24,49,79,0))" }} aria-hidden="true" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className={`${H2} text-white`}>{tr.title}</h2>
        </ScrollReveal>

        <ScrollReveal className="mb-4 md:mb-6">
          <div className="relative overflow-hidden rounded-[28px] border border-[#BEF221]/55 bg-[rgba(24,49,79,0.55)] p-6 md:p-10 shadow-[0_0_80px_rgba(190,242,33,0.10)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full" style={{ background: "radial-gradient(circle, rgba(190,242,33,0.25), rgba(190,242,33,0) 70%)" }} aria-hidden="true" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#BEF221] text-[#0D0630]"><ShieldCheck className="h-7 w-7" /></span>
              <div className="max-w-2xl">
                <h3 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">{tr.mainTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70 md:text-base">{tr.mainDesc}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6">
            {proofs.map((proof, index) => (
              <div key={index} className="home-rise h-full rounded-[24px] border border-white/10 bg-white/[0.05] p-5 md:p-7" style={{ "--i": index } as React.CSSProperties}>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#BEF221]"><proof.icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-base font-extrabold tracking-tight text-white md:text-lg">{proof.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">{proof.description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
