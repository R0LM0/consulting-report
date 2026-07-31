"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-500 focus-visible:outline-brand-400",
  secondary:
    "bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 focus-visible:outline-brand-400",
  outline:
    "border border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.05] hover:border-white/25 focus-visible:outline-slate-400",
  danger:
    "border border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 focus-visible:outline-red-400",
  ghost: "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "submit",
  ...props
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
