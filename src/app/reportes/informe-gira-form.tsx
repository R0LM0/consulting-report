"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { LoadingModal, downloadFile } from "@/components/ui/loading-modal";
import { DownloadIcon } from "@/components/icons";
import {
  formatPeriodoGira,
  isDateInputValue,
  parseDateInputUTC,
} from "@/lib/months";

function suggestPeriodo(desde: string, hasta: string): string {
  if (!isDateInputValue(desde) || !isDateInputValue(hasta)) return "";
  const from = parseDateInputUTC(desde);
  const to = parseDateInputUTC(hasta);
  return from <= to ? formatPeriodoGira(from, to) : "";
}

export function InformeGiraForm({
  defaultDesde,
  defaultHasta,
}: {
  defaultDesde: string;
  defaultHasta: string;
}) {
  const [desde, setDesde] = useState(defaultDesde);
  const [hasta, setHasta] = useState(defaultHasta);
  // null = follow the date range; a string = the user typed their own label.
  const [customPeriodo, setCustomPeriodo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const periodo = customPeriodo ?? suggestPeriodo(desde, hasta);
  const isRangeInvalid = Boolean(desde && hasta && desde > hasta);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isRangeInvalid) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ desde, hasta, periodo });
      await downloadFile(
        `/api/reportes/informe-gira?${params.toString()}`,
        `Informe de Actividades ${periodo}.docx`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo generar el informe."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Desde" htmlFor="gira-desde">
          <Input
            id="gira-desde"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            required
          />
        </Field>
        <Field label="Hasta" htmlFor="gira-hasta">
          <Input
            id="gira-hasta"
            type="date"
            value={hasta}
            min={desde || undefined}
            onChange={(e) => setHasta(e.target.value)}
            required
          />
        </Field>
      </div>
      <Field label="Texto del período en el informe" htmlFor="gira-periodo">
        <Input
          id="gira-periodo"
          value={periodo}
          onChange={(e) => setCustomPeriodo(e.target.value)}
          placeholder="3 al 6 noviembre del 2026"
          maxLength={120}
          required
        />
      </Field>
      {customPeriodo !== null ? (
        <button
          type="button"
          onClick={() => setCustomPeriodo(null)}
          className="cursor-pointer self-start text-xs font-medium text-brand-400 hover:text-brand-300"
        >
          Usar el texto según las fechas
        </button>
      ) : null}
      {isRangeInvalid ? (
        <p className="text-xs text-amber-300">
          La fecha inicial no puede ser posterior a la final.
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={loading || isRangeInvalid}
        className="mt-1 w-full"
      >
        <DownloadIcon />
        {loading ? "Generando…" : "Descargar informe de gira .docx"}
      </Button>
      {error ? (
        <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
      <LoadingModal
        open={loading}
        title={`Generando el informe de gira (${periodo})…`}
      />
    </form>
  );
}
