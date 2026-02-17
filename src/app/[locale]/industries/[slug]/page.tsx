import { Metadata } from "next";
import { notFound } from "next/navigation";
import { industries } from "@/data/seo-config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Check, X, Zap, Clock, AlertTriangle } from "lucide-react";

// Generate static pages for all industries
export async function generateStaticParams() {
  return industries.map((industry) => ({
    slug: industry.slug,
  }));
}

// Generate metadata for each industry page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);

  if (!industry) {
    return {
      title: "Page non trouvée",
    };
  }

  return {
    title: industry.title,
    description: industry.description,
    keywords: industry.keywords,
    openGraph: {
      title: industry.title,
      description: industry.description,
      type: "website",
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);

  if (!industry) {
    notFound();
  }

  return (
    <>
      {/* JSON-LD Schema for Industry */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: `Robi AI pour ${industry.name}`,
            applicationCategory: "BusinessApplication",
            description: industry.description,
            offers: {
              "@type": "Offer",
              price: "14.99",
              priceCurrency: "EUR",
            },
          }),
        }}
      />

      <Hero
        badge={`Solution pour ${industry.name}`}
        title={industry.heroTitle}
        subtitle={industry.description}
        ctaText="Essayer Gratuitement"
        ctaHref="/signup"
        variant="centered"
      />

      {/* Pain Points Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="warning" className="mb-4">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Problèmes courants
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-[#0D0630]">
              Les défis des {industry.name.toLowerCase()}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industry.painPoints.map((pain, index) => (
              <Card key={index} variant="default" className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0D0630] mb-2">{pain}</h3>
                <p className="text-gray-600">
                  Un problème que Robi résout automatiquement pour vous.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="success" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Solutions Robi
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-[#0D0630]">
              Fonctionnalités pour {industry.name.toLowerCase()}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industry.features.map((feature, index) => (
              <Card key={index} variant="accent" className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#BEF221] flex items-center justify-center">
                  <Check className="w-8 h-8 text-[#0D0630]" />
                </div>
                <h3 className="text-xl font-bold text-[#0D0630] mb-2">
                  {feature}
                </h3>
                <p className="text-gray-600">
                  Intégré nativement dans Robi pour votre métier.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Time Savings Section */}
      <section className="py-24 bg-[#0D0630]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#BEF221]/20 mb-8">
            <Clock className="w-10 h-10 text-[#BEF221]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            Gagnez 10h par mois
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Les {industry.name.toLowerCase()} qui utilisent Robi économisent en moyenne 10 heures
            par mois sur leur administratif. C'est du temps en plus pour vos clients.
          </p>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <p className="text-4xl font-black text-[#BEF221]">30s</p>
              <p className="text-white/50 text-sm">pour créer un devis</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#BEF221]">2x</p>
              <p className="text-white/50 text-sm">plus vite payé</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#BEF221]">0</p>
              <p className="text-white/50 text-sm">relance manuelle</p>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      <Pricing />

      <FAQ
        items={[
          {
            question: `Robi est-il adapté aux ${industry.name.toLowerCase()} ?`,
            answer: `Oui, Robi a été conçu pour s'adapter à tous les métiers indépendants, y compris les ${industry.name.toLowerCase()}. Nous proposons des templates et fonctionnalités spécifiques à votre activité.`,
          },
          {
            question: "Puis-je personnaliser mes devis et factures ?",
            answer:
              "Absolument. Vous pouvez ajouter votre logo, personnaliser les couleurs et utiliser des templates adaptés à votre métier.",
          },
          {
            question: "Comment fonctionne la relance automatique ?",
            answer:
              "Robi détecte automatiquement les factures en retard et envoie des emails de relance personnalisés à vos clients. Vous définissez les délais et le ton des messages.",
          },
          {
            question: "Mes données sont-elles sécurisées ?",
            answer:
              "Oui, nous utilisons un chiffrement de niveau bancaire. Vos données sont hébergées en Europe et conformes au RGPD.",
          },
        ]}
      />

      <CTA
        title={`Prêt à simplifier votre facturation ?`}
        subtitle={`Rejoignez les ${industry.name.toLowerCase()} qui facturent sans effort`}
      />
    </>
  );
}
