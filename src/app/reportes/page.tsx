import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentUserId } from "@/lib/auth-user";
import { signOutAction } from "@/lib/auth-actions";
import { prisma } from "@/lib/prisma";
import {
  MESES_ES,
  formatDateInputValue,
  getLastDayOfMonth,
  getMonthBounds,
  getPreviousMonth,
  parseMonthParam,
  parseYearParam,
} from "@/lib/months";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";
import { Field, Input, Select } from "@/components/ui/input";
import {
  CalendarIcon,
  DownloadIcon,
  FileTextIcon,
  ReceiptIcon,
} from "@/components/icons";

export default async function ReportesPage({
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
  const selectedYear = parseYearParam(anio, now.getFullYear());
  const selectedMonth = parseMonthParam(mes, now.getMonth() + 1);

  // El informe del mes M reporta las actividades del mes anterior (M-1).
  const prev = getPreviousMonth(selectedYear, selectedMonth);
  const { start: prevStart, end: prevEnd } = getMonthBounds(
    prev.year,
    prev.month
  );
  const activityCount = await prisma.activity.count({
    where: { userId, date: { gte: prevStart, lt: prevEnd } },
  });

  const defaultFecha = formatDateInputValue(
    getLastDayOfMonth(selectedYear, selectedMonth)
  );

  return (
    <AppShell user={session.user} signOutAction={signOutAction}>
      <PageHeader
        title="Generar reportes mensuales"
        subtitle="Descarga tu informe de actividades (.docx) y tu recibo (.xlsx)."
        action={
          activityCount > 0 ? (
            <Badge tone="success" className="px-3 py-1 text-sm">
              {activityCount} actividad(es) incluidas
            </Badge>
          ) : (
            <Badge tone="warning" className="px-3 py-1 text-sm">
              Sin actividades para este informe
            </Badge>
          )
        }
      />

      <FadeIn delay={0.05}>
        <form
          className="grid grid-cols-2 items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:flex sm:flex-wrap"
          method="get"
        >
          <span className="col-span-2 flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-1 sm:mr-auto">
            <CalendarIcon className="text-base text-brand-600" />
            Período del reporte
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
              min={2000}
              max={2100}
              defaultValue={selectedYear}
              className="w-full sm:w-24"
            />
          </Field>
          <Button variant="outline" className="col-span-2 sm:col-span-1">
            Ver mes
          </Button>
        </form>
      </FadeIn>

      {activityCount === 0 ? (
        <FadeIn delay={0.1}>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No hay actividades registradas para este informe. Revisa{" "}
            <span className="font-semibold">Actividades</span> antes de
            generarlo.
          </div>
        </FadeIn>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FadeIn delay={0.15}>
          <Card className="flex h-full flex-col transition-shadow hover:shadow-card-hover">
            <CardHeader
              title="Informe de Actividades"
              description="Documento Word con el membrete oficial y la numeración automática"
              icon={<FileTextIcon />}
            />
            <div className="mb-5 flex-1 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
              Incluye {activityCount} actividad(es) en el formato
              institucional, listo para firmar y entregar.
            </div>
            <form action="/api/reportes/informe" method="get">
              <input type="hidden" name="anio" value={selectedYear} />
              <input type="hidden" name="mes" value={selectedMonth} />
              <Button className="w-full">
                <DownloadIcon />
                Descargar informe .docx
              </Button>
            </form>
          </Card>
        </FadeIn>

        <FadeIn delay={0.25}>
          <Card className="flex h-full flex-col transition-shadow hover:shadow-card-hover">
            <CardHeader
              title="Recibo"
              description="Hoja de Excel con número de recibo, monto y fecha"
              icon={<ReceiptIcon />}
            />
            <form
              action="/api/reportes/recibo"
              method="get"
              className="flex flex-1 flex-col gap-3"
            >
              <input type="hidden" name="anio" value={selectedYear} />
              <input type="hidden" name="mes" value={selectedMonth} />
              <div className="grid flex-1 grid-cols-2 gap-3">
                <Field label="Número de recibo" htmlFor="numero">
                  <Input
                    id="numero"
                    type="number"
                    name="numero"
                    placeholder="25"
                    required
                  />
                </Field>
                <Field label="Subtotal (USD)" htmlFor="montoSubtotal">
                  <Input
                    id="montoSubtotal"
                    type="number"
                    name="montoSubtotal"
                    step="0.01"
                    placeholder="1200"
                    required
                  />
                </Field>
                <Field
                  label="Fecha del recibo"
                  htmlFor="fecha"
                  className="col-span-2"
                >
                  <Input
                    id="fecha"
                    type="date"
                    name="fecha"
                    defaultValue={defaultFecha}
                    required
                  />
                </Field>
              </div>
              <Button variant="secondary" className="w-full">
                <DownloadIcon />
                Descargar recibo .xlsx
              </Button>
            </form>
          </Card>
        </FadeIn>
      </div>
    </AppShell>
  );
}
