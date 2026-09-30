"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LaunchSeats, useLaunchOffer, formatCurrentLaunchPrice } from "@/components/ui/LaunchSeats";
import { HeroMockups } from "@/components/ui/HeroMockups";
import { HeroStory } from "@/components/ui/HeroStory";
import { HeroDevice } from "@/components/ui/HeroDevice";
import type { HeroDeviceCopy } from "@/lib/i18n/heroDevice";
import dynamic from "next/dynamic";

// Fond WebGL chargé à part, sans rendu serveur : le héro s'affiche d'abord sur l'Amethyst.
const HeroShaderBackground = dynamic(() => import("@/components/ui/HeroShaderBackground"), { ssr: false });
import type { HeroStoryCopy } from "@/lib/i18n/heroStory";
import storyStyles from "@/components/ui/HeroStory.module.css";

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
    /** Compteur de places live (LaunchSeats), affiché après le prix. */
    seats?: { locale: string; remainingText: string; trancheText?: string; nextText?: string; deadlineText?: string };
    /**
     * « Accès à vie » : quand le prix de la tranche courante est connu, le
     * hero affiche « <prix live> — <lifetimeLabel> » au lieu du prix figé du
     * rendu serveur, pour ne jamais annoncer 59 € quand la tranche est à 79 €.
     */
    lifetimeLabel?: string;
  };
  rotatingWords?: string[];
  /** Le titre lui-même défile (« Parlez » ↔ « Écrivez ») : Robi se pilote à
   *  la voix comme au clavier. Sans liste, le titre reste fixe. */
  titleWords?: string[];
  /** `device` : le téléphone 3D flottant (essai du 30/09/2026), même mise
   *  en page que `editorial`, seul le visuel change ; la démo à l'écran
   *  rejoue les scénarios de `story`. */
  visual?: "mockups" | "editorial" | "device";
  story?: HeroStoryCopy;
  /** Textes de la démo du téléphone 3D (`visual="device"`). */
  device?: HeroDeviceCopy;
}

function WordRotator({ words, className = "text-[#BEF221]", delay = 0 }: { words: string[]; className?: string; delay?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    let start: ReturnType<typeof setTimeout> | undefined;
    const sync = () => {
      clearInterval(timer);
      clearTimeout(start);
      if (!motion.matches) {
        // Décalage : deux mots qui changent au même instant se lisent mal.
        start = setTimeout(() => {
          timer = setInterval(() => setIndex((prev) => (prev + 1) % words.length), 2500);
        }, delay);
      }
    };
    sync();
    motion.addEventListener("change", sync);
    return () => {
      clearInterval(timer);
      clearTimeout(start);
      motion.removeEventListener("change", sync);
    };
  }, [words]);

  if (!words || words.length === 0) return null;

  return (
    <span className="relative inline-flex h-[1.1em] items-center overflow-hidden align-bottom">
      <span
        key={index}
        className={`animate-slide-up-fade ${className}`}
      >
        {words[index]}
      </span>
    </span>
  );
}

export function Hero({
  title,
  titleAccent,
  subtitle,
  ctaText = "",
  ctaHref = "https://go.robi-app.com/?signup",
  variant = "default",
  launchOffer,
  rotatingWords = ["Facture", "Envoi", "Relance", "Notifie"],
  titleWords,
  visual = "mockups",
  story,
  device,
}: HeroProps) {
  const isCenter = variant === "centered";
  const isEditorial = !isCenter && (visual === "editorial" || visual === "device") && !!story;
  const editorialVisual = isEditorial && story
    ? visual === "device" && device ? <HeroDevice copy={device} /> : <HeroStory copy={story} />
    : null;

  const offreLive = useLaunchOffer();
  const prixLive = launchOffer?.seats && offreLive?.tranche
    ? formatCurrentLaunchPrice(offreLive.tranche.price, launchOffer.seats.locale)
    : null;
  const offerHighlight = launchOffer
    ? (prixLive && launchOffer.lifetimeLabel ? `${prixLive} — ${launchOffer.lifetimeLabel}` : launchOffer.highlight)
    : "";

  const ctaBlock = ctaText && (
    <div className={`flex flex-col gap-3 items-center lg:items-start w-full ${isEditorial ? storyStyles.actions : ""}`}>
      <Button href={ctaHref} size="sm" className={`w-full lg:w-auto !text-sm !px-5 !py-3 md:!px-8 md:!py-4 md:!text-base ${isEditorial ? storyStyles.cta : ""}`}>
        {ctaText}
        <ArrowRight className="ml-1.5 w-4 h-4 md:w-5 md:h-5" />
      </Button>
      {/* Launch offer pill */}
      {launchOffer && (
        <div className={`flex items-center justify-center gap-2 w-full lg:w-auto bg-white/5 border border-[#BEF221]/20 rounded-full px-4 py-2 ${isEditorial ? storyStyles.offer : ""}`}>
          <Zap className="w-3.5 h-3.5 text-[#BEF221] shrink-0" />
          <span className="text-white/70 text-xs">
            {launchOffer.text}{" "}
            <span className="text-[#BEF221] font-bold">{offerHighlight}</span>
            {launchOffer.seats && (
              <LaunchSeats compact className="text-white/50" {...launchOffer.seats} />
            )}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <section className={`relative overflow-hidden bg-[#0D0630] ${isEditorial ? storyStyles.hero : `pt-24 md:pt-32 ${ctaText ? "pb-14 md:pb-16" : "pb-10 md:pb-10"}`}`}>
      {isEditorial && <HeroShaderBackground />}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isCenter ? (
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] mb-6 md:mb-8 tracking-tighter">
              <span className="block opacity-90">
                {titleWords && titleWords.length > 1
                  ? <WordRotator words={titleWords} className="text-white" delay={1250} />
                  : title}
              </span>
              {rotatingWords.length > 0 && (
                <span className="flex items-center justify-center gap-3">
                  Robi <WordRotator words={rotatingWords} />
                </span>
              )}
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
                      <span className="text-[#BEF221] font-bold">{offerHighlight}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${isEditorial ? storyStyles.layout : ""}`}>
            {/* Left side - Content */}
            <div className={`text-center lg:text-left ${isEditorial ? storyStyles.content : ""}`}>
              {isEditorial && <p className={storyStyles.eyebrow}>{story.eyebrow}</p>}
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 md:mb-8 tracking-tighter ${isEditorial ? storyStyles.heading : ""}`}>
                <span className="block opacity-90">
                {titleWords && titleWords.length > 1
                  ? <WordRotator words={titleWords} className="text-white" delay={1250} />
                  : title}
              </span>
                {rotatingWords.length > 0 && (
                  <span className="flex items-center justify-center lg:justify-start gap-3">
                    Robi <WordRotator words={rotatingWords} />
                  </span>
                )}
                <span className="block text-[#BEF221]">{titleAccent}</span>
              </h1>

              <p className={`text-base md:text-xl text-white/90 font-medium mb-6 md:mb-10 leading-relaxed max-w-2xl whitespace-pre-line mx-auto lg:mx-0 ${isEditorial ? storyStyles.subtitle : ""}`}>
                {subtitle}
              </p>

              {ctaBlock}
            </div>

            <div className={isEditorial ? storyStyles.visual : "relative hidden h-[520px] lg:block"}>
              {isEditorial ? editorialVisual : <HeroMockups />}
            </div>
          </div>
        )}
      </div>

    </section>
  );
}
