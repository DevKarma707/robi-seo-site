"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  dict?: any;
  items?: FAQItem[];
}

const defaultFAQs: FAQItem[] = [
  {
    question: "Comment fonctionne l'essai gratuit ?",
    answer: "Vous pouvez créer jusqu'à 3 documents par mois gratuitement. Aucune carte bancaire n'est requise pour commencer.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, nous utilisons un chiffrement de niveau bancaire (AES-256) et Stripe pour sécuriser toutes vos transactions.",
  },
  {
    question: "Puis-je personnaliser mes factures ?",
    answer: "Absolument. Vous pouvez ajouter votre logo, vos couleurs et choisir parmi plusieurs modèles premium.",
  },
  {
    question: "Robi remplace-t-il mon comptable ?",
    answer: "Robi automatise votre gestion quotidienne, mais un comptable reste essentiel pour vos déclarations fiscales.",
  },
  {
    question: "Que se passe-t-il si j'annule ?",
    answer: "Vous pouvez annuler en un clic. Vos données restent accessibles en lecture seule pendant 12 mois.",
  },
];

export function FAQ({ title = "Questions fréquentes", dict, items }: FAQProps) {
  const faqItems: FAQItem[] = items || (dict ? [
    { question: dict.faq.q1, answer: dict.faq.a1 },
    { question: dict.faq.q2, answer: dict.faq.a2 },
    { question: dict.faq.q3, answer: dict.faq.a3 },
    { question: dict.faq.q4, answer: dict.faq.a4 },
    { question: dict.faq.q5, answer: dict.faq.a5 },
  ] : defaultFAQs);

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900">
            {title}
          </h2>
        </ScrollReveal>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <ScrollReveal key={index} delay={index * 60}>
              <div
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "bg-gray-50 border-[#BEF221]/20 shadow-[0_0_30px_rgba(190,242,33,0.05)]"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-gray-900 pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#BEF221] transition-transform duration-300 flex-shrink-0 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div className={`faq-answer ${openIndex === index ? "open" : ""}`}>
                  <div>
                    <div className="px-6 pb-6 text-gray-500 leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
