import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CTAProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryText?: string;
  fadeTop?: boolean;
}

function StyledRobiTitle({ text }: { text: string }) {
  // Split on "Robi AI" and render AI in green to match nav pill
  const parts = text.split(/(Robi\s*AI)/gi);
  return (
    <>
      {parts.map((part, i) =>
        /Robi\s*AI/i.test(part) ? (
          <span key={i} className="font-black">
            Robi <span className="text-[#BEF221]">AI</span>
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function CTA({
  title = "Ready to automate your invoicing?",
  subtitle = "Join the entrepreneurs invoicing effortlessly",
  ctaText = "Start with Robi AI",
  ctaHref = "https://go.robi-app.com/?signup",
  secondaryText = "No card • Cancel anytime",
}: CTAProps) {
  return (
    <section className="py-16 md:py-28 lg:py-32 bg-[#0D0630] relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[820px] max-w-[140vw] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(190,242,33,0.14), rgba(190,242,33,0))" }} aria-hidden="true" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/robot-mark.svg"
          alt=""
          aria-hidden="true"
          className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-5 md:mb-8 drop-shadow-[0_0_25px_rgba(190,242,33,0.45)]"
        />
        <h2 className="text-[26px] md:text-3xl lg:text-4xl font-black text-white mb-3 md:mb-6 tracking-tight leading-[1.12] [text-wrap:balance]">
          <StyledRobiTitle text={title} />
        </h2>
        <p className="text-base md:text-lg text-white/60 mb-7 md:mb-12">{subtitle}</p>

        <div className="flex flex-col items-center gap-3 md:gap-4">
          <Button href={ctaHref} size="sm" className="!text-sm !px-7 !py-3.5 md:!text-xl md:!px-10 md:!py-5">
            {ctaText}
            <ArrowRight className="ml-1.5 w-4 h-4 md:w-6 md:h-6" />
          </Button>
          <p className="text-white/45 text-[11px] md:text-sm font-medium uppercase tracking-widest">
            {secondaryText}
          </p>
        </div>
      </div>
    </section>
  );
}
