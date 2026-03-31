"use client";

import { ArrowRight, Zap } from "lucide-react";

interface InlineCTAProps {
  text?: string;
  href?: string;
  subtext?: string;
  variant?: "light" | "dark";
  showOffer?: boolean;
  offerText?: string;
}

export function InlineCTA({
  text = "Essayer gratuitement",
  href = "https://go.robi-app.com",
  subtext,
  variant = "light",
  showOffer = false,
  offerText = "59€ au lieu de 149€ — Offre de lancement",
}: InlineCTAProps) {
  const bg = variant === "dark" ? "bg-[#0D0630]" : "bg-gray-50";
  const textColor = variant === "dark" ? "text-white/50" : "text-gray-400";

  return (
    <div className={`${bg} py-6 lg:hidden`}>
      <div className="max-w-xs mx-auto px-5 text-center">
        <a
          href={href}
          className="flex items-center justify-center gap-1.5 w-full bg-[#BEF221] text-[#0D0630] font-bold text-xs py-2.5 px-5 rounded-full shadow-sm active:scale-95 transition-transform"
        >
          {text}
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
        {showOffer && offerText && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Zap className="w-3 h-3 text-[#BEF221]" />
            <p className="text-[10px] font-semibold text-[#BEF221]">{offerText}</p>
          </div>
        )}
        {!showOffer && subtext && (
          <p className={`${textColor} text-[10px] mt-1.5 font-medium`}>{subtext}</p>
        )}
      </div>
    </div>
  );
}
