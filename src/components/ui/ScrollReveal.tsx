"use client";

import { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade" | "clip";
}

export function ScrollReveal({
  children,
  className = "",
  delay,
  variant = "fade",
}: ScrollRevealProps) {
  const ref = useScrollReveal<HTMLDivElement>();
  const variantClass = variant === "clip" ? "clip-reveal" : "scroll-reveal";

  return (
    <div
      ref={ref}
      className={`${variantClass} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
