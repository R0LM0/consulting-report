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
  parseMonthsParam,
  parseYearParam,
} from "@/lib/months";
import { AppShell, PageHeader } from "@/components/app-shell";
import { createActivity } from "./actions";
import { ActivityList, type ActivityGroup } from "./activity-list";
import { MonthFilter } from "./month-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PlusIcon } from "@/components/icons";

export default async function ActividadesPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string; meses?: string }>;
}) {
  const session = await auth();
  const userId = await getCurrentUserId();
  if (!session?.user || !userId) {
    redirect("/login");
  }

  const { anio, mes, meses } = await searchParams;
  const now = new Date();
  const selectedYear = parseYearParam(anio, now.getFullYear());
  // `meses` (multi) tiene prioridad; `mes` (legacy) se respeta como fallback.
  const selectedMonths = parseMonthsParam(meses ?? mes, now.getMonth() + 1);

  const { start } = getMonthBounds(selectedYear, selectedMonths[0]);
  const { end } = getMonthBounds(
    selectedYear,
    selectedMonths[selectedMonths.length - 1]
  );

  const activities = (
    await prisma.activity.findMany({
      where: { userId, date: { gte: start, lt: end } },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    })
  ).filter((a) => selectedMonths.includes(a.date.getUTCMonth() + 1));

  const groups: ActivityGroup[] = selectedMonths
    .map((month) => ({
      key: `${selectedYear}-${month}`,
      label: `${MESES_ES[month - 1]} ${selectedYear}`,
      items: activities
        .filter((a) => a.date.getUTCMonth() + 1 === month)
        .map((a) => ({
          id: a.id,
          dateInputValue: formatDateInputValue(a.date),
          dateDisplay: formatDateDisplay(a.date),
          description: a.description,
        })),
    }))
    .filter((g) => g.items.length > 0);

  const todayInputValue = formatDateInputValue(now);
  const resumen =
    selectedMonths.length === 1
      ? `${MESES_ES[selectedMonths[0] - 1]} ${selectedYear}`
      : `${selectedMonths.length} meses de ${selectedYear}`;

  return (
    <AppShell user={session.user} signOutAction={signOutAction}>
      <PageHeader
        title="Registro de actividades"
        subtitle="Anota lo que haces cada día; al cierre del mes se genera tu informe."
        action={
          <Badge tone="brand" className="px-3 py-1 text-sm">
            {activities.length} · {resumen}
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
          <form action={createActivity} className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Field label="Fecha" htmlFor="date" className="sm:w-44">
                <Input
                  id="date"
                  type="date"
                  name="date"
                  defaultValue={todayInputValue}
                  required
                />
              </Field>
              <Field
                label="Qué hiciste"
                htmlFor="description"
                className="flex-1"
              >
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Ej: Ajuste al módulo de reportes del SIGIL. Se corrigió la numeración automática y se validó con datos reales."
                  required
                  rows={3}
                />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button className="w-full sm:w-auto">
                <PlusIcon />
                Agregar
              </Button>
            </div>
          </form>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15} className="flex flex-col gap-4">
        <MonthFilter year={selectedYear} selectedMonths={selectedMonths} />

        <ActivityList
          groups={groups}
          emptyMessage={`No hay actividades registradas para ${resumen}.`}
        />
      </FadeIn>
    </AppShell>
  );
}
