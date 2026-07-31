import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentUserId } from "@/lib/auth-user";
import { signOutAction } from "@/lib/auth-actions";
import { prisma } from "@/lib/prisma";
import {
  MESES_ES,
  formatDateDisplay,
  getLastDayOfMonth,
  getMonthBounds,
} from "@/lib/months";
import { AppShell } from "@/components/app-shell";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { MonthChart, type MonthDatum } from "@/components/dashboard/month-chart";
import { MonthHeatmap } from "@/components/dashboard/month-heatmap";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/fade-in";
import {
  CalendarIcon,
  ChartIcon,
  ClipboardIcon,
  DownloadIcon,
  FileTextIcon,
  PlusIcon,
  ReceiptIcon,
} from "@/components/icons";

function KpiCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-600">
          {icon}
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-slate-900">
          <CountUp value={value} />
        </p>
        <p className="mt-0.5 text-xs font-medium text-slate-500">
          {label} · <span className="text-slate-400">{hint}</span>
        </p>
      </div>
    </Card>
  );
}

export default async function Home() {
  const session = await auth();
  const userId = await getCurrentUserId();
  if (!session?.user || !userId) {
    redirect("/login");
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const mesNombre = MESES_ES[month - 1];

  const { start: monthStart, end: monthEnd } = getMonthBounds(year, month);
  const { start: yearStart } = getMonthBounds(year, 1);
  const { start: nextYearStart } = getMonthBounds(year + 1, 1);

  const [monthCount, monthDays, yearCount, yearDates, recent] =
    await Promise.all([
      prisma.activity.count({
        where: { userId, date: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.activity.groupBy({
        by: ["date"],
        where: { userId, date: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.activity.count({
        where: { userId, date: { gte: yearStart, lt: nextYearStart } },
      }),
      prisma.activity.findMany({
        where: { userId, date: { gte: yearStart, lt: nextYearStart } },
        select: { date: true },
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 5,
      }),
    ]);

  const countsPerMonth = Array.from({ length: 12 }, () => 0);
  for (const { date } of yearDates) {
    countsPerMonth[date.getUTCMonth()] += 1;
  }
  const chartData: MonthDatum[] = MESES_ES.map((nombre, i) => ({
    label: nombre,
    count: countsPerMonth[i],
    current: i === month - 1,
  }));
  const monthsWithActivity = countsPerMonth.filter((c) => c > 0).length;

  const heatmapProps = {
    daysInMonth: getLastDayOfMonth(year, month).getUTCDate(),
    firstOffset: (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7,
    activeDays: monthDays.map((d) => d.date.getUTCDate()),
    todayDay: now.getDate(),
  };

  const firstName = (session.user.name ?? session.user.email ?? "").split(
    " "
  )[0];

  return (
    <AppShell user={session.user} signOutAction={signOutAction}>
      <DashboardHero name={firstName} monthName={mesNombre} year={year} />

      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard
            icon={<ClipboardIcon />}
            label="Actividades"
            hint={mesNombre}
            value={monthCount}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            icon={<CalendarIcon />}
            label="Días con registro"
            hint={mesNombre}
            value={monthDays.length}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            icon={<ChartIcon />}
            label="Total del año"
            hint={String(year)}
            value={yearCount}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            icon={<FileTextIcon />}
            label="Meses con actividad"
            hint={String(year)}
            value={monthsWithActivity}
          />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-3">
        <FadeIn delay={0.25} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader
              title={`Actividad por mes · ${year}`}
              description="Número de actividades registradas cada mes"
              icon={<ChartIcon />}
            />
            <MonthChart data={chartData} />
          </Card>
        </FadeIn>

        <FadeIn delay={0.35}>
          <Card className="flex h-full flex-col">
            <CardHeader
              title="Acciones rápidas"
              description="Atajos para tu flujo mensual"
              icon={<PlusIcon />}
            />
            <div className="flex flex-1 flex-col gap-2.5">
              <Link
                href="/actividades"
                className="group flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-all hover:border-brand-300 hover:bg-brand-50/60"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white transition-transform group-hover:scale-110">
                  <PlusIcon />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    Registrar actividad
                  </span>
                  <span className="block text-xs text-slate-500">
                    Anota lo que hiciste hoy
                  </span>
                </span>
              </Link>
              <a
                href={`/api/reportes/informe?anio=${year}&mes=${month}`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-all hover:border-brand-300 hover:bg-brand-50/60"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700 transition-transform group-hover:scale-110">
                  <DownloadIcon />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    Informe de {mesNombre}
                  </span>
                  <span className="block text-xs text-slate-500">
                    Descargar .docx listo para entregar
                  </span>
                </span>
              </a>
              <Link
                href="/reportes"
                className="group flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-all hover:border-brand-300 hover:bg-brand-50/60"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 transition-transform group-hover:scale-110">
                  <ReceiptIcon />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    Generar recibo
                  </span>
                  <span className="block text-xs text-slate-500">
                    Recibo .xlsx con número y monto
                  </span>
                </span>
              </Link>
            </div>
          </Card>
        </FadeIn>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FadeIn delay={0.45}>
          <Card className="h-full">
            <CardHeader
              title={`Calendario · ${mesNombre}`}
              description="Días con al menos un registro"
              icon={<CalendarIcon />}
            />
            <MonthHeatmap {...heatmapProps} />
          </Card>
        </FadeIn>

        <FadeIn delay={0.55} className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Actividad reciente"
              description="Tus últimos 5 registros"
              icon={<ClipboardIcon />}
              action={
                <Link
                  href="/actividades"
                  className="text-xs font-medium text-brand-600 hover:text-brand-800"
                >
                  Ver todo →
                </Link>
              }
            />
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-xl text-brand-400">
                  <ClipboardIcon />
                </span>
                <p className="text-sm font-medium text-slate-600">
                  Aún no registras actividades
                </p>
                <p className="text-xs text-slate-400">
                  Empieza hoy y tu informe mensual se generará solo.
                </p>
              </div>
            ) : (
              <Stagger className="flex flex-col divide-y divide-slate-100">
                {recent.map((activity) => (
                  <StaggerItem key={activity.id}>
                    <div className="flex items-center gap-4 py-3">
                      <Badge tone="brand" className="shrink-0 tabular-nums">
                        {formatDateDisplay(activity.date)}
                      </Badge>
                      <p className="text-sm text-slate-700">
                        {activity.description}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </Card>
        </FadeIn>
      </div>
    </AppShell>
  );
}
