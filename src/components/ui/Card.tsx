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
    glass: "bg-gray-100 backdrop-blur-xl border border-gray-200",
    dark: "bg-gray-50 border border-gray-200 text-gray-900",
    accent: "bg-white border border-[#BEF221]",
  };

  const hoverStyles = hover ? "hover:shadow-2xl hover:-translate-y-1" : "";

  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
