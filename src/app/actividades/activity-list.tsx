"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ActivityItem, type ActivityItemData } from "./activity-item";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
} from "@/components/icons";
import { Input } from "@/components/ui/input";
import { MESES_ES } from "@/lib/months";

const PAGE_SIZE = 5;
const WEEKDAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const WEEKDAYS_LONG = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export interface ActivityGroup {
  key: string;
  label: string;
  items: ActivityItemData[];
}

interface DayGroup {
  /** "YYYY-MM-DD" */
  key: string;
  shortLabel: string;
  longLabel: string;
  items: ActivityItemData[];
}

interface MonthDays {
  key: string;
  label: string;
  days: DayGroup[];
}

/** Lowercase and strip accents so "telemetria" matches "telemetría". */
function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function toDayGroup(key: string, items: ActivityItemData[]): DayGroup {
  const date = new Date(`${key}T00:00:00.000Z`);
  const weekday = date.getUTCDay();
  const day = date.getUTCDate();
  const month = MESES_ES[date.getUTCMonth()].toLowerCase();
  return {
    key,
    shortLabel: `${WEEKDAYS_SHORT[weekday]} ${day}`,
    longLabel: `${WEEKDAYS_LONG[weekday]} ${day} de ${month} de ${date.getUTCFullYear()}`,
    items,
  };
}

/** Splits each month's (already sorted) items into per-day groups. */
function groupByDay(groups: ActivityGroup[]): MonthDays[] {
  return groups.map((group) => {
    const byDay = new Map<string, ActivityItemData[]>();
    for (const item of group.items) {
      const list = byDay.get(item.dateInputValue) ?? [];
      list.push(item);
      byDay.set(item.dateInputValue, list);
    }
    return {
      key: group.key,
      label: group.label,
      days: [...byDay].map(([key, items]) => toDayGroup(key, items)),
    };
  });
}

export function ActivityList({
  groups,
  emptyMessage,
}: {
  groups: ActivityGroup[];
  emptyMessage: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const months = groupByDay(groups);
  const allDays = months.flatMap((m) => m.days);
  const total = allDays.reduce((sum, d) => sum + d.items.length, 0);

  if (total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-12 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-xl text-brand-400">
          <ClipboardIcon />
        </span>
        <p className="max-w-xs text-sm text-slate-400">{emptyMessage}</p>
      </motion.div>
    );
  }

  // Fall back to the most recent day when nothing (or a deleted day) is selected.
  const selectedDay =
    allDays.find((d) => d.key === selectedDayKey) ?? allDays[0];

  const normalizedQuery = normalizeText(query.trim());
  const isSearching = normalizedQuery.length > 0;
  const panelItems = isSearching
    ? allDays
        .flatMap((d) => d.items)
        .filter(
          (item) =>
            normalizeText(item.description).includes(normalizedQuery) ||
            item.dateDisplay.includes(normalizedQuery)
        )
    : selectedDay.items;

  const pageCount = Math.max(1, Math.ceil(panelItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = panelItems.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  function selectDay(key: string) {
    setSelectedDayKey(key);
    setQuery("");
    setPage(0);
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
        placeholder="Buscar en todos los días por texto o fecha (dd/mm/aaaa)…"
        aria-label="Buscar actividades"
      />

      {/* grid-cols-[minmax(0,1fr)]: sin esto, en móvil la pista "auto" crece al ancho
          de la tira de días y ensancha toda la página (Chrome la achica). */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[13rem_minmax(0,1fr)] md:items-start">
        <DayNav
          months={months}
          selectedKey={isSearching ? null : selectedDay.key}
          onSelect={selectDay}
        />

        <section className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
            <h2 className="text-sm font-semibold text-slate-100">
              {isSearching
                ? `Resultados para “${query.trim()}”`
                : selectedDay.longLabel}
            </h2>
            <span className="text-xs tabular-nums text-slate-500">
              {panelItems.length}{" "}
              {panelItems.length === 1 ? "actividad" : "actividades"}
              {isSearching ? ` de ${total}` : ""}
            </span>
          </div>

          {panelItems.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/15 py-8 text-center text-sm text-slate-400">
              Ninguna actividad coincide con “{query.trim()}”.
            </p>
          ) : (
            <motion.ul layout className="flex flex-col gap-2">
              <AnimatePresence initial={false} mode="popLayout">
                {pageItems.map((activity) => (
                  <motion.li
                    key={activity.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  >
                    <ActivityItem activity={activity} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}

          {pageCount > 1 ? (
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              onChange={setPage}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function DayNav({
  months,
  selectedKey,
  onSelect,
}: {
  months: MonthDays[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <nav
      aria-label="Días con actividades"
      className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#111722] p-2 md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:overflow-y-auto"
    >
      {months.map((month) => (
        <div key={month.key} className="md:mb-2 md:last:mb-0">
          <h3 className="hidden px-2 pb-1 pt-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 md:block">
            {month.label}
          </h3>
          {/* Horizontal strip on mobile, vertical list on desktop. */}
          <ul className="flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:gap-0.5 md:overflow-visible md:pb-0">
            {month.days.map((day) => {
              const isActive = day.key === selectedKey;
              return (
                <li key={day.key} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelect(day.key)}
                    aria-current={isActive ? "date" : undefined}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-brand-500/15 font-semibold text-brand-200"
                        : "text-slate-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="whitespace-nowrap">{day.shortLabel}</span>
                    <span
                      className={`rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                        isActive
                          ? "bg-brand-500/25 text-brand-100"
                          : "bg-white/[0.06] text-slate-400"
                      }`}
                    >
                      {day.items.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  const buttonClass =
    "flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className={buttonClass}
      >
        <ChevronLeftIcon className="text-sm" />
        Anterior
      </button>
      <span className="text-xs tabular-nums text-slate-500">
        Página {page + 1} de {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount - 1}
        className={buttonClass}
      >
        Siguiente
        <ChevronRightIcon className="text-sm" />
      </button>
    </div>
  );
}
