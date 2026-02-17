import { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/data/seo-config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";
import { Calculator, FileText, Scale, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Outils Gratuits pour Freelances | Robi AI",
  description:
    "Calculateur de TJM, simulateur de charges, générateur de mentions légales. Outils gratuits pour freelances et auto-entrepreneurs.",
  keywords: ["outils freelance", "calculateur tjm", "simulateur charges freelance"],
};

const toolIcons: Record<string, React.ElementType> = {
  "calculateur-tjm": Calculator,
  "simulateur-charges": Scale,
  "generateur-mentions-legales": FileText,
};

export default function ToolsPage() {
  return (
    <>
      <Hero
        badge="Outils gratuits"
        title="Ressources pour"
        titleAccent="freelances"
        subtitle="Des outils pratiques et gratuits pour gérer votre activité indépendante."
        variant="centered"
      />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tools.map((tool) => {
              const Icon = toolIcons[tool.slug] || Calculator;
              return (
                <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                  <Card className="h-full group cursor-pointer text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#BEF221]/20 flex items-center justify-center group-hover:bg-[#BEF221] transition-colors">
                      <Icon className="w-10 h-10 text-[#0D0630]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0D0630] mb-3 group-hover:text-[#BEF221] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{tool.description}</p>
                    <span className="inline-flex items-center gap-2 text-[#0D0630] font-medium">
                      Utiliser l'outil
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <CTA
        title="Allez plus loin avec Robi AI"
        subtitle="Automatisez toute votre facturation"
      />
    </>
  );
}
