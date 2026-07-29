import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import {
  MESES_ES,
  formatDateInputValue,
  getLastDayOfMonth,
  getMonthBounds,
  parseIntOrDefault,
} from "@/lib/months";

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const { anio, mes } = await searchParams;
  const now = new Date();
  const selectedYear = parseIntOrDefault(anio, now.getFullYear());
  const selectedMonth = parseIntOrDefault(mes, now.getMonth() + 1);

  const { start, end } = getMonthBounds(selectedYear, selectedMonth);
  const activityCount = await prisma.activity.count({
    where: { userId, date: { gte: start, lt: end } },
  });

  const mesNombre = MESES_ES[selectedMonth - 1];
  const defaultFecha = formatDateInputValue(
    getLastDayOfMonth(selectedYear, selectedMonth)
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Generar reportes mensuales
        </h1>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          Inicio
        </Link>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form className="flex flex-wrap items-end gap-3" method="get">
          <div className="flex flex-col gap-1">
            <label htmlFor="mes" className="text-xs font-medium text-gray-500">
              Mes
            </label>
            <select
              id="mes"
              name="mes"
              defaultValue={String(selectedMonth)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              {MESES_ES.map((nombre, index) => (
                <option key={nombre} value={index + 1}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="anio"
              className="text-xs font-medium text-gray-500"
            >
              Año
            </label>
            <input
              id="anio"
              type="number"
              name="anio"
              defaultValue={selectedYear}
              className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </div>
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Ver mes
          </button>
        </form>

        <p
          className={`mt-4 text-sm ${
            activityCount === 0 ? "text-red-600" : "text-gray-600"
          }`}
        >
          {activityCount === 0
            ? `No hay actividades registradas para ${mesNombre} de ${selectedYear}. Revisa /actividades antes de generar el informe.`
            : `${activityCount} actividad(es) registradas para ${mesNombre} de ${selectedYear}.`}
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-gray-700">
          Informe de Actividades (.docx)
        </h2>
        <form action="/api/reportes/informe" method="get">
          <input type="hidden" name="anio" value={selectedYear} />
          <input type="hidden" name="mes" value={selectedMonth} />
          <button
            type="submit"
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Descargar informe de {mesNombre} {selectedYear}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-gray-700">
          Recibo (.xlsx)
        </h2>
        <form
          action="/api/reportes/recibo"
          method="get"
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="anio" value={selectedYear} />
          <input type="hidden" name="mes" value={selectedMonth} />
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="numero"
                className="text-xs font-medium text-gray-500"
              >
                Número de recibo
              </label>
              <input
                id="numero"
                type="number"
                name="numero"
                placeholder="25"
                required
                className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="montoSubtotal"
                className="text-xs font-medium text-gray-500"
              >
                Subtotal (USD)
              </label>
              <input
                id="montoSubtotal"
                type="number"
                name="montoSubtotal"
                step="0.01"
                placeholder="1200"
                required
                className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="fecha"
                className="text-xs font-medium text-gray-500"
              >
                Fecha del recibo
              </label>
              <input
                id="fecha"
                type="date"
                name="fecha"
                defaultValue={defaultFecha}
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
          >
            Descargar recibo de {mesNombre} {selectedYear}
          </button>
        </form>
      </section>
    </div>
  );
}
