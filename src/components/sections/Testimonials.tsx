import { Card } from "@/components/ui/Card";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating?: number;
  avatar?: string;
}

interface TestimonialsProps {
  title?: string;
  titleAccent?: string;
  testimonials?: Testimonial[];
  layout?: "grid" | "carousel";
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

export function Testimonials({
  title = "Ce qu'ils disent de",
  titleAccent = "Robi",
  testimonials = defaultTestimonials,
  layout = "grid",
}: TestimonialsProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-[#0D0630]">
            {title}{" "}
            <span className="text-[#BEF221]">{titleAccent}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-[#BEF221] text-[#BEF221]"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 flex-1 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#BEF221] to-[#0D0630]" />
                <div>
                  <p className="font-bold text-[#0D0630]">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
