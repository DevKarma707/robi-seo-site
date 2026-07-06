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
    "btn-slide inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 relative overflow-hidden";

  const variants = {
    primary:
      "btn-shine bg-[#BEF221] text-[#0D0630] hover:shadow-[0_0_30px_rgba(190,242,33,0.4)] shadow-lg shadow-[#BEF221]/20",
    secondary:
      "bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30",
    outline:
      "border border-[#BEF221]/30 text-[#BEF221] hover:border-[#BEF221] hover:bg-[#BEF221]/10",
    ghost:
      "text-white/70 hover:text-[#BEF221]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <span className="btn-text-wrapper">
      <span className="btn-text-original">{children}</span>
      <span className="btn-text-hover" aria-hidden="true">{children}</span>
    </span>
  );

  if (href) {
    return (
      <a href={href} className={combinedClassName}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={combinedClassName}>
      {content}
    </button>
  );
}
