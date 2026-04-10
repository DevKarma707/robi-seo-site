import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CTAProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryText?: string;
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
  subtitle = "Join 2000+ entrepreneurs who invoice effortlessly",
  ctaText = "Start with Robi AI",
  ctaHref = "https://go.robi-app.com",
  secondaryText = "No card • Cancel anytime",
}: CTAProps) {
  return (
    <section className="py-10 md:py-32 bg-[#0D0630] relative overflow-hidden">
      {/* Subtle background line only */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-3 md:mb-6 tracking-tight">
          <StyledRobiTitle text={title} />
        </h2>
        <p className="text-sm md:text-lg text-white/60 mb-6 md:mb-12">{subtitle}</p>

        <div className="flex flex-col items-center gap-3 md:gap-4">
          <Button href={ctaHref} size="sm" className="!text-xs !px-5 !py-2.5 md:!text-xl md:!px-10 md:!py-5">
            {ctaText}
            <ArrowRight className="ml-1.5 w-3.5 h-3.5 md:w-6 md:h-6" />
          </Button>
          <p className="text-white/40 text-[10px] md:text-base font-medium uppercase tracking-widest">
            {secondaryText}
          </p>
        </div>
      </div>
    </section>
  );
}
