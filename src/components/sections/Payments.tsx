"use client";

import { ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface PaymentsProps {
  dict?: any;
  locale?: string;
}

const defaultDict = {
  payments: {
    title: "Simplifiez vos transactions avec PayPal & Stripe",
    subtitle:
      "Dites adieu aux retards de paiement. Proposez une expérience de paiement fluide et moderne à vos clients.",
    cta: "Voir les paiements en ligne",
    integrations: "Intégrations :",
  },
};

export function Payments({ dict = defaultDict, locale = "fr" }: PaymentsProps) {
  const t = dict.payments || defaultDict.payments;

  return (
    <section id="payments" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#BEF221]/[0.06] rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          {/* Payment Methods Visual */}
          <ScrollReveal className="flex-1 w-full max-w-xl">
            <div className="bg-white p-12 rounded-[3.5rem] relative group border border-gray-200 hover:border-[#BEF221]/20 transition-all duration-500 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#BEF221]/10 blur-3xl rounded-full" />

              <div className="relative text-center">
                <h3 className="text-gray-400 text-sm font-black uppercase tracking-widest mb-14">
                  {t.integrations}
                </h3>

                <div className="grid grid-cols-3 gap-y-12 gap-x-8 items-center justify-items-center mb-16">
                  <div className="text-gray-900 font-black italic tracking-tighter text-3xl opacity-60 hover:opacity-100 hover:text-[#BEF221] transition-all duration-300">
                    VISA
                  </div>
                  <div className="flex">
                    <div className="w-10 h-10 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center">
                      <div className="w-5 h-5 bg-[#EB001B] rounded-full translate-x-1.5 opacity-80" />
                      <div className="w-5 h-5 bg-[#F79E1B] rounded-full -translate-x-1.5 opacity-80" />
                    </div>
                  </div>
                  <div className="text-gray-900 font-black text-xl italic tracking-tighter opacity-60 hover:opacity-100 hover:text-[#BEF221] transition-all duration-300 leading-none">
                    AMEX
                  </div>

                  <div className="flex items-center gap-2 text-gray-900 font-bold text-2xl group cursor-default">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#BEF221]" />
                    </div>
                    <span>Pay</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-2xl opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-gray-900">G</span>
                    <span>Pay</span>
                  </div>
                  <div className="text-center group cursor-default">
                    <div className="text-gray-900 font-black text-2xl leading-none">
                      ACH
                    </div>
                    <div className="text-[8px] text-[#BEF221] font-black uppercase tracking-[0.3em] mt-1">
                      Transfer
                    </div>
                  </div>

                  <div className="text-gray-400 font-black text-sm italic tracking-widest hover:text-[#BEF221] transition-colors duration-300 cursor-default capitalize">
                    Klarna.
                  </div>
                  <div className="text-gray-900 font-black text-3xl tracking-tighter">
                    S
                    <span className="text-[#BEF221] underline decoration-2 underline-offset-4 font-serif">
                      €
                    </span>
                    PA
                  </div>
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-200 hover:bg-[#BEF221] transition-all duration-300 group/arrow">
                    <ArrowRight className="w-6 h-6 text-gray-900 group-hover/arrow:text-[#0D0630] transition-colors" />
                  </div>
                </div>

                <div className="bg-[#BEF221] text-[#0D0630] font-black py-5 rounded-2xl text-xl shadow-[0_20px_40px_-10px_rgba(190,242,33,0.4)] transform hover:scale-[1.03] transition-all cursor-pointer flex items-center justify-center">
                  Connect account
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Text Content */}
          <ScrollReveal className="flex-1 text-left" delay={200}>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
              {t.title}
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-lg font-medium">
              {t.subtitle}
            </p>
            <Button
              href={`/${locale}/features/paiement-en-ligne`}
              size="lg"
              className="inline-flex"
            >
              {t.cta}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
