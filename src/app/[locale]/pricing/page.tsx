import { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Card } from "@/components/ui/Card";
import { Shield, Zap, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Tarifs | Robi AI",
  description:
    "Découvrez nos tarifs simples et transparents. Essai gratuit sans carte bancaire. À partir de 4,99€/semaine.",
  keywords: ["prix robi ai", "tarif facturation freelance", "logiciel facturation prix"],
};

export default function PricingPage() {
  return (
    <>
      <Hero
        badge="Tarification transparente"
        title="Prix simples,"
        titleAccent="ROI énorme."
        subtitle="Pas de frais cachés. Pas d'engagement. Annulation en un clic."
        variant="centered"
      />

      <Pricing />

      {/* Guarantees */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0D0630]">
              Nos garanties
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#BEF221]/20 flex items-center justify-center">
                <Zap className="w-8 h-8 text-[#0D0630]" />
              </div>
              <h3 className="text-xl font-bold text-[#0D0630] mb-3">
                Essai gratuit
              </h3>
              <p className="text-gray-600">
                3 documents gratuits par mois. Aucune carte bancaire requise pour
                commencer.
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#BEF221]/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#0D0630]" />
              </div>
              <h3 className="text-xl font-bold text-[#0D0630] mb-3">
                Satisfait ou remboursé
              </h3>
              <p className="text-gray-600">
                14 jours pour changer d'avis. Remboursement intégral sans
                questions.
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#BEF221]/20 flex items-center justify-center">
                <HeartHandshake className="w-8 h-8 text-[#0D0630]" />
              </div>
              <h3 className="text-xl font-bold text-[#0D0630] mb-3">
                Support humain
              </h3>
              <p className="text-gray-600">
                Une vraie équipe française qui répond en moins de 24h. Pas de
                chatbot.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <FAQ
        title="Questions sur les tarifs"
        items={[
          {
            question: "Y a-t-il des frais cachés ?",
            answer:
              "Non, le prix affiché est le prix final. Pas de frais de setup, pas de commission sur vos factures, pas de coût supplémentaire pour les fonctionnalités.",
          },
          {
            question: "Puis-je changer de formule ?",
            answer:
              "Oui, vous pouvez passer d'une formule à l'autre à tout moment. Le changement prend effet immédiatement.",
          },
          {
            question: "Comment fonctionne le remboursement ?",
            answer:
              "Si vous n'êtes pas satisfait dans les 14 jours, contactez-nous et nous vous remboursons intégralement, sans questions.",
          },
          {
            question: "Proposez-vous des réductions pour les associations ?",
            answer:
              "Oui, nous offrons 50% de réduction aux associations et ONG. Contactez-nous avec votre numéro RNA.",
          },
          {
            question: "Puis-je payer par virement ?",
            answer:
              "Les paiements se font par carte bancaire via Stripe. Pour les paiements annuels, le virement est possible sur demande.",
          },
        ]}
      />

      <CTA />
    </>
  );
}
