"use client";

import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Bot, Zap, CreditCard, Mail, BarChart3, Shield, LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeaturesProps {
  title?: string;
  titleAccent?: string;
  subtitle?: string;
  dict?: any;
  layout?: "2x2" | "2x3" | "3x3";
}

const defaultDict = {
  features: {
    aiInvoicing: { title: "Facturation par IA", description: "Parlez, Robi facture. Créez des devis et factures en quelques secondes par simple conversation." },
    automation: { title: "Automatisation Complète", description: "Relances automatiques, rappels de paiement et suivi des impayés sans lever le petit doigt." },
    payments: { title: "Paiement Intégré", description: "Stripe et PayPal intégrés. Vos clients paient en un clic, vous êtes crédité instantanément." },
    emails: { title: "Emails Personnalisés", description: "L'IA rédige des emails de relance polis et efficaces adaptés à chaque situation." },
    dashboard: { title: "Tableau de Bord", description: "Visualisez votre CA, factures en attente et objectifs en temps réel." },
    compliant: { title: "100% Conforme", description: "Factures conformes aux normes françaises. Mentions légales automatiques." },
  },
};

export function Features({
  title = "Tout ce qu'il faut pour",
  titleAccent = "dominer",
  subtitle,
  dict = defaultDict,
  layout = "2x3",
}: FeaturesProps) {
  const features: Feature[] = [
    { icon: Bot, title: dict.features.aiInvoicing.title, description: dict.features.aiInvoicing.description },
    { icon: Zap, title: dict.features.automation.title, description: dict.features.automation.description },
    { icon: CreditCard, title: dict.features.payments.title, description: dict.features.payments.description },
    { icon: Mail, title: dict.features.emails.title, description: dict.features.emails.description },
    { icon: BarChart3, title: dict.features.dashboard.title, description: dict.features.dashboard.description },
    { icon: Shield, title: dict.features.compliant.title, description: dict.features.compliant.description },
  ];

  const gridCols = {
    "2x2": "grid-cols-1 md:grid-cols-2",
    "2x3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    "3x3": "grid-cols-1 md:grid-cols-3",
  };

  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
            {title}{" "}
            {titleAccent && (
              <span className="text-[#BEF221] drop-shadow-[0_0_20px_rgba(190,242,33,0.3)]">
                {titleAccent}
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </ScrollReveal>

        <div className={`grid ${gridCols[layout]} gap-8 card-group`}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={index} delay={index * 80}>
                <Card variant={index === features.length - 1 ? "dark" : "default"} className="flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-[#BEF221]/10 border border-[#BEF221]/20">
                    <Icon className="w-7 h-7 text-[#BEF221]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500">{feature.description}</p>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
