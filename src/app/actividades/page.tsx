import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import {
  MESES_ES,
  formatDateDisplay,
  formatDateInputValue,
  getMonthBounds,
  parseIntOrDefault,
} from "@/lib/months";
import { createActivity } from "./actions";
import { ActivityItem } from "./activity-item";

export default async function ActividadesPage({
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

  const activities = await prisma.activity.findMany({
    where: { userId, date: { gte: start, lt: end } },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  const todayInputValue = formatDateInputValue(now);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Registro de actividades
        </h1>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          Inicio
        </Link>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-gray-700">
          Registrar actividad
        </h2>
        <form
          action={createActivity}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="date"
              className="text-xs font-medium text-gray-500"
            >
              Fecha
            </label>
            <input
              id="date"
              type="date"
              name="date"
              defaultValue={todayInputValue}
              required
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label
              htmlFor="description"
              className="text-xs font-medium text-gray-500"
            >
              Qué hiciste
            </label>
            <input
              id="description"
              type="text"
              name="description"
              placeholder="Ej: Ajuste al módulo de reportes del SIGIL"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Agregar
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
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

        <div className="flex flex-col gap-2">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay actividades registradas para {MESES_ES[selectedMonth - 1]}{" "}
              de {selectedYear}.
            </p>
          ) : (
            activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={{
                  id: activity.id,
                  dateInputValue: formatDateInputValue(activity.date),
                  dateDisplay: formatDateDisplay(activity.date),
                  description: activity.description,
                }}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
