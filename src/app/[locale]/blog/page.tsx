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
import {
  getPublishedArticles,
  articleTitle,
  articleExcerpt,
  articleReadTime,
} from "@/lib/blog-articles";

// Revalidate so articles published from /admin (Firestore) appear within ~1 min.
export const revalidate = 60;

type BlogCard = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readMinutes: number;
  coverImage?: string;
};

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

  // Static articles (seo-config) merged with those published from /admin (Firestore).
  const staticCards: BlogCard[] = blogPosts.map((post) => {
    const rt = post.readTime;
    const readMinutes =
      typeof rt === "object"
        ? (rt as Record<string, number>)[locale] ?? (rt as Record<string, number>).fr
        : (rt as number);
    return {
      slug: post.slug,
      title: t(post.title, locale),
      description: t(post.description, locale),
      category: post.category,
      date: post.date,
      readMinutes,
    };
  });

  const dbArticles = await getPublishedArticles();
  const dbCards: BlogCard[] = dbArticles
    .filter((a) => !blogPosts.some((p) => p.slug === a.slug))
    .map((a) => ({
      slug: a.slug,
      title: articleTitle(a, locale),
      description: articleExcerpt(a, locale),
      category: a.category,
      date: a.date,
      readMinutes: articleReadTime(a, locale),
      coverImage: a.coverImage,
    }));

  const items = [...staticCards, ...dbCards].sort((a, b) => (a.date < b.date ? 1 : -1));
  const featured = items[0];
  const rest = items.slice(1);

  return (
    <>
      {/* JSON-LD for BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `https://robi-app.com/${locale}`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: blog.heroBadge,
                item: `https://robi-app.com/${locale}/blog`,
              },
            ],
          }),
        }}
      />

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
          {featured && (
            <Link href={`/${locale}/blog/${featured.slug}`} className="block mb-12">
              <Card variant="dark" className="group cursor-pointer overflow-hidden">
                <div className="md:flex md:items-center md:gap-12">
                  {featured.coverImage && (
                    <div className="md:w-1/2 mb-6 md:mb-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={featured.coverImage} alt={featured.title} className="aspect-video w-full object-cover rounded-2xl" />
                    </div>
                  )}
                  <div className={featured.coverImage ? "md:w-1/2" : "w-full"}>
                    <Badge className={categoryColors[featured.category] ?? categoryColors.guides}>
                      {blog.categories[featured.category as keyof typeof blog.categories] ?? featured.category}
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 mb-4 group-hover:text-[#BEF221] transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-gray-600 mb-6">{featured.description}</p>
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(featured.date).toLocaleDateString(locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                      </span>
                      <span>•</span>
                      <span>{featured.readMinutes} {blog.readTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {/* Other Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post) => (
              <Link key={post.slug} href={`/${locale}/blog/${post.slug}`}>
                <Card className="h-full group cursor-pointer">
                  {post.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.coverImage} alt={post.title} className="aspect-video w-full object-cover rounded-xl mb-6" />
                  )}
                  <Badge className={categoryColors[post.category] ?? categoryColors.guides}>
                    {blog.categories[post.category as keyof typeof blog.categories] ?? post.category}
                  </Badge>
                  <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3 group-hover:text-[#BEF221] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 mb-4 line-clamp-2">{post.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString(locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-GB", { day: "2-digit", month: "short", year: "numeric" })}
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
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
