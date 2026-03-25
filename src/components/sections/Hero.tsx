"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeroMockups } from "@/components/ui/HeroMockups";

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
  ctaText = "",
  ctaHref = "https://www.robi-app.com",
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
    <section className={`relative pt-28 md:pt-32 overflow-hidden bg-[#0D0630] ${ctaText ? "pb-20 md:pb-16" : "pb-12 md:pb-10"}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,242,33,0.1),transparent_50%)]" />

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-[#BEF221]/10 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#BEF221]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isCenter ? (
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
              {title}
              {titleAccent && (
                <>
                  <br />
                  <span className="text-[#BEF221]">{titleAccent}</span>
                </>
              )}
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-2xl mx-auto">
              {subtitle}
            </p>

            {ctaText && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button href={ctaHref} size="lg">
                  {ctaText}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
                {title}
                {titleAccent && (
                  <>
                    <br />
                    <span className="text-[#BEF221]">{titleAccent}</span>
                  </>
                )}
              </h1>

              <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-2xl">
                {subtitle}
              </p>

              {ctaText && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button href={ctaHref} size="lg">
                    {ctaText}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Right side - Interactive Mockups */}
            <div className="hidden lg:block h-[520px] relative">
              <HeroMockups />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
