import { Metadata } from "next";
import Link from "next/link";
import { features } from "@/data/seo-config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";
import { ArrowRight, Bot, Zap, Bell, CreditCard, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Fonctionnalités | Robi AI",
  description:
    "Découvrez toutes les fonctionnalités de Robi AI : facturation IA, devis automatiques, relances, paiement en ligne et tableau de bord.",
  keywords: ["fonctionnalités robi", "facturation ia", "logiciel facturation features"],
};

const featureIcons = {
  "facturation-ia": Bot,
  "devis-automatique": Zap,
  "relance-automatique": Bell,
  "paiement-en-ligne": CreditCard,
  "tableau-de-bord": BarChart3,
};

export default function FeaturesPage() {
  return (
    <>
      <Hero
        badge="Fonctionnalités"
        title="Tout ce dont vous avez besoin"
        titleAccent="en un seul outil"
        subtitle="Robi combine IA, automatisation et simplicité pour gérer votre facturation de A à Z."
        variant="centered"
      />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = featureIcons[feature.slug as keyof typeof featureIcons] || Bot;
              const isLarge = index === 0 || index === features.length - 1;

              return (
                <Link
                  key={feature.slug}
                  href={`/features/${feature.slug}`}
                  className={isLarge ? "md:col-span-2" : ""}
                >
                  <Card
                    variant={index === 0 ? "dark" : "default"}
                    className={`h-full group cursor-pointer ${isLarge ? "md:flex md:items-center md:gap-12" : ""}`}
                  >
                    <div className={`${isLarge ? "md:w-1/3" : ""}`}>
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                          index === 0
                            ? "bg-[#BEF221]/20 border border-[#BEF221]/30"
                            : "bg-[#0D0630]/5 border border-[#0D0630]/10"
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 ${index === 0 ? "text-[#BEF221]" : "text-[#0D0630]"}`}
                        />
                      </div>
                    </div>
                    <div className={`${isLarge ? "md:w-2/3" : ""}`}>
                      <div className="flex items-start justify-between mb-4">
                        <h3
                          className={`text-2xl font-bold group-hover:text-[#BEF221] transition-colors ${
                            index === 0 ? "text-white" : "text-[#0D0630]"
                          }`}
                        >
                          {feature.name}
                        </h3>
                        <ArrowRight
                          className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${
                            index === 0 ? "text-[#BEF221]" : "text-[#0D0630]"
                          }`}
                        />
                      </div>
                      <p className={index === 0 ? "text-white/70" : "text-gray-600"}>
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
