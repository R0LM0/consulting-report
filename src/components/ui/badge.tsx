import type { ReactNode } from "react";

type Tone = "brand" | "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-500/10 text-brand-300 ring-brand-400/25",
  success: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25",
  warning: "bg-amber-500/10 text-amber-300 ring-amber-400/25",
  danger: "bg-red-500/10 text-red-300 ring-red-400/25",
  neutral: "bg-white/[0.06] text-slate-300 ring-white/10",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-xs font-medium ring-1 ring-inset ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
