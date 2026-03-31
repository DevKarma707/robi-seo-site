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
    default: "bg-gray-100 text-gray-600 border-gray-200",
    success: "bg-[#BEF221] text-[#0D0630] border-[#BEF221] font-black",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
    accent:
      "bg-[#BEF221] text-[#0D0630] border-[#BEF221] font-black",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
