"use client";

import { User, Building2, Users } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { H2, SECTION } from "./shared";

interface MadeForYouProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

/** « Fait pour vous si… » : trois grandes cartes ; sur mobile elles défilent au doigt (plus rien n'est masqué). */
export function MadeForYou({ dict }: MadeForYouProps) {
  const m = dict.madeForYou;
  const profiles = [
    { icon: User, title: m.profile1Title, description: m.profile1Desc },
    { icon: Building2, title: m.profile2Title, description: m.profile2Desc },
    { icon: Users, title: m.profile3Title, description: m.profile3Desc },
  ];

  return (
    <section className={`${SECTION} bg-gray-50 overflow-hidden`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className={`${H2} text-[#0D0630]`}>{m.title}</h2>
        </ScrollReveal>

        <ScrollReveal>
          <div className="home-snap -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
            {profiles.map((profile, index) => (
              <div key={index} className="home-rise w-[82%] shrink-0 md:w-auto" style={{ "--i": index } as React.CSSProperties}>
                <div className={`flex h-full flex-col rounded-[28px] p-7 md:p-8 transition-transform duration-500 hover:-translate-y-1 ${index === 1 ? "bg-[#0D0630] text-white" : "border border-gray-200 bg-white text-[#0D0630]"}`}>
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${index === 1 ? "bg-[#BEF221] text-[#0D0630]" : "bg-[#0D0630] text-[#BEF221]"}`}>
                    <profile.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold leading-tight tracking-tight md:text-2xl">{profile.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed md:text-[15px] ${index === 1 ? "text-white/65" : "text-gray-500"}`}>{profile.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
