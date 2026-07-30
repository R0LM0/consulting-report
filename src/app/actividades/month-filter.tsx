"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MESES_ES } from "@/lib/months";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";

/**
 * Multi-month filter: toggle any number of month chips and step through
 * years. Applies immediately via the URL (?anio=2026&meses=3,5,7).
 */
export function MonthFilter({
  year,
  selectedMonths,
}: {
  year: number;
  selectedMonths: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  function apply(nextYear: number, nextMonths: number[]) {
    const months = [...new Set(nextMonths)].sort((a, b) => a - b);
    if (months.length === 0) return; // nunca dejar la selección vacía
    router.replace(
      `${pathname}?anio=${nextYear}&meses=${months.join(",")}`,
      { scroll: false }
    );
  }

  function toggleMonth(month: number) {
    apply(
      year,
      selectedMonths.includes(month)
        ? selectedMonths.filter((m) => m !== month)
        : [...selectedMonths, month]
    );
  }

  const allSelected = selectedMonths.length === 12;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <CalendarIcon className="text-base text-brand-600" />
          Filtrar período
        </span>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            aria-label="Año anterior"
            onClick={() => apply(Math.max(2000, year - 1), selectedMonths)}
            disabled={year <= 2000}
            className="cursor-pointer rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900 disabled:opacity-30"
          >
            <ChevronLeftIcon />
          </button>
          <span className="min-w-14 text-center text-sm font-bold tabular-nums text-slate-900">
            {year}
          </span>
          <button
            type="button"
            aria-label="Año siguiente"
            onClick={() => apply(Math.min(2100, year + 1), selectedMonths)}
            disabled={year >= 2100}
            className="cursor-pointer rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900 disabled:opacity-30"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {MESES_ES.map((nombre, index) => {
          const month = index + 1;
          const active = selectedMonths.includes(month);
          return (
            <button
              key={nombre}
              type="button"
              onClick={() => toggleMonth(month)}
              aria-pressed={active}
              className={`relative cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {active ? (
                <motion.span
                  layoutId={`month-chip-${month}`}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute inset-0 rounded-full bg-brand-600 shadow-sm shadow-brand-600/40"
                />
              ) : null}
              <span className="relative z-10">
                <span className="sm:hidden">{nombre.slice(0, 3)}</span>
                <span className="hidden sm:inline">{nombre}</span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() =>
            apply(year, allSelected ? [selectedMonths[0]] : [1,2,3,4,5,6,7,8,9,10,11,12])
          }
          className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50"
        >
          {allSelected ? "Limpiar" : "Todos"}
        </button>
      </div>
    </div>
  );
}
