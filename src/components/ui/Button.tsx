"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  onClick?: () => void;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className = "",
  onClick,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-full transition-all transform hover:scale-105 active:scale-95";

  const variants = {
    primary:
      "bg-[#BEF221] text-[#0D0630] hover:bg-[#a8d61e] shadow-lg shadow-[#BEF221]/20",
    secondary:
      "bg-[#0D0630] text-white hover:bg-[#18314F]",
    outline:
      "border-2 border-[#0D0630] text-[#0D0630] hover:bg-[#0D0630] hover:text-white",
    ghost:
      "text-[#0D0630] hover:bg-[#0D0630]/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={combinedClassName}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  );
}
