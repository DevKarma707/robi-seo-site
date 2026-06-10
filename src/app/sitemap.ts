import { MetadataRoute } from "next";
import {
  industries,
  comparisons,
  features,
  blogPosts,
  tools,
} from "@/data/seo-config";
import { locales } from "@/lib/i18n/config";
import { getPublishedArticles } from "@/lib/blog-articles";

// Revalidate so articles published from /admin appear in the sitemap.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://robi-app.com";

  // Helper: generate URLs for all locales
  function localizedUrls(
    path: string,
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never",
    priority: number
  ) {
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}${path}`])
          ),
          "x-default": `${baseUrl}/fr${path}`,
        },
      },
    }));
  }

  // Static pages
  const staticPages = [
    ...localizedUrls("", "weekly", 1),
    ...localizedUrls("/pricing", "weekly", 0.9),
    ...localizedUrls("/features", "weekly", 0.9),
    ...localizedUrls("/industries", "weekly", 0.8),
    ...localizedUrls("/blog", "daily", 0.8),
    ...localizedUrls("/tools", "monthly", 0.7),
    ...localizedUrls("/contact", "monthly", 0.6),
    ...localizedUrls("/legal", "yearly", 0.3),
    ...localizedUrls("/privacy", "yearly", 0.3),
    ...localizedUrls("/terms", "yearly", 0.3),
  ];

  // Industry pages
  const industryPages = industries.flatMap((industry) =>
    localizedUrls(`/industries/${industry.slug}`, "weekly", 0.8)
  );

  // Comparison pages
  const comparisonPages = comparisons.flatMap((comparison) =>
    localizedUrls(`/comparisons/${comparison.slug}`, "monthly", 0.7)
  );

  // Feature pages
  const featurePages = features.flatMap((feature) =>
    localizedUrls(`/features/${feature.slug}`, "monthly", 0.8)
  );

  // Blog posts (static, from seo-config)
  const blogPages = blogPosts.flatMap((post) =>
    localizedUrls(`/blog/${post.slug}`, "monthly", 0.6)
  );

  // Blog posts published from /admin (Firestore), excluding any static dup
  const dbArticles = await getPublishedArticles();
  const staticSlugs = new Set(blogPosts.map((p) => p.slug));
  const dbBlogPages = dbArticles
    .filter((a) => !staticSlugs.has(a.slug))
    .flatMap((a) => localizedUrls(`/blog/${a.slug}`, "weekly", 0.7));

  // Tools pages
  const toolPages = tools.flatMap((tool) =>
    localizedUrls(`/tools/${tool.slug}`, "monthly", 0.7)
  );

  return [
    ...staticPages,
    ...industryPages,
    ...comparisonPages,
    ...featurePages,
    ...blogPages,
    ...dbBlogPages,
    ...toolPages,
  ];
}
