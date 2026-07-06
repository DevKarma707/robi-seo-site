"use client";

import { Shield, Server, Cloud, Lock } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface TrustProps {
  dict: any;
}

export function Trust({ dict }: TrustProps) {
  const tr = dict.trust;

  return (
    <section className="py-8 md:py-32 bg-[#0D0630] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(190,242,33,0.08),transparent_60%)]" />

      {/* Smooth transitions with adjacent light sections */}
      <div className="absolute inset-x-0 top-0 h-16 md:h-24 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 md:h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-5 md:mb-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white">
            {tr.title}
          </h2>
        </ScrollReveal>

        {/* Main card - highlighted */}
        <ScrollReveal className="mb-3 md:mb-6">
          <div className="bg-[#BEF221] rounded-2xl p-4 md:p-8 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl bg-[#0D0630] flex items-center justify-center mb-3 md:mb-4">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#BEF221]" />
              </div>
              <h3 className="text-base md:text-xl font-black text-[#0D0630] mb-1.5 md:mb-3">
                {tr.mainTitle}
              </h3>
              <p className="text-[#0D0630]/70 text-sm md:text-base leading-relaxed">
                {tr.mainDesc}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0D0630]/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          </div>
        </ScrollReveal>

        {/* Secondary cards */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6">
          <ScrollReveal delay={100}>
            <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-6 h-full hover:border-[#BEF221]/30 transition-colors">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/10 flex items-center justify-center mb-2 md:mb-4">
                <Server className="w-4 h-4 md:w-5 md:h-5 text-[#BEF221]" />
              </div>
              <h3 className="text-xs md:text-base font-bold text-white mb-1 md:mb-2 leading-tight">
                {tr.hostingTitle}
              </h3>
              <p className="text-white/50 text-[10px] md:text-sm leading-relaxed hidden md:block">
                {tr.hostingDesc}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-6 h-full hover:border-[#BEF221]/30 transition-colors">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/10 flex items-center justify-center mb-2 md:mb-4">
                <Cloud className="w-4 h-4 md:w-5 md:h-5 text-[#BEF221]" />
              </div>
              <h3 className="text-xs md:text-base font-bold text-white mb-1 md:mb-2 leading-tight">
                {tr.cloudTitle}
              </h3>
              <p className="text-white/50 text-[10px] md:text-sm leading-relaxed hidden md:block">
                {tr.cloudDesc}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-6 h-full hover:border-[#BEF221]/30 transition-colors">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/10 flex items-center justify-center mb-2 md:mb-4">
                <Lock className="w-4 h-4 md:w-5 md:h-5 text-[#BEF221]" />
              </div>
              <h3 className="text-xs md:text-base font-bold text-white mb-1 md:mb-2 leading-tight">
                {tr.encryptionTitle}
              </h3>
              <p className="text-white/50 text-[10px] md:text-sm leading-relaxed hidden md:block">
                {tr.encryptionDesc}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
