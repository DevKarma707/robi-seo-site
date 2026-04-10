"use client";

import { ArrowRight, Sparkles, Zap } from "lucide-react";
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
  launchOffer?: {
    text: string;
    highlight: string;
  };
}

export function Hero({
  badge,
  title,
  titleAccent,
  subtitle,
  ctaText = "",
  ctaHref = "https://go.robi-app.com",
  secondaryCtaText,
  secondaryCtaHref,
  variant = "default",
  socialProof = {
    text: "Joined by",
    highlight: "2000+",
    end: "freelancers",
  },
  launchOffer,
}: HeroProps) {
  const isCenter = variant === "centered";

  const ctaBlock = ctaText && (
    <div className="flex flex-col gap-3 items-start">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button href={ctaHref} size="sm" className="!text-xs !px-5 !py-2.5 md:!px-8 md:!py-4 md:!text-base">
          {ctaText}
          <ArrowRight className="ml-1.5 w-3.5 h-3.5 md:w-5 md:h-5" />
        </Button>
      </div>
      {/* Launch offer pill - mobile highlight */}
      {launchOffer && (
        <div className="flex items-center gap-2 bg-white/5 border border-[#BEF221]/20 rounded-full px-3 py-1.5">
          <Zap className="w-3.5 h-3.5 text-[#BEF221]" />
          <span className="text-white/70 text-xs">
            {launchOffer.text}{" "}
            <span className="text-[#BEF221] font-bold">{launchOffer.highlight}</span>
          </span>
        </div>
      )}
    </div>
  );

  return (
    <section className={`relative pt-24 md:pt-32 overflow-hidden bg-[#0D0630] ${ctaText ? "pb-14 md:pb-16" : "pb-10 md:pb-10"}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,242,33,0.1),transparent_50%)]" />

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-[#BEF221]/10 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#BEF221]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isCenter ? (
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 md:mb-6 tracking-tight">
              {title}
              {titleAccent && (
                <>
                  <br />
                  <span className="text-[#BEF221]">{titleAccent}</span>
                </>
              )}
            </h1>

            <p className="text-base md:text-xl text-white/70 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto">
              {subtitle}
            </p>

            {ctaText && (
              <div className="flex flex-col items-center gap-3">
                <Button href={ctaHref} size="sm" className="!text-xs !px-5 !py-2.5 md:!px-8 md:!py-4 md:!text-base">
                  {ctaText}
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5 md:w-5 md:h-5" />
                </Button>
                {launchOffer && (
                  <div className="flex items-center gap-2 bg-white/5 border border-[#BEF221]/20 rounded-full px-3 py-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#BEF221]" />
                    <span className="text-white/70 text-xs">
                      {launchOffer.text}{" "}
                      <span className="text-[#BEF221] font-bold">{launchOffer.highlight}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left side - Content */}
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 md:mb-6 tracking-tight">
                {title}
                {titleAccent && (
                  <>
                    <br />
                    <span className="text-[#BEF221]">{titleAccent}</span>
                  </>
                )}
              </h1>

              <p className="text-base md:text-xl text-white/70 mb-6 md:mb-10 leading-relaxed max-w-2xl">
                {subtitle}
              </p>

              {ctaBlock}
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
