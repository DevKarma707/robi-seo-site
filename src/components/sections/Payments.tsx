import { ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
    <section id="payments" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          {/* Payment Methods Visual */}
          <div className="flex-1 w-full max-w-xl">
            <div className="bg-[#0D0630] p-12 rounded-[3.5rem] relative group border-4 border-[#BEF221]/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#BEF221]/10 blur-3xl rounded-full" />

              <div className="relative text-center">
                <h3 className="text-white/40 text-sm font-black uppercase tracking-widest mb-14">
                  {t.integrations}
                </h3>

                <div className="grid grid-cols-3 gap-y-12 gap-x-8 items-center justify-items-center mb-16">
                  <div className="text-white font-black italic tracking-tighter text-3xl opacity-80 hover:opacity-100 transition-opacity">
                    VISA
                  </div>
                  <div className="flex">
                    <div className="w-10 h-10 bg-white/10 rounded-full border border-white/20 flex items-center justify-center">
                      <div className="w-5 h-5 bg-[#EB001B] rounded-full translate-x-1.5 opacity-80" />
                      <div className="w-5 h-5 bg-[#F79E1B] rounded-full -translate-x-1.5 opacity-80" />
                    </div>
                  </div>
                  <div className="text-white font-black text-xl italic tracking-tighter opacity-80 hover:opacity-100 transition-opacity leading-none">
                    AMEX
                  </div>

                  <div className="flex items-center gap-2 text-white font-bold text-2xl group cursor-default">
                    <div className="w-8 h-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#BEF221]" />
                    </div>
                    <span>Pay</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold text-2xl opacity-80 hover:opacity-100 transition-opacity">
                    <span className="text-white">G</span>
                    <span>Pay</span>
                  </div>
                  <div className="text-center group cursor-default">
                    <div className="text-white font-black text-2xl leading-none">
                      ACH
                    </div>
                    <div className="text-[8px] text-[#BEF221] font-black uppercase tracking-[0.3em] mt-1">
                      Transfer
                    </div>
                  </div>

                  <div className="text-white/40 font-black text-sm italic tracking-widest hover:text-white transition-colors cursor-default capitalize">
                    Klarna.
                  </div>
                  <div className="text-white font-black text-3xl tracking-tighter">
                    S
                    <span className="text-[#BEF221] underline decoration-2 underline-offset-4 font-serif">
                      €
                    </span>
                    PA
                  </div>
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-[#BEF221] transition-all group">
                    <ArrowRight className="w-6 h-6 text-white group-hover:text-[#0D0630] transition-colors" />
                  </div>
                </div>

                <div className="bg-[#BEF221] text-[#0D0630] font-black py-5 rounded-2xl text-xl shadow-[0_20px_40px_-10px_rgba(190,242,33,0.4)] transform hover:scale-[1.03] transition-all cursor-pointer border border-[#BEF221]/20 flex items-center justify-center">
                  Connect account
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 text-left">
            <h2 className="text-4xl md:text-5xl font-black text-[#0D0630] mb-8 leading-[1.1] tracking-tight">
              {t.title}
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-lg font-medium">
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
          </div>
        </div>
      </div>
    </section>
  );
}
