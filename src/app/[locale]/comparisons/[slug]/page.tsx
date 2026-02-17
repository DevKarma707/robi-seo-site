import { Metadata } from "next";
import { notFound } from "next/navigation";
import { comparisons } from "@/data/seo-config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTA } from "@/components/sections/CTA";
import { Check, X, Minus } from "lucide-react";

export async function generateStaticParams() {
  return comparisons.map((comparison) => ({
    slug: comparison.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comparison = comparisons.find((c) => c.slug === slug);

  if (!comparison) {
    return { title: "Comparaison non trouvée" };
  }

  return {
    title: comparison.title,
    description: comparison.description,
    keywords: comparison.keywords,
  };
}

// Comparison features matrix
const comparisonFeatures = [
  { name: "Création de factures", robi: true, competitor: true },
  { name: "Création de devis", robi: true, competitor: true },
  { name: "Facturation par IA", robi: true, competitor: false },
  { name: "Relances automatiques", robi: true, competitor: "partial" },
  { name: "Paiement Stripe/PayPal", robi: true, competitor: "partial" },
  { name: "Application mobile", robi: true, competitor: "partial" },
  { name: "Support français", robi: true, competitor: true },
  { name: "Templates personnalisables", robi: true, competitor: true },
  { name: "Export comptable", robi: true, competitor: true },
  { name: "Tableaux de bord IA", robi: true, competitor: false },
];

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = comparisons.find((c) => c.slug === slug);

  if (!comparison) {
    notFound();
  }

  return (
    <>
      <Hero
        badge="Comparatif 2024"
        title={`Robi AI vs ${comparison.competitor}`}
        subtitle={comparison.description}
        variant="centered"
      />

      {/* Comparison Table */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0D0630]">
              Comparaison détaillée
            </h2>
            <p className="text-gray-600 mt-4">
              Découvrez les différences entre Robi AI et {comparison.competitor}
            </p>
          </div>

          <div className="bg-gray-50 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-[#0D0630] text-white p-6">
              <div className="font-bold">Fonctionnalité</div>
              <div className="text-center font-bold">
                <span className="text-[#BEF221]">Robi AI</span>
              </div>
              <div className="text-center font-bold">{comparison.competitor}</div>
            </div>

            {/* Rows */}
            {comparisonFeatures.map((feature, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 p-6 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div className="font-medium text-[#0D0630]">{feature.name}</div>
                <div className="flex justify-center">
                  {feature.robi ? (
                    <div className="w-8 h-8 rounded-full bg-[#BEF221] flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#0D0630]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <X className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  {feature.competitor === true ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  ) : feature.competitor === "partial" ? (
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Minus className="w-5 h-5 text-yellow-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <X className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-8 mt-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#BEF221] flex items-center justify-center">
                <Check className="w-4 h-4 text-[#0D0630]" />
              </div>
              Inclus
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                <Minus className="w-4 h-4 text-yellow-600" />
              </div>
              Partiel
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-4 h-4 text-red-500" />
              </div>
              Non inclus
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Robi */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">
              Avantages exclusifs
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-[#0D0630]">
              Pourquoi choisir Robi AI ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="default">
              <h3 className="text-xl font-bold text-[#0D0630] mb-4">
                IA Conversationnelle
              </h3>
              <p className="text-gray-600">
                Créez vos factures en parlant. Pas de formulaires compliqués,
                juste une conversation naturelle avec Robi.
              </p>
            </Card>
            <Card variant="default">
              <h3 className="text-xl font-bold text-[#0D0630] mb-4">
                Relances Intelligentes
              </h3>
              <p className="text-gray-600">
                Robi analyse le comportement de paiement de vos clients et adapte
                ses relances pour maximiser vos encaissements.
              </p>
            </Card>
            <Card variant="dark">
              <h3 className="text-xl font-bold text-white mb-4">
                Gain de temps réel
              </h3>
              <p className="text-white/70">
                Nos utilisateurs économisent en moyenne 10 heures par mois sur
                leur gestion administrative.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <CTA
        title={`Passez de ${comparison.competitor} à Robi AI`}
        subtitle="Migration gratuite et accompagnement personnalisé"
      />
    </>
  );
}
