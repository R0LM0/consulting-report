"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MESES_ES } from "@/lib/months";
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";

/**
 * Multi-month filter: dropdown with checkboxes for any number of months,
 * plus a year stepper. Applies immediately via the URL
 * (?anio=2026&meses=3,5,7).
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function apply(nextYear: number, nextMonths: number[]) {
    const months = [...new Set(nextMonths)].sort((a, b) => a - b);
    if (months.length === 0) return; // nunca dejar la selección vacía
    router.replace(`${pathname}?anio=${nextYear}&meses=${months.join(",")}`, {
      scroll: false,
    });
  }

  function toggleMonth(month: number) {
    apply(
      year,
      selectedMonths.includes(month)
        ? selectedMonths.filter((m) => m !== month)
        : [...selectedMonths, month]
    );
  }

  const now = new Date();
  const summary =
    selectedMonths.length === 12
      ? "Todos los meses"
      : selectedMonths.length === 1
        ? MESES_ES[selectedMonths[0] - 1]
        : `${selectedMonths.length} meses`;

  return (
    <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-white/[0.07] bg-[#111722] p-4 shadow-card sm:p-5">
      <div ref={rootRef} className="relative w-full sm:w-72">
        <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <CalendarIcon className="text-sm text-brand-400" />
          Mes
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-slate-100 transition-shadow focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
        >
          {summary}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-400"
          >
            <ChevronDownIcon className="text-base" />
          </motion.span>
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#161d29] shadow-lg shadow-black/40"
            >
              <div className="flex items-center justify-between border-b border-white/[0.07] px-3.5 py-2.5">
                <span className="text-xs font-medium text-slate-500">
                  {selectedMonths.length} de 12 seleccionados
                </span>
                <span className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      apply(year, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
                    }
                    className="cursor-pointer text-xs font-semibold text-brand-400 hover:text-brand-300"
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => apply(year, [now.getMonth() + 1])}
                    className="cursor-pointer text-xs font-semibold text-slate-400 hover:text-slate-200"
                  >
                    Limpiar
                  </button>
                </span>
              </div>
              <ul role="listbox" aria-multiselectable className="max-h-64 overflow-y-auto p-1.5">
                {MESES_ES.map((nombre, index) => {
                  const month = index + 1;
                  const checked = selectedMonths.includes(month);
                  return (
                    <li key={nombre}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={checked}
                        onClick={() => toggleMonth(month)}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                          checked
                            ? "bg-brand-500/10 font-medium text-slate-100"
                            : "text-slate-300 hover:bg-white/[0.05]"
                        }`}
                      >
                        <span
                          className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                            checked
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-white/20 bg-transparent"
                          }`}
                        >
                          {checked ? <CheckIcon className="text-[11px]" /> : null}
                        </span>
                        {nombre}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Año
        </span>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          <button
            type="button"
            aria-label="Año anterior"
            onClick={() => apply(Math.max(2000, year - 1), selectedMonths)}
            disabled={year <= 2000}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-100 disabled:opacity-30"
          >
            <ChevronLeftIcon />
          </button>
          <span className="min-w-14 text-center text-sm font-bold tabular-nums text-slate-100">
            {year}
          </span>
          <button
            type="button"
            aria-label="Año siguiente"
            onClick={() => apply(Math.min(2100, year + 1), selectedMonths)}
            disabled={year >= 2100}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-100 disabled:opacity-30"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
