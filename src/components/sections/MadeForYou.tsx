"use client";

import { User, Building2, Users } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface MadeForYouProps {
  dict: any;
}

export function MadeForYou({ dict }: MadeForYouProps) {
  const m = dict.madeForYou;

  const profiles = [
    {
      icon: User,
      title: m.profile1Title,
      description: m.profile1Desc,
      color: "bg-[#BEF221]",
      iconColor: "text-[#0D0630]",
    },
    {
      icon: Building2,
      title: m.profile2Title,
      description: m.profile2Desc,
      color: "bg-[#0D0630]",
      iconColor: "text-[#BEF221]",
    },
    {
      icon: Users,
      title: m.profile3Title,
      description: m.profile3Desc,
      color: "bg-[#BEF221]",
      iconColor: "text-[#0D0630]",
    },
  ];

  return (
    <section className="py-14 md:py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10 md:mb-16">
          <p className="text-[#BEF221] font-bold text-sm uppercase tracking-wider mb-3 bg-[#0D0630] inline-block px-4 py-1.5 rounded-full">
            {m.badge}
          </p>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-[#0D0630]">
            {m.title}
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.map((profile, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="bg-white rounded-2xl p-7 border border-gray-200 hover:border-[#BEF221]/40 hover:shadow-lg transition-all duration-300 h-full">
                <div className={`w-12 h-12 rounded-xl ${profile.color} flex items-center justify-center mb-5`}>
                  <profile.icon className={`w-6 h-6 ${profile.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-[#0D0630] mb-3">
                  {profile.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {profile.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
