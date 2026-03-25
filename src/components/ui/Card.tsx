import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "glass" | "dark" | "accent";
  className?: string;
  hover?: boolean;
}

export function Card({
  children,
  variant = "default",
  className = "",
  hover = true,
}: CardProps) {
  const baseStyles = "rounded-3xl p-8 transition-all duration-300";

  const variants = {
    default: "bg-[#120A3D] border border-white/[0.06] text-white",
    glass: "bg-white/5 backdrop-blur-xl border border-white/10 text-white",
    dark: "bg-[#0A0425] border border-white/[0.06] text-white",
    accent: "bg-[#BEF221]/5 border border-[#BEF221]/20 text-white",
  };

  const hoverStyles = hover
    ? "card-3d hover:border-[#BEF221]/30 hover:shadow-[0_0_40px_rgba(190,242,33,0.1)]"
    : "";

  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
