"use client";

import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Locale } from "@/lib/i18n/config";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

interface PricingProps {
  title?: string;
  subtitle?: string;
  dict?: any;
  locale?: Locale;
}

const defaultDict = {
  pricing: {
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    yearly: "Annuel",
    week: "/semaine",
    month: "/mois",
    year: "/an",
    noCommitment: "Sans engagement",
    perMonth: "Soit {price}/mois",
    save: "Économisez {amount}",
    mostPopular: "Plus populaire",
    cta: "Commencer",
    features: {
      unlimitedAI: "IA Conversationnel illimité",
      unlimitedDocs: "Factures & devis illimités",
      customPDF: "PDF personnalisés",
      export: "Export Excel/PDF",
      prioritySupport: "Support prioritaire",
      autoReminders: "Relances automatiques",
      earlyAccess: "Accès anticipé nouveautés",
      phoneSupport: "Support téléphonique",
      training: "Formation personnalisée",
    },
  },
};

export function Pricing({
  title = "Prix simples, ROI énorme.",
  subtitle = "Rejoignez les freelances malins qui économisent +10h par mois.",
  dict = defaultDict,
  locale = "fr",
}: PricingProps) {
  const plans: PricingPlan[] = [
    {
      name: dict.pricing.weekly,
      price: "4,99€",
      period: dict.pricing.week,
      description: dict.pricing.noCommitment,
      features: [
        dict.pricing.features.unlimitedAI,
        dict.pricing.features.unlimitedDocs,
        dict.pricing.features.customPDF,
        dict.pricing.features.export,
      ],
    },
    {
      name: dict.pricing.monthly,
      price: "14,99€",
      period: dict.pricing.month,
      description: dict.pricing.noCommitment,
      features: [
        dict.pricing.features.unlimitedAI,
        dict.pricing.features.unlimitedDocs,
        dict.pricing.features.customPDF,
        dict.pricing.features.export,
        dict.pricing.features.prioritySupport,
        dict.pricing.features.autoReminders,
      ],
      popular: true,
    },
    {
      name: dict.pricing.yearly,
      price: "89€",
      period: dict.pricing.year,
      description: dict.pricing.perMonth.replace("{price}", "7,42€"),
      features: [
        dict.pricing.features.unlimitedAI,
        dict.pricing.features.unlimitedDocs,
        dict.pricing.features.earlyAccess,
        dict.pricing.features.phoneSupport,
        dict.pricing.features.training,
      ],
      savings: dict.pricing.save.replace("{amount}", "50%"),
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-gray-50 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#BEF221]/[0.05] rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-500">{subtitle}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <Card
                variant={plan.popular ? "accent" : "default"}
                className={`flex flex-col relative h-full ${
                  plan.popular
                    ? "ring-2 ring-[#BEF221] scale-105 shadow-glow"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="accent">{dict.pricing?.mostPopular || "Plus populaire"}</Badge>
                  </div>
                )}

                {plan.savings && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="success">{plan.savings}</Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-black text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-sm mt-2 text-gray-500">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#BEF221] flex-shrink-0">
                        <Check className="w-4 h-4 text-[#0D0630]" />
                      </div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  href={`/${locale}/signup`}
                  variant={plan.popular ? "primary" : "outline"}
                  className="w-full"
                >
                  {dict.pricing?.cta || "Commencer"}
                </Button>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
