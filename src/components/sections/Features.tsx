import { Card } from "@/components/ui/Card";
import { Bot, Zap, CreditCard, Mail, BarChart3, Shield, LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "dark";
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
    {
      icon: Bot,
      title: dict.features.aiInvoicing.title,
      description: dict.features.aiInvoicing.description,
    },
    {
      icon: Zap,
      title: dict.features.automation.title,
      description: dict.features.automation.description,
    },
    {
      icon: CreditCard,
      title: dict.features.payments.title,
      description: dict.features.payments.description,
    },
    {
      icon: Mail,
      title: dict.features.emails.title,
      description: dict.features.emails.description,
    },
    {
      icon: BarChart3,
      title: dict.features.dashboard.title,
      description: dict.features.dashboard.description,
    },
    {
      icon: Shield,
      title: dict.features.compliant.title,
      description: dict.features.compliant.description,
    },
  ];
  const gridCols = {
    "2x2": "grid-cols-1 md:grid-cols-2",
    "2x3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    "3x3": "grid-cols-1 md:grid-cols-3",
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-[#0D0630] mb-4">
            {title}{" "}
            {titleAccent && (
              <span className="text-[#BEF221] bg-[#0D0630] px-4 py-1 rounded-xl inline-block transform -rotate-1">
                {titleAccent}
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        <div className={`grid ${gridCols[layout]} gap-8`}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isDark = feature.variant === "dark" || index === features.length - 1;

            return (
              <Card
                key={index}
                variant={isDark ? "dark" : "default"}
                className="flex flex-col"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                    isDark
                      ? "bg-[#BEF221]/20 border border-[#BEF221]/30"
                      : "bg-[#0D0630]/5 border border-[#0D0630]/10"
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 ${isDark ? "text-[#BEF221]" : "text-[#0D0630]"}`}
                  />
                </div>
                <h3
                  className={`text-xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-[#0D0630]"
                  }`}
                >
                  {feature.title}
                </h3>
                <p className={isDark ? "text-white/70" : "text-gray-600"}>
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
