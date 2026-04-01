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
  ].filter(item => item.question && item.answer) : []);

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

  // Split into 2 columns
  const midPoint = Math.ceil(faqItems.length / 2);
  const leftColumn = faqItems.slice(0, midPoint);
  const rightColumn = faqItems.slice(midPoint);

  const faqBadge = badge || (dict ? dict.faq.badge : "Pas encore convaincu ?");

  const renderItem = (item: FAQItem, index: number) => (
    <ScrollReveal key={index} delay={index * 40}>
      <div
        className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
          openIndices.has(index)
            ? "bg-gray-50 border-[#BEF221]/30 shadow-[0_0_20px_rgba(190,242,33,0.06)]"
            : "bg-gray-50 border-gray-200 hover:border-gray-300"
        }`}
      >
        <button
          onClick={() => toggleIndex(index)}
          className="w-full flex items-center justify-between p-5 text-left gap-3"
        >
          <span className="font-bold text-gray-900 text-sm leading-snug">
            {item.question}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#BEF221] transition-transform duration-300 flex-shrink-0 ${
              openIndices.has(index) ? "rotate-180" : ""
            }`}
          />
        </button>
        <div className={`faq-answer ${openIndices.has(index) ? "open" : ""}`}>
          <div>
            <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">
              {item.answer}
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );

  return (
    <section id="faq" className="py-8 md:py-24 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-6 md:mb-12">
          <p className="hidden md:inline-block text-[#BEF221] font-bold text-[10px] md:text-sm uppercase tracking-wider mb-2 md:mb-3 bg-[#0D0630] px-3 md:px-4 py-1 md:py-1.5 rounded-full">
            {faqBadge}
          </p>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">
            {title}
          </h2>
        </ScrollReveal>

        {/* Two column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            {leftColumn.map((item, i) => renderItem(item, i))}
          </div>
          <div className="space-y-4">
            {rightColumn.map((item, i) => renderItem(item, i + midPoint))}
          </div>
        </div>
      </div>
    </section>
  );
}
