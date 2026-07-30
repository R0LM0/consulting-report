import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentUserId } from "@/lib/auth-user";
import { signOutAction } from "@/lib/auth-actions";
import { prisma } from "@/lib/prisma";
import {
  MESES_ES,
  formatDateDisplay,
  formatDateInputValue,
  getMonthBounds,
  parseIntOrDefault,
} from "@/lib/months";
import { AppShell, PageHeader } from "@/components/app-shell";
import { createActivity } from "./actions";
import { ActivityList } from "./activity-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";
import { Field, Input, Select } from "@/components/ui/input";
import { CalendarIcon, PlusIcon } from "@/components/icons";

export default async function ActividadesPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>;
}) {
  const session = await auth();
  const userId = await getCurrentUserId();
  if (!session?.user || !userId) {
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
  const mesNombre = MESES_ES[selectedMonth - 1];

  return (
    <AppShell user={session.user} signOutAction={signOutAction}>
      <PageHeader
        title="Registro de actividades"
        subtitle="Anota lo que haces cada día; al cierre del mes se genera tu informe."
        action={
          <Badge tone="brand" className="px-3 py-1 text-sm">
            {activities.length} en {mesNombre} {selectedYear}
          </Badge>
        }
      />

      <FadeIn delay={0.05}>
        <Card>
          <CardHeader
            title="Registrar actividad"
            description="Fecha y descripción de lo que hiciste"
            icon={<PlusIcon />}
          />
          <form
            action={createActivity}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <Field label="Fecha" htmlFor="date">
              <Input
                id="date"
                type="date"
                name="date"
                defaultValue={todayInputValue}
                required
              />
            </Field>
            <Field label="Qué hiciste" htmlFor="description" className="flex-1">
              <Input
                id="description"
                type="text"
                name="description"
                placeholder="Ej: Ajuste al módulo de reportes del SIGIL"
                required
                className="w-full"
              />
            </Field>
            <Button className="sm:shrink-0">
              <PlusIcon />
              Agregar
            </Button>
          </form>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15} className="flex flex-col gap-4">
        <form
          className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card"
          method="get"
        >
          <span className="mr-auto flex items-center gap-2 text-sm font-semibold text-slate-700">
            <CalendarIcon className="text-base text-brand-600" />
            Filtrar por mes
          </span>
          <Field label="Mes" htmlFor="mes">
            <Select id="mes" name="mes" defaultValue={String(selectedMonth)}>
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
              defaultValue={selectedYear}
              className="w-24"
            />
          </Field>
          <Button variant="outline">Ver mes</Button>
        </form>

        <ActivityList
          activities={activities.map((activity) => ({
            id: activity.id,
            dateInputValue: formatDateInputValue(activity.date),
            dateDisplay: formatDateDisplay(activity.date),
            description: activity.description,
          }))}
          emptyMessage={`No hay actividades registradas para ${mesNombre} de ${selectedYear}.`}
        />
      </FadeIn>
    </AppShell>
  );
}
