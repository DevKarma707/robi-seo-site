"use client";

import { ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import Image from "next/image";

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
  ctaText = "Essayer Gratuitement",
  ctaHref = "https://app.robi-app.com/signup",
  secondaryCtaText,
  secondaryCtaHref,
  variant = "default",
  socialProof = {
    text: "Rejoint par",
    highlight: "2000+",
    end: "freelances",
  },
}: HeroProps) {
  const isCenter = variant === "centered";

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-[#0D0630]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,242,33,0.15),transparent_60%)]" />

      {/* Floating blobs */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-[#BEF221]/10 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#BEF221]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${isCenter ? "text-center max-w-4xl mx-auto" : "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"}`}>

          {/* ── LEFT : Text Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
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

            <p className={`text-lg md:text-xl text-white/70 mb-10 leading-relaxed ${isCenter ? "max-w-2xl mx-auto" : "max-w-xl"}`}>
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
          </motion.div>

          {/* ── RIGHT : Animated Mockup ── */}
          {!isCenter && (
            <motion.div
              className="relative hidden lg:flex items-center justify-center"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              {/* Glow behind */}
              <div className="absolute inset-0 bg-[#BEF221]/10 rounded-3xl blur-3xl scale-90" />

              {/* Desktop screenshot */}
              <motion.div
                className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10 w-full"
                initial={{ y: 20 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/images/dashboard-desktop.png"
                  alt="Robi AI Dashboard"
                  width={900}
                  height={560}
                  className="w-full h-auto object-cover"
                  priority
                />
              </motion.div>

              {/* Mobile screenshot — bottom right overlay */}
              <motion.div
                className="absolute -bottom-6 -right-4 z-20 w-28 md:w-36 rounded-[1.8rem] overflow-hidden shadow-2xl border-4 border-[#0D0630]"
                initial={{ opacity: 0, y: 30, rotate: 3 }}
                animate={{ opacity: 1, y: [0, -6, 0], rotate: 3 }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.6 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                }}
              >
                <Image
                  src="/images/dashboard-mobile.png"
                  alt="Robi AI Mobile App"
                  width={400}
                  height={700}
                  className="w-full h-auto object-cover"
                />
              </motion.div>

              {/* Floating invoice card — top left */}
              <motion.div
                className="absolute -top-4 -left-6 z-20 bg-white rounded-xl shadow-xl p-3 flex items-center gap-3 border border-gray-100"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.8 },
                  scale: { duration: 0.5, delay: 0.8 },
                  y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 },
                }}
              >
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Facture Payée</div>
                  <div className="text-[10px] text-gray-400">À l&apos;instant via Stripe</div>
                </div>
              </motion.div>

            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}
