"use client";

import { useRouter } from "next/navigation";
import { MESES_ES } from "@/lib/months";
import { Field, Input, Select } from "@/components/ui/input";
import { CalendarIcon } from "@/components/icons";

/**
 * Period picker for /reportes. Applies immediately when the month select
 * changes or the year input loses focus / Enter is pressed, so the page
 * never shows a stale selection (e.g. dropdown saying Agosto while the
 * URL still says mes=7).
 */
export function ReportesFilter({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  const router = useRouter();

  function go(nextYear: number, nextMonth: number) {
    const clampedYear = Math.min(2100, Math.max(2000, nextYear));
    const clampedMonth = Math.min(12, Math.max(1, nextMonth));
    router.replace(`/reportes?anio=${clampedYear}&mes=${clampedMonth}`, {
      scroll: false,
    });
  }

  return (
    <div className="grid grid-cols-2 items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:flex sm:flex-wrap">
      <span className="col-span-2 flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-1 sm:mr-auto">
        <CalendarIcon className="text-base text-brand-600" />
        Período del reporte
      </span>
      <Field label="Mes" htmlFor="mes">
        <Select
          id="mes"
          name="mes"
          value={String(month)}
          onChange={(event) => go(year, Number(event.target.value))}
        >
          {MESES_ES.map((nombre, index) => (
            <option key={nombre} value={index + 1}>
              {nombre}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Año" htmlFor="anio">
        <Input
          id="anio"
          type="number"
          name="anio"
          min={2000}
          max={2100}
          key={year}
          defaultValue={year}
          className="w-full sm:w-24"
          onBlur={(event) => {
            const value = Number(event.target.value);
            if (Number.isInteger(value) && value !== year) go(value, month);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              const value = Number(event.currentTarget.value);
              if (Number.isInteger(value)) go(value, month);
            }
          }}
        />
      </Field>
    </div>
  );
}
