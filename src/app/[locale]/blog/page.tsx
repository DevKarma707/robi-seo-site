import { Metadata } from "next";
import Link from "next/link";
import { blogPosts, t } from "@/data/seo-config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTA } from "@/components/sections/CTA";
import { ArrowRight, Calendar } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return {
    title: dict.pages.blog.title,
    description: dict.pages.blog.description,
    keywords: ["blog freelance", "conseils facturation", "guide auto-entrepreneur"],
  };
}

const categoryColors: Record<string, string> = {
  guides: "bg-blue-500/10 text-blue-400",
  legal: "bg-purple-500/10 text-purple-400",
  tips: "bg-green-500/10 text-green-400",
  business: "bg-amber-500/10 text-amber-400",
};

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const blog = dict.pages.blog;

  return (
    <>
      <Hero
        badge={blog.heroBadge}
        title={blog.heroTitle}
        titleAccent={blog.heroTitleAccent}
        subtitle={blog.heroSubtitle}
        variant="centered"
      />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Post */}
          <Link href={`/${locale}/blog/${blogPosts[0].slug}`} className="block mb-12">
            <Card variant="dark" className="group cursor-pointer overflow-hidden">
              <div className="md:flex md:items-center md:gap-12">
                <div className="md:w-1/2 mb-6 md:mb-0">
                  <div className="aspect-video bg-gradient-to-br from-[#BEF221]/20 to-gray-100 rounded-2xl" />
                </div>
                <div className="md:w-1/2">
                  <Badge className={categoryColors[blogPosts[0].category]}>
                    {blog.categories[blogPosts[0].category as keyof typeof blog.categories]}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 mb-4 group-hover:text-[#BEF221] transition-colors">
                    {t(blogPosts[0].title, locale)}
                  </h2>
                  <p className="text-gray-600 mb-6">{t(blogPosts[0].description, locale)}</p>
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      15/02/2024
                    </span>
                    <span>•</span>
                    <span>8 {blog.readTime}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Other Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Link key={post.slug} href={`/${locale}/blog/${post.slug}`}>
                <Card className="h-full group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-6" />
                  <Badge className={categoryColors[post.category]}>
                    {blog.categories[post.category as keyof typeof blog.categories]}
                  </Badge>
                  <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3 group-hover:text-[#BEF221] transition-colors line-clamp-2">
                    {t(post.title, locale)}
                  </h3>
                  <p className="text-gray-500 mb-4 line-clamp-2">{t(post.description, locale)}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      10/02/2024
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
        title={blog.ctaTitle}
        subtitle={blog.ctaSubtitle}
      />
    </>
  );
}
