"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface HeroProps {
  badge?: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  variant?: "default" | "centered" | "split";
  socialProof?: {
    text: string;
    highlight: string;
    end: string;
  };
}

export function Hero({
  badge,
  title,
  titleAccent,
  subtitle,
  ctaText = "Start Free",
  ctaHref = "/signup",
  secondaryCtaText,
  secondaryCtaHref,
  variant = "default",
  socialProof = {
    text: "Joined by",
    highlight: "2000+",
    end: "freelancers",
  },
}: HeroProps) {
  const isCenter = variant === "centered";

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-[#0D0630]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,242,33,0.1),transparent_50%)]" />

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-[#BEF221]/10 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#BEF221]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${isCenter ? "text-center max-w-4xl mx-auto" : "max-w-3xl"}`}>
          {badge && (
            <div className={`mb-6 ${isCenter ? "flex justify-center" : ""}`}>
              <Badge variant="accent">
                <Sparkles className="w-3 h-3 mr-1" />
                {badge}
              </Badge>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            {title}
            {titleAccent && (
              <>
                <br />
                <span className="text-[#BEF221]">{titleAccent}</span>
              </>
            )}
          </h1>

          <p className={`text-lg md:text-xl text-white/70 mb-10 leading-relaxed ${isCenter ? "max-w-2xl mx-auto" : "max-w-2xl"}`}>
            {subtitle}
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 ${isCenter ? "justify-center" : ""}`}>
            <Button href={ctaHref} size="lg">
              {ctaText}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            {secondaryCtaText && secondaryCtaHref && (
              <Button href={secondaryCtaHref} variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                {secondaryCtaText}
              </Button>
            )}
          </div>

          {/* Social proof */}
          <div className={`mt-12 flex items-center gap-4 text-white/50 text-sm ${isCenter ? "justify-center" : ""}`}>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BEF221] to-[#0D0630] border-2 border-[#0D0630]"
                />
              ))}
            </div>
            <span>
              {socialProof.text} <strong className="text-white">{socialProof.highlight}</strong> {socialProof.end}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
