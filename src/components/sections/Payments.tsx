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
    <section id="payments" className="py-8 md:py-14 lg:py-24 bg-gray-50 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#BEF221]/[0.06] rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-16 lg:gap-24">
          {/* Payment Methods Visual */}
          <ScrollReveal className="flex-1 w-full max-w-xl">
            <div className="bg-white p-4 md:p-8 lg:p-12 rounded-xl md:rounded-3xl lg:rounded-[3.5rem] relative group border border-gray-200 hover:border-[#BEF221]/20 transition-all duration-500 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#BEF221]/10 blur-3xl rounded-full" />

              <div className="relative text-center">
                <h3 className="text-gray-400 text-xs md:text-sm font-black uppercase tracking-widest mb-4 md:mb-8 lg:mb-14">
                  {t.integrations}
                </h3>

                <div className="grid grid-cols-2 gap-2 md:gap-4 lg:gap-6 mb-4 md:mb-8 lg:mb-12">
                  {/* CB / Carte Bancaire */}
                  <div className="flex items-center gap-2 md:gap-3 lg:gap-4 p-2 md:p-3 lg:p-5 rounded-lg md:rounded-xl lg:rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#BEF221]/30 transition-all duration-300 group/item">
                    <div className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-white rounded-lg md:rounded-xl border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0">
                      <CreditCard className="w-5 h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-[#0D0630]" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-gray-900 font-bold text-sm md:text-base">CB</div>
                      <div className="text-gray-400 text-xs">Carte Bancaire</div>
                    </div>
                  </div>

                  {/* Visa */}
                  <div className="flex items-center gap-2 md:gap-3 lg:gap-4 p-2 md:p-3 lg:p-5 rounded-lg md:rounded-xl lg:rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#BEF221]/30 transition-all duration-300 group/item">
                    <div className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-[#1A1F71] rounded-lg md:rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-white font-black italic text-xs md:text-sm tracking-tighter">VISA</span>
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-gray-900 font-bold text-sm md:text-base">Visa</div>
                      <div className="text-gray-400 text-xs">Credit & Debit</div>
                    </div>
                  </div>

                  {/* Apple Pay */}
                  <div className="flex items-center gap-2 md:gap-3 lg:gap-4 p-2 md:p-3 lg:p-5 rounded-lg md:rounded-xl lg:rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#BEF221]/30 transition-all duration-300 group/item">
                    <div className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-black rounded-lg md:rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <Apple className="w-5 h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-gray-900 font-bold text-sm md:text-base">Apple Pay</div>
                      <div className="text-gray-400 text-xs">Sans contact</div>
                    </div>
                  </div>

                  {/* PayPal */}
                  <div className="flex items-center gap-2 md:gap-3 lg:gap-4 p-2 md:p-3 lg:p-5 rounded-lg md:rounded-xl lg:rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#BEF221]/30 transition-all duration-300 group/item">
                    <div className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-[#003087] rounded-lg md:rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-white font-black text-xs">PP</span>
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-gray-900 font-bold text-sm md:text-base">PayPal</div>
                      <div className="text-gray-400 text-xs">Paiement sécurisé</div>
                    </div>
                  </div>
                </div>

                {/* Powered by Stripe & PayPal */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 lg:gap-6 pt-4 md:pt-5 lg:pt-6 border-t border-gray-100">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{t.poweredBy}</span>
                  <div className="flex items-center gap-1.5 text-[#635BFF] font-black text-sm md:text-base lg:text-lg tracking-tight">
                    <Smartphone className="w-4 h-4 md:w-5 md:h-5" />
                    Stripe
                  </div>
                  <div className="hidden md:block w-px h-5 bg-gray-200" />
                  <div className="text-[#003087] font-black text-sm md:text-base lg:text-lg tracking-tight">
                    PayPal
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Text Content */}
          <ScrollReveal className="flex-1 text-left" delay={200}>
            <h2 className="text-lg md:text-2xl lg:text-3xl font-black text-gray-900 mb-3 md:mb-6 lg:mb-8 leading-[1.1] tracking-tight">
              {t.title}
            </h2>
            <p className="text-xs md:text-base lg:text-xl text-gray-500 leading-relaxed mb-4 md:mb-8 lg:mb-10 max-w-lg font-medium">
              {t.subtitle}
            </p>
            <Button
              href={`/${locale}/features/paiement-en-ligne`}
              size="sm"
              className="inline-flex !text-xs !px-5 !py-2.5 md:!px-8 md:!py-4 md:!text-lg"
            >
              {t.cta}
              <ArrowRight className="ml-1.5 w-3.5 h-3.5 md:w-5 md:h-5" />
            </Button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
