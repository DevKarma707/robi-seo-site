"use client";

import { Bot, Wand, Bell, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface ProcessStep {
  icon: React.ElementType;
  number: number;
  title: string;
  description: string;
}

interface ProcessProps {
  dict?: any;
}

const defaultDict = {
  process: {
    label: "Processus",
    title: "Votre assistant de poche,",
    titleAccent: "de A à Z.",
    subtitle:
      "De la création du devis à l'encaissement final, Robi s'occupe de tout.",
    step1: {
      title: "Créez en parlant",
      description:
        '"Prépare un devis de 500€ pour Alice." C\'est fait en 3 secondes.',
    },
    step2: {
      title: "Envoyez en 1 clic",
      description:
        "Une fois validé, Robi envoie le lien de paiement à votre client par email.",
    },
    step3: {
      title: "Soyez notifié",
      description:
        "Dès que le client paie, vous recevez une notification instantanément.",
    },
    step4: {
      title: "Relance automatique",
      description:
        "Facture en retard ? Robi relance poliment vos clients à votre place.",
    },
  },
};

export function Process({ dict = defaultDict }: ProcessProps) {
  const t = dict.process || defaultDict.process;

  const steps: ProcessStep[] = [
    { icon: Bot, number: 1, title: t.step1.title, description: t.step1.description },
    { icon: Wand, number: 2, title: t.step2.title, description: t.step2.description },
    { icon: Bell, number: 3, title: t.step3.title, description: t.step3.description },
    { icon: Zap, number: 4, title: t.step4.title, description: t.step4.description },
  ];

  return (
    <section id="process" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="text-[#BEF221] text-sm font-bold tracking-widest uppercase mb-4 block">
            {t.label}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
            {t.title}{" "}
            <span className="text-[#BEF221]">{t.titleAccent}</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            {t.subtitle}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 card-group">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.number} delay={index * 100}>
                <div className="card-3d p-8 rounded-3xl bg-gray-50 border border-gray-200 group hover:border-[#BEF221]/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(190,242,33,0.08)]">
                  <div className="w-16 h-16 bg-[#BEF221]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#BEF221]/20 group-hover:bg-[#BEF221]/20 group-hover:scale-110 transition-all duration-300 relative">
                    <Icon className="w-8 h-8 text-[#BEF221]" />
                    <div className="absolute -top-2 -right-2 bg-[#BEF221] text-[#0D0630] font-black w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-glow-sm">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
