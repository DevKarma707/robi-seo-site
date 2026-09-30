"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { H2, SECTION } from "./shared";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  badge?: string;
  dict?: any;
  items?: FAQItem[];
}

export function FAQ({ title = "Questions fréquentes", badge, dict, items }: FAQProps) {
  const faqItems: FAQItem[] = items || (dict ? [
    { question: dict.faq.q1, answer: dict.faq.a1 },
    { question: dict.faq.q2, answer: dict.faq.a2 },
    { question: dict.faq.q3, answer: dict.faq.a3 },
    { question: dict.faq.q4, answer: dict.faq.a4 },
    { question: dict.faq.q5, answer: dict.faq.a5 },
    { question: dict.faq.q6, answer: dict.faq.a6 },
    { question: dict.faq.q7, answer: dict.faq.a7 },
    { question: dict.faq.q8, answer: dict.faq.a8 },
    { question: dict.faq.q9, answer: dict.faq.a9 },
    { question: dict.faq.q10, answer: dict.faq.a10 },
  ].filter(item => item.question && item.answer)
    // La question sur l'ouverture du devis passe en tête : le héros vient de la montrer.
    .sort((x, y) => Number(y.question === dict.faq.q2) - Number(x.question === dict.faq.q2)) : []);

  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0]));

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const renderItem = (item: FAQItem, index: number) => (
    <ScrollReveal key={index} delay={index * 40}>
      <div
        className={`overflow-hidden rounded-[22px] border transition-colors duration-500 ${
          openIndices.has(index) ? "border-[#0D0630]/15 bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <button
          onClick={() => toggleIndex(index)}
          className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
          aria-expanded={openIndices.has(index)}
        >
          <span className="text-[15px] font-bold leading-snug text-[#0D0630] md:text-lg">
            {item.question}
          </span>
          <ChevronDown
            className={`h-5 w-5 flex-shrink-0 text-[#0D0630]/50 transition-transform duration-500 ${
              openIndices.has(index) ? "rotate-180" : ""
            }`}
          />
        </button>
        <div className={`faq-answer ${openIndices.has(index) ? "open" : ""}`}>
          <div>
            <div className="px-5 pb-5 text-sm leading-relaxed text-gray-600 md:px-6 md:pb-6 md:text-base">
              {item.answer}
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );

  return (
    <section id="faq" className={`${SECTION} bg-white relative`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-8 md:mb-14">
          <h2 className={`${H2} text-[#0D0630]`}>{title}</h2>
        </ScrollReveal>

        <div className="space-y-3">{faqItems.map((item, i) => renderItem(item, i))}</div>
      </div>
    </section>
  );
}
