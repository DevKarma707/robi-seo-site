"use client";

import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating?: number;
}

interface TestimonialsProps {
  title?: string;
  titleAccent?: string;
  testimonials?: Testimonial[];
  dict?: {
    testimonials: {
      title: string;
      titleAccent: string;
      items?: Array<{ name: string; role: string; content: string }>;
    };
  };
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Marie Dupont",
    role: "Designer Freelance",
    content: "Robi m'a fait gagner 5 heures par semaine. Je parle, il facture. C'est magique !",
    rating: 5,
  },
  {
    name: "Thomas Bernard",
    role: "Développeur Web",
    content: "Fini les tableurs Excel ! Robi gère mes factures et relance mes clients automatiquement.",
    rating: 5,
  },
  {
    name: "Sophie Martin",
    role: "Consultante RH",
    content: "L'intégration Stripe est parfaite. Mes clients paient en un clic, je suis payée le lendemain.",
    rating: 5,
  },
  {
    name: "Lucas Petit",
    role: "Photographe",
    content: "Les templates de devis sont superbes. Mes clients sont impressionnés par le professionnalisme.",
    rating: 5,
  },
  {
    name: "Emma Garcia",
    role: "Coach Business",
    content: "La relance automatique a changé ma vie. Plus besoin de courir après mes clients.",
    rating: 5,
  },
  {
    name: "Antoine Moreau",
    role: "Plombier",
    content: "Je facture directement depuis mon van après chaque intervention. Simple et rapide.",
    rating: 5,
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="flex flex-col h-full">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating || 5)].map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 md:w-5 md:h-5 fill-[#BEF221] text-[#BEF221]"
          />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-600 mb-6 flex-1 leading-relaxed text-sm md:text-base">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#BEF221] to-gray-300 border border-gray-200 flex-shrink-0" />
        <div>
          <p className="font-bold text-gray-900 text-sm">{testimonial.name}</p>
          <p className="text-xs text-gray-500">{testimonial.role}</p>
        </div>
      </div>
    </Card>
  );
}

export function Testimonials({
  title = "Ce qu'ils disent de",
  titleAccent = "Robi",
  testimonials,
  dict,
}: TestimonialsProps) {
  const resolvedTestimonials: Testimonial[] =
    testimonials ??
    (dict?.testimonials?.items?.map((item) => ({
      ...item,
      rating: 5,
    })) ||
      defaultTestimonials);

  return (
    <section className="py-14 md:py-24 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10 md:mb-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">
            {title}{" "}
            <span className="text-[#BEF221]">{titleAccent}</span>
          </h2>
        </ScrollReveal>

        {/* Mobile: horizontal scroll carousel */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
            {resolvedTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="snap-center flex-shrink-0 w-[85vw] max-w-[320px]"
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
          {/* Scroll indicator dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {resolvedTestimonials.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[#BEF221]" : "bg-gray-300"}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: grid layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8 card-group">
          {resolvedTestimonials.map((testimonial, index) => (
            <ScrollReveal key={index} delay={index * 80}>
              <TestimonialCard testimonial={testimonial} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
