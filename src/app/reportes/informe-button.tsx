"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingModal, downloadFile } from "@/components/ui/loading-modal";
import { DownloadIcon } from "@/components/icons";

export function InformeButton({
  anio,
  mes,
  mesNombre,
}: {
  anio: number;
  mes: number;
  mesNombre: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      await downloadFile(
        `/api/reportes/informe?anio=${anio}&mes=${mes}`,
        `Informe de Actividades ${mesNombre} ${anio}.docx`
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
    <>
      <Button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="w-full"
      >
        <DownloadIcon />
        {loading ? "Generando…" : "Descargar informe .docx"}
      </Button>
      {error ? (
        <p className="mt-3 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
      <LoadingModal
        open={loading}
        title={`Generando tu informe de ${mesNombre} ${anio}…`}
      />
    </>
  );
}
