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
  // Refonte du 30/09/2026 : surfaces à plat, 28 px, aucune ombre portée.
  const baseStyles = "rounded-[28px] p-6 md:p-8 transition-all duration-500";

  const variants = {
    default: "bg-white border border-gray-200",
    glass: "bg-[#F6F5FA] border border-gray-200",
    dark: "bg-gray-50 border border-gray-200 text-gray-900",
    accent: "bg-white border border-[#BEF221]",
    featured: "bg-[#0D0630] border border-[#BEF221]/20 text-white",
  };

  const hoverVariants = {
    default: "hover:-translate-y-1 hover:border-[#0D0630]/25",
    glass: "hover:-translate-y-1",
    dark: "hover:-translate-y-1",
    accent: "hover:-translate-y-1",
    featured: "hover:-translate-y-1 hover:border-[#BEF221]/40",
  };

  const hoverStyles = hover ? hoverVariants[variant] : "";

  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
