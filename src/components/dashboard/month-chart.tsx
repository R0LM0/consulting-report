"use client";

import { motion } from "framer-motion";

export interface MonthDatum {
  label: string;
  count: number;
  current: boolean;
}

export function MonthChart({ data }: { data: MonthDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex h-40 items-end gap-2 sm:gap-3">
      {data.map((d, i) => (
        <div
          key={d.label}
          className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          title={`${d.label}: ${d.count} actividad(es)`}
        >
          <span
            className={`text-[11px] font-semibold tabular-nums ${
              d.count > 0 ? "text-slate-200" : "text-slate-600"
            }`}
          >
            {d.count > 0 ? d.count : ""}
          </span>
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              delay: 0.15 + i * 0.045,
              type: "spring",
              stiffness: 210,
              damping: 24,
            }}
            style={{
              height: `${Math.max(d.count > 0 ? 8 : 3, (d.count / max) * 100)}%`,
            }}
            className={`w-full origin-bottom rounded-t-md ${
              d.current
                ? "bg-gradient-to-t from-brand-600 to-brand-400 shadow-sm shadow-brand-500/40"
                : d.count > 0
                  ? "bg-brand-500/25"
                  : "bg-white/[0.05]"
            }`}
          />
          <span
            className={`font-mono text-[10px] font-medium uppercase tracking-wide ${
              d.current ? "text-brand-400" : "text-slate-500"
            }`}
          >
            {d.label.slice(0, 3)}
          </span>
        </div>
      ))}
    </div>
  );
}
