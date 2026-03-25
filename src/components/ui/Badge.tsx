import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "accent";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border";

  const variants = {
    default: "bg-white/10 text-white/80 border-white/10",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    accent: "bg-[#BEF221]/10 text-[#BEF221] border-[#BEF221]/30 animate-glow-breathe",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
