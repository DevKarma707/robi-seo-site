import { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/data/seo-config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTA } from "@/components/sections/CTA";
import { ArrowRight, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Robi AI",
  description:
    "Conseils, guides et actualités pour les freelances et indépendants. Facturation, statuts juridiques, tarifs et plus.",
  keywords: ["blog freelance", "conseils facturation", "guide auto-entrepreneur"],
};

const categoryColors: Record<string, string> = {
  guides: "bg-blue-100 text-blue-700",
  legal: "bg-purple-100 text-purple-700",
  tips: "bg-green-100 text-green-700",
  business: "bg-amber-100 text-amber-700",
};

const categoryNames: Record<string, string> = {
  guides: "Guide",
  legal: "Juridique",
  tips: "Conseils",
  business: "Business",
};

export default function BlogPage() {
  return (
    <>
      <Hero
        badge="Blog"
        title="Ressources pour"
        titleAccent="freelances"
        subtitle="Guides pratiques, conseils juridiques et astuces pour développer votre activité indépendante."
        variant="centered"
      />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Post */}
          <Link href={`/blog/${blogPosts[0].slug}`} className="block mb-12">
            <Card variant="dark" className="group cursor-pointer overflow-hidden">
              <div className="md:flex md:items-center md:gap-12">
                <div className="md:w-1/2 mb-6 md:mb-0">
                  <div className="aspect-video bg-gradient-to-br from-[#BEF221]/20 to-[#0D0630] rounded-2xl" />
                </div>
                <div className="md:w-1/2">
                  <Badge className={categoryColors[blogPosts[0].category]}>
                    {categoryNames[blogPosts[0].category]}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mt-4 mb-4 group-hover:text-[#BEF221] transition-colors">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-white/70 mb-6">{blogPosts[0].description}</p>
                  <div className="flex items-center gap-4 text-white/50 text-sm">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      15 février 2024
                    </span>
                    <span>•</span>
                    <span>8 min de lecture</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Other Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-6" />
                  <Badge className={categoryColors[post.category]}>
                    {categoryNames[post.category]}
                  </Badge>
                  <h3 className="text-xl font-bold text-[#0D0630] mt-4 mb-3 group-hover:text-[#BEF221] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      10 février 2024
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#BEF221]" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTA
        title="Passez à l'action"
        subtitle="Appliquez ces conseils avec Robi AI"
      />
    </>
  );
}
