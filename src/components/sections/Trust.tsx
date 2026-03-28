"use client";

import { Shield, Server, Cloud, Lock } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface TrustProps {
  dict: any;
}

export function Trust({ dict }: TrustProps) {
  const tr = dict.trust;

  return (
    <section className="py-14 md:py-32 bg-[#0D0630] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(190,242,33,0.08),transparent_60%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10 md:mb-16">
          <p className="text-[#0D0630] font-bold text-sm uppercase tracking-wider mb-3 bg-[#BEF221] inline-block px-4 py-1.5 rounded-full">
            {tr.badge}
          </p>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white">
            {tr.title}
          </h2>
        </ScrollReveal>

        {/* Main card - highlighted */}
        <ScrollReveal className="mb-6">
          <div className="bg-[#BEF221] rounded-2xl p-8 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="w-12 h-12 rounded-xl bg-[#0D0630] flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#BEF221]" />
              </div>
              <h3 className="text-xl font-black text-[#0D0630] mb-3">
                {tr.mainTitle}
              </h3>
              <p className="text-[#0D0630]/70 leading-relaxed">
                {tr.mainDesc}
              </p>
            </div>
            {/* Decorative background shape */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0D0630]/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          </div>
        </ScrollReveal>

        {/* Secondary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal delay={100}>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full hover:border-[#BEF221]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Server className="w-5 h-5 text-[#BEF221]" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {tr.hostingTitle}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {tr.hostingDesc}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full hover:border-[#BEF221]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Cloud className="w-5 h-5 text-[#BEF221]" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {tr.cloudTitle}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {tr.cloudDesc}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full hover:border-[#BEF221]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-[#BEF221]" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {tr.encryptionTitle}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {tr.encryptionDesc}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
