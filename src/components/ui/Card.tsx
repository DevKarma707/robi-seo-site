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
    default: "bg-white border border-gray-100 shadow-xl shadow-gray-200/50",
    glass: "bg-white/10 backdrop-blur-xl border border-white/20",
    dark: "bg-[#0D0630] border border-white/10 text-white",
    accent: "bg-[#BEF221]/10 border border-[#BEF221]/30",
  };

  const hoverStyles = hover ? "hover:shadow-2xl hover:-translate-y-1" : "";

  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
