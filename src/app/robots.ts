import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Standard crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/"],
      },
      // OpenAI / ChatGPT
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
      // OpenAI browsing plugin
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      // Anthropic / Claude
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      // Anthropic web crawler
      {
        userAgent: "anthropic-ai",
        allow: "/",
      },
      // Google Gemini / Bard
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      // Perplexity AI
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      // Meta AI
      {
        userAgent: "FacebookBot",
        allow: "/",
      },
      // Cohere
      {
        userAgent: "cohere-ai",
        allow: "/",
      },
      // You.com
      {
        userAgent: "YouBot",
        allow: "/",
      },
    ],
    sitemap: "https://robi-app.com/sitemap.xml",
  };
}
