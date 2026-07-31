"use client";

import { motion } from "framer-motion";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export function MonthHeatmap({
  daysInMonth,
  firstOffset,
  activeDays,
  todayDay,
}: {
  daysInMonth: number;
  /** Celdas vacías antes del día 1 (semana empezando en lunes). */
  firstOffset: number;
  /** Días del mes que tienen al menos una actividad. */
  activeDays: number[];
  todayDay: number;
}) {
  const active = new Set(activeDays);
  const coverage = Math.min(1, activeDays.length / Math.max(1, todayDay));

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="pb-1 text-center text-[10px] font-semibold uppercase text-slate-500"
          >
            {d}
          </span>
        ))}
        {Array.from({ length: firstOffset }, (_, i) => (
          <span key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const hasActivity = active.has(day);
          const isToday = day === todayDay;
          const isFuture = day > todayDay;
          return (
            <motion.span
              key={day}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.02 * day, duration: 0.25 }}
              title={
                hasActivity
                  ? `Día ${day}: con actividad`
                  : `Día ${day}: sin registro`
              }
              className={`flex aspect-square items-center justify-center rounded-md text-[11px] font-medium tabular-nums ${
                hasActivity
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                  : isFuture
                    ? "text-slate-600"
                    : "bg-white/[0.05] text-slate-400"
              } ${isToday ? "ring-2 ring-brand-400 ring-offset-1 ring-offset-[#111722]" : ""}`}
            >
              {day}
            </motion.span>
          );
        })}
      </div>

      <div className="mt-auto pt-5">
        <div className="mb-1.5 flex items-baseline justify-between text-xs">
          <span className="font-medium text-slate-400">
            Cobertura del mes
          </span>
          <span className="font-semibold tabular-nums text-slate-100">
            {activeDays.length} de {todayDay} días
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(coverage * 100)}%` }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
          />
        </div>
      </div>
    </div>
  );
}
