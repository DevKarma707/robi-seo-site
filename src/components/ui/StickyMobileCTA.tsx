"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface StickyMobileCTAProps {
  text?: string;
  href?: string;
}

export function StickyMobileCTA({
  text = "Essayer gratuitement",
  href = "https://www.robi-app.com",
}: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (~500px)
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-[#0D0630]/95 backdrop-blur-md border-t border-white/10 px-4 py-2.5">
        <a
          href={href}
          className="flex items-center justify-center gap-1.5 w-full bg-[#BEF221] text-[#0D0630] font-bold text-xs py-2.5 rounded-full shadow-lg shadow-[#BEF221]/20 active:scale-95 transition-transform"
        >
          {text}
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
