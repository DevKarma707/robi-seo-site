"use client";

import { Apple, Bot, Check, CreditCard, Lock, Zap } from "lucide-react";
import { getHeroDeviceCopy } from "@/lib/i18n/heroDevice";
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

/** Libellés du visuel (lien de paiement), par langue. */
const labels: Record<string, { link: string; secure: string; invoice: string; total: string; pay: string; received: string }> = {
  fr: { link: "Lien de paiement", secure: "Paiement sécurisé", invoice: "Facture", total: "Total TTC", pay: "Payer", received: "Paiement reçu" },
  en: { link: "Payment link", secure: "Secure payment", invoice: "Invoice", total: "Total", pay: "Pay", received: "Payment received" },
  es: { link: "Enlace de pago", secure: "Pago seguro", invoice: "Factura", total: "Total", pay: "Pagar", received: "Pago recibido" },
  pt: { link: "Link de pagamento", secure: "Pagamento seguro", invoice: "Fatura", total: "Total", pay: "Pagar", received: "Pagamento recebido" },
};

export function Payments({ dict = defaultDict, locale = "fr" }: PaymentsProps) {
  const t = dict.payments || defaultDict.payments;
  const l = labels[locale.split("-")[0]] || labels.en;
  const demo = getHeroDeviceCopy(locale);
  const amount = new Intl.NumberFormat(demo.locale, { style: "currency", currency: demo.currency }).format(demo.scenarios[0].amount);

  return (
    <section id="payments" className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Ambient glow */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-16 lg:gap-24">
          {/* Visuel : un lien de paiement Robi, les moyens acceptés, le paiement qui arrive */}
          <ScrollReveal className="flex-1 w-full max-w-xl">
            <div className="relative">
              {/* Notification « Paiement reçu », qui flotte au coin de la carte */}
              <div
                className="absolute -top-5 right-2 md:-right-3 lg:-right-6 z-10 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_rgba(13,6,48,0.18)] border border-gray-100"
                style={{ animation: "float 6s ease-in-out infinite" }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#BEF221] text-[#0D0630]">
                  <Check className="h-5 w-5" strokeWidth={3} />
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-sm font-extrabold text-gray-900">{l.received}</span>
                  <span className="block text-xs font-semibold text-gray-500 tabular-nums">+ {amount}</span>
                </span>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] bg-[#0D0630] p-6 md:p-8 lg:p-10 text-white shadow-[0_30px_80px_rgba(13,6,48,0.35)] border border-white/10">
                <div
                  className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(190,242,33,0.28), rgba(190,242,33,0) 70%)" }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(24,49,79,0.9), rgba(24,49,79,0) 70%)" }}
                  aria-hidden="true"
                />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-white/80">
                      <Bot className="h-4 w-4 text-[#BEF221]" strokeWidth={2.2} />
                      {l.link}
                    </span>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] md:text-xs font-semibold text-white/60">
                      <Lock className="h-3.5 w-3.5 text-[#BEF221]" />
                      {l.secure}
                    </span>
                  </div>

                  {/* La facture à régler */}
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <div className="whitespace-nowrap text-[11px] font-bold uppercase tracking-widest text-white/50">{l.invoice} FAC-2026-004</div>
                        <div className="mt-1 text-lg font-extrabold tracking-tight">Maison Laurent</div>
                      </div>
                      <div className="flex items-baseline justify-between gap-3 sm:block sm:text-right">
                        <div className="text-[11px] font-bold uppercase tracking-widest text-white/50">{l.total}</div>
                        <div className="mt-1 text-2xl lg:text-3xl font-black tracking-tight tabular-nums">{amount}</div>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#BEF221] px-4 py-3.5 text-sm font-extrabold text-[#0D0630] shadow-[0_0_30px_rgba(190,242,33,0.35)]">
                      <CreditCard className="h-4 w-4" strokeWidth={2.4} />
                      {l.pay} {amount}
                    </div>
                  </div>

                  {/* Moyens de paiement acceptés */}
                  <h3 className="mt-7 text-left text-[11px] font-bold uppercase tracking-widest text-white/50">
                    {t.integrations}
                  </h3>
                  <div className="mt-3 grid grid-cols-5 gap-2 lg:gap-3">
                    <div className="flex h-12 items-center justify-center rounded-xl bg-white" title="Visa">
                      <span className="text-[#1A1F71] text-base font-black italic tracking-tighter">VISA</span>
                    </div>
                    <div className="flex h-12 items-center justify-center rounded-xl bg-white" title="Mastercard">
                      <span className="relative block h-6 w-10">
                        <i className="absolute left-0 top-0 block h-6 w-6 rounded-full bg-[#EB001B]" />
                        <i className="absolute left-4 top-0 block h-6 w-6 rounded-full bg-[#F79E1B] mix-blend-multiply" />
                      </span>
                    </div>
                    <div className="flex h-12 items-center justify-center rounded-xl bg-white" title="Carte Bancaire">
                      <span className="rounded-md bg-gradient-to-br from-[#0B5C3A] to-[#1E6FB8] px-2 py-1 text-[11px] font-black tracking-wide text-white">CB</span>
                    </div>
                    <div className="flex h-12 items-center justify-center gap-0.5 rounded-xl bg-black text-white" title="Apple Pay">
                      <Apple className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                      <span className="text-sm font-semibold tracking-tight">Pay</span>
                    </div>
                    <div className="flex h-12 items-center justify-center rounded-xl bg-white" title="PayPal">
                      <span className="text-sm font-black italic tracking-tight"><span className="text-[#003087]">Pay</span><span className="text-[#009CDE]">Pal</span></span>
                    </div>
                  </div>

                  {/* Propulsé par */}
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-5">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-white/45">{t.poweredBy}</span>
                    {locale === "pt-BR" && (
                      <span className="inline-flex items-center gap-1.5 text-[#32BCAD] font-black text-base tracking-tight">
                        <Zap className="h-4 w-4" />
                        PIX
                      </span>
                    )}
                    <span className="rounded-md bg-[#635BFF] px-2.5 py-1 text-sm font-black tracking-tight text-white">stripe</span>
                    <span className="text-base font-black italic tracking-tight"><span className="text-white">Pay</span><span className="text-[#5CC4F0]">Pal</span></span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Text Content */}
          <ScrollReveal className="flex-1 text-left" delay={200}>
            <h2 className="text-[28px] md:text-4xl lg:text-5xl font-black text-[#0D0630] mb-4 md:mb-6 leading-[1.08] tracking-tight [text-wrap:balance]">
              {t.title}
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
              {t.subtitle}
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
