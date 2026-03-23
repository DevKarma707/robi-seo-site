"use client";

import { ArrowRight, CreditCard, Apple, Smartphone } from "lucide-react";
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
    poweredBy: "Propulsé par",
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

                <div className="grid grid-cols-2 gap-6 mb-12">
                  {/* CB / Carte Bancaire */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#BEF221]/30 transition-all duration-300 group/item">
                    <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
                      <CreditCard className="w-6 h-6 text-[#0D0630]" />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-900 font-bold text-base">CB</div>
                      <div className="text-gray-400 text-xs">Carte Bancaire</div>
                    </div>
                  </div>

                  {/* Visa */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#BEF221]/30 transition-all duration-300 group/item">
                    <div className="w-12 h-12 bg-[#1A1F71] rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white font-black italic text-sm tracking-tighter">VISA</span>
                    </div>
                    <div className="text-left">
                      <div className="text-gray-900 font-bold text-base">Visa</div>
                      <div className="text-gray-400 text-xs">Credit & Debit</div>
                    </div>
                  </div>

                  {/* Apple Pay */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#BEF221]/30 transition-all duration-300 group/item">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-sm">
                      <Apple className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-900 font-bold text-base">Apple Pay</div>
                      <div className="text-gray-400 text-xs">Sans contact</div>
                    </div>
                  </div>

                  {/* PayPal */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#BEF221]/30 transition-all duration-300 group/item">
                    <div className="w-12 h-12 bg-[#003087] rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white font-black text-xs">PP</span>
                    </div>
                    <div className="text-left">
                      <div className="text-gray-900 font-bold text-base">PayPal</div>
                      <div className="text-gray-400 text-xs">Paiement sécurisé</div>
                    </div>
                  </div>
                </div>

                {/* Powered by Stripe & PayPal */}
                <div className="flex items-center justify-center gap-6 pt-6 border-t border-gray-100">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{t.poweredBy}</span>
                  <div className="flex items-center gap-1.5 text-[#635BFF] font-black text-lg tracking-tight">
                    <Smartphone className="w-5 h-5" />
                    Stripe
                  </div>
                  <div className="w-px h-5 bg-gray-200" />
                  <div className="text-[#003087] font-black text-lg tracking-tight">
                    PayPal
                  </div>
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
