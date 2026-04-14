"use client";

import { useState, useEffect } from "react";
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
  rotatingWords?: string[];
}

function WordRotator({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [words]);

  if (!words || words.length === 0) return null;

  return (
    <span className="relative inline-flex h-[1.1em] items-center overflow-hidden align-bottom">
      <span
        key={index}
        className="animate-slide-up-fade text-[#BEF221]"
      >
        {words[index]}
      </span>
    </span>
  );
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
  rotatingWords = ["Facture", "Envoi", "Relance", "Notifie"],
}: HeroProps) {
  const isCenter = variant === "centered";

  const ctaBlock = ctaText && (
    <div className="flex flex-col gap-3 items-center lg:items-start w-full">
      <Button href={ctaHref} size="sm" className="w-full lg:w-auto !text-sm !px-5 !py-3 md:!px-8 md:!py-4 md:!text-base">
        {ctaText}
        <ArrowRight className="ml-1.5 w-4 h-4 md:w-5 md:h-5" />
      </Button>
      {/* Launch offer pill */}
      {launchOffer && (
        <div className="flex items-center justify-center gap-2 w-full lg:w-auto bg-white/5 border border-[#BEF221]/20 rounded-full px-4 py-2">
          <Zap className="w-3.5 h-3.5 text-[#BEF221] shrink-0" />
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
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] mb-6 md:mb-8 tracking-tighter">
              <span className="block opacity-90">{title}</span>
              <span className="flex items-center justify-center gap-3">
                Robi <WordRotator words={rotatingWords} />
              </span>
              <span className="block text-[#BEF221]">{titleAccent}</span>
            </h1>

            <p className="text-base md:text-xl text-white/90 font-medium mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto bg-[#0D0630]/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5 whitespace-pre-line">
              {subtitle}
            </p>

            {ctaText && (
              <div className="flex flex-col items-center gap-3">
                <Button href={ctaHref} size="sm" className="!text-xs !px-5 !py-2.5 md:!px-8 md:!py-4 md:!text-base shadow-glow-sm hover:shadow-glow transition-all duration-300">
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
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 md:mb-8 tracking-tighter">
                <span className="block opacity-90">{title}</span>
                <span className="flex items-center justify-center lg:justify-start gap-3">
                  Robi <WordRotator words={rotatingWords} />
                </span>
                <span className="block text-[#BEF221]">{titleAccent}</span>
              </h1>

              <p className="text-base md:text-xl text-white/90 font-medium mb-6 md:mb-10 leading-relaxed max-w-2xl whitespace-pre-line mx-auto lg:mx-0">
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
