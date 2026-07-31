"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { LoadingModal, downloadFile } from "@/components/ui/loading-modal";
import { DownloadIcon } from "@/components/icons";

export function ReciboForm({
  anio,
  mes,
  mesNombre,
  suggestedNumero,
  defaultMonto,
  defaultFecha,
}: {
  anio: number;
  mes: number;
  mesNombre: string;
  /** Próximo número sugerido según los recibos ya generados. */
  suggestedNumero: number | null;
  /** Subtotal por defecto configurado en /perfil. */
  defaultMonto: number | null;
  defaultFecha: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams({
      anio: String(anio),
      mes: String(mes),
      numero: String(formData.get("numero") ?? ""),
      montoSubtotal: String(formData.get("montoSubtotal") ?? ""),
      fecha: String(formData.get("fecha") ?? ""),
    });

    setLoading(true);
    setError(null);
    try {
      await downloadFile(
        `/api/reportes/recibo?${params.toString()}`,
        `Recibo ${mesNombre} ${anio}.xlsx`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo generar el recibo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-3">
      <div className="grid flex-1 grid-cols-2 gap-3">
        <Field label="Número de recibo" htmlFor="numero">
          <Input
            id="numero"
            type="number"
            name="numero"
            min={1}
            placeholder="26"
            defaultValue={suggestedNumero ?? undefined}
            required
          />
        </Field>
        <Field label="Subtotal (USD)" htmlFor="montoSubtotal">
          <Input
            id="montoSubtotal"
            type="number"
            name="montoSubtotal"
            step="0.01"
            min={0}
            placeholder="1200"
            defaultValue={defaultMonto ?? undefined}
            required
          />
        </Field>
        <Field label="Fecha del recibo" htmlFor="fecha" className="col-span-2">
          <Input
            id="fecha"
            type="date"
            name="fecha"
            defaultValue={defaultFecha}
            required
          />
        </Field>
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      <Button
        variant="secondary"
        disabled={loading}
        className="w-full"
      >
        <DownloadIcon />
        {loading ? "Generando…" : "Descargar recibo .xlsx"}
      </Button>
      <LoadingModal
        open={loading}
        title={`Generando tu recibo de ${mesNombre} ${anio}…`}
      />
    </form>
  );
}
