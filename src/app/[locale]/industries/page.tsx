import { Metadata } from "next";
import Link from "next/link";
import { industries, industryCategories } from "@/data/seo-config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";
import { ArrowRight, Hammer, Code, Palette, PartyPopper, Briefcase, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Facturation par Industrie | Robi AI",
  description:
    "Découvrez comment Robi AI s'adapte à votre métier. Solutions de facturation sur-mesure pour plombiers, électriciens, consultants, développeurs et plus.",
  keywords: [
    "facturation par métier",
    "logiciel facturation artisan",
    "facturation freelance",
  ],
};

const categoryIcons: Record<string, any> = {
  btp: Hammer,
  tech: Code,
  creatif: Palette,
  evenementiel: PartyPopper,
  conseil: Briefcase,
  sante: Heart,
};

export default function IndustriesPage() {
  // Group industries by category
  const industriesByCategory = industryCategories.map((category) => ({
    ...category,
    industries: industries.filter((ind) => ind.category === category.id),
  }));

  return (
    <>
      <Hero
        badge="Solutions par métier"
        title="Une solution adaptée"
        titleAccent="à votre métier"
        subtitle="Robi comprend les spécificités de chaque profession. Découvrez comment nous pouvons vous aider."
        variant="centered"
      />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {industriesByCategory.map((category) => {
            const Icon = categoryIcons[category.id] || Briefcase;
            return (
              <div key={category.id} className="mb-16 last:mb-0">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#0D0630] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#BEF221]" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-[#0D0630]">
                    {category.name}
                  </h2>
                  <span className="text-sm text-gray-400 ml-2">
                    {category.industries.length} métiers
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.industries.map((industry) => (
                    <Link key={industry.slug} href={`/fr/industries/${industry.slug}`}>
                      <Card className="h-full group cursor-pointer hover:border-[#BEF221] transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-[#0D0630] group-hover:text-[#0D0630]">
                            {industry.name}
                          </h3>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#BEF221] transition-colors flex-shrink-0" />
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {industry.heroTitle}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {industry.features.slice(0, 2).map((feature) => (
                            <span
                              key={feature}
                              className="text-xs bg-[#BEF221]/20 text-[#0D0630] px-2 py-0.5 rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#0D0630]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
            Adapté à <span className="text-[#BEF221]">{industries.length}+ métiers</span>
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-black text-[#BEF221]">{industries.length}</p>
              <p className="text-white/50 text-sm">Industries</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#BEF221]">{industryCategories.length}</p>
              <p className="text-white/50 text-sm">Catégories</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#BEF221]">∞</p>
              <p className="text-white/50 text-sm">Personnalisation</p>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
