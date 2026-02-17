import { Metadata } from "next";
import { notFound } from "next/navigation";
import { features } from "@/data/seo-config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Check, Sparkles, Zap, Clock, TrendingUp } from "lucide-react";

export async function generateStaticParams() {
  return features.map((feature) => ({
    slug: feature.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const feature = features.find((f) => f.slug === slug);

  if (!feature) {
    return { title: "Fonctionnalité non trouvée" };
  }

  return {
    title: feature.title,
    description: feature.description,
    keywords: feature.keywords,
  };
}

// Feature-specific content
const featureContent: Record<string, {
  benefits: string[];
  howItWorks: { title: string; description: string }[];
  stats: { value: string; label: string }[];
}> = {
  "facturation-ia": {
    benefits: [
      "Créez des factures en parlant naturellement",
      "L'IA comprend le contexte et complète les informations",
      "Suggestions intelligentes basées sur votre historique",
      "Détection automatique des erreurs",
    ],
    howItWorks: [
      { title: "Parlez à Robi", description: "Dites simplement 'Crée une facture de 500€ pour le projet web de Marie'" },
      { title: "Robi comprend", description: "L'IA analyse votre demande et identifie client, montant, prestation" },
      { title: "Validez et envoyez", description: "Vérifiez le document généré et envoyez-le en un clic" },
    ],
    stats: [
      { value: "30s", label: "Temps de création" },
      { value: "99%", label: "Précision IA" },
      { value: "10h", label: "Gagnées par mois" },
    ],
  },
  "devis-automatique": {
    benefits: [
      "Templates professionnels personnalisables",
      "Calculs automatiques (TVA, remises, totaux)",
      "Bibliothèque de prestations réutilisables",
      "Conversion devis → facture en un clic",
    ],
    howItWorks: [
      { title: "Choisissez un template", description: "Sélectionnez parmi nos modèles adaptés à votre métier" },
      { title: "Ajoutez vos prestations", description: "Depuis votre catalogue ou en les décrivant à l'IA" },
      { title: "Personnalisez et envoyez", description: "Ajustez les détails et partagez le lien avec votre client" },
    ],
    stats: [
      { value: "2min", label: "Devis complet" },
      { value: "85%", label: "Taux d'acceptation" },
      { value: "0", label: "Erreur de calcul" },
    ],
  },
  "relance-automatique": {
    benefits: [
      "Détection automatique des factures en retard",
      "Emails de relance personnalisés par l'IA",
      "Escalade progressive (rappel → relance → mise en demeure)",
      "Suivi des ouvertures et clics",
    ],
    howItWorks: [
      { title: "Configuration initiale", description: "Définissez vos délais et le ton des messages" },
      { title: "Surveillance continue", description: "Robi surveille les échéances et détecte les retards" },
      { title: "Relance automatique", description: "Des emails personnalisés sont envoyés au bon moment" },
    ],
    stats: [
      { value: "-50%", label: "Impayés" },
      { value: "3j", label: "Paiement plus rapide" },
      { value: "0", label: "Relance manuelle" },
    ],
  },
  "paiement-en-ligne": {
    benefits: [
      "Stripe et PayPal intégrés nativement",
      "Liens de paiement en un clic",
      "Paiement par carte, virement, prélèvement",
      "Réconciliation automatique des paiements",
    ],
    howItWorks: [
      { title: "Connectez vos comptes", description: "Liez Stripe et/ou PayPal en quelques clics" },
      { title: "Générez des liens", description: "Chaque facture inclut un bouton 'Payer maintenant'" },
      { title: "Soyez notifié", description: "Recevez une notification dès que le paiement est reçu" },
    ],
    stats: [
      { value: "2x", label: "Plus vite payé" },
      { value: "24h", label: "Délai moyen" },
      { value: "100%", label: "Sécurisé" },
    ],
  },
  "tableau-de-bord": {
    benefits: [
      "Vue d'ensemble de votre activité en temps réel",
      "Graphiques de CA, factures, paiements",
      "Alertes intelligentes (impayés, objectifs)",
      "Export comptable automatique",
    ],
    howItWorks: [
      { title: "Connectez-vous", description: "Accédez à votre dashboard depuis n'importe quel appareil" },
      { title: "Visualisez", description: "Graphiques, KPIs et alertes en un coup d'œil" },
      { title: "Agissez", description: "Cliquez sur une alerte pour traiter le problème immédiatement" },
    ],
    stats: [
      { value: "360°", label: "Vision complète" },
      { value: "Live", label: "Temps réel" },
      { value: "1clic", label: "Export comptable" },
    ],
  },
};

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const feature = features.find((f) => f.slug === slug);

  if (!feature) {
    notFound();
  }

  const content = featureContent[slug] || featureContent["facturation-ia"];

  return (
    <>
      <Hero
        badge="Fonctionnalité"
        title={feature.name}
        subtitle={feature.description}
        variant="centered"
      />

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            {content.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-[#BEF221]">
                  {stat.value}
                </p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Avantages
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-[#0D0630]">
              Pourquoi vous allez adorer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.benefits.map((benefit, index) => (
              <Card key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#BEF221] flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-[#0D0630]" />
                </div>
                <p className="text-lg text-[#0D0630] font-medium">{benefit}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Comment ça marche
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-[#0D0630]">
              Simple comme 1, 2, 3
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-black text-[#BEF221]/20 absolute -top-4 -left-2">
                  {index + 1}
                </div>
                <Card className="relative z-10 h-full">
                  <h3 className="text-xl font-bold text-[#0D0630] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      <Pricing />

      <CTA
        title={`Essayez ${feature.name}`}
        subtitle="Gratuit pendant 14 jours, sans carte bancaire"
      />
    </>
  );
}
