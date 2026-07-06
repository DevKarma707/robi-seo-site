import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "glass" | "dark" | "accent" | "featured";
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
    default: "bg-white border border-gray-100 shadow-lg shadow-gray-200/40",
    glass: "bg-gray-100 backdrop-blur-xl border border-gray-200",
    dark: "bg-gray-50 border border-gray-200 text-gray-900",
    accent: "bg-white border border-[#BEF221]",
    featured: "bg-[#0D0630] border border-[#BEF221]/20 text-white",
  };

  const hoverVariants = {
    default:
      "hover:-translate-y-1 hover:border-[#BEF221]/50 hover:shadow-[0_8px_30px_rgba(190,242,33,0.15)]",
    glass: "hover:shadow-xl hover:-translate-y-1",
    dark: "hover:shadow-xl hover:-translate-y-1",
    accent:
      "hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(190,242,33,0.2)]",
    featured:
      "hover:-translate-y-1 hover:border-[#BEF221]/40 hover:shadow-[0_8px_30px_rgba(190,242,33,0.15)]",
  };

  const hoverStyles = hover ? hoverVariants[variant] : "";

  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
