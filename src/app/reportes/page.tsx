import Link from "next/link";
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
import { Card, CardHeader } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";
import { FileTextIcon, ReceiptIcon } from "@/components/icons";
import { ReportesFilter } from "./reportes-filter";
import { InformeButton } from "./informe-button";
import { ReciboForm } from "./recibo-form";

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

  const [activityCount, user, lastReceipt] = await Promise.all([
    prisma.activity.count({
      where: { userId, date: { gte: prevStart, lt: prevEnd } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { defaultMontoSubtotal: true, receiptNextNumber: true },
    }),
    prisma.receipt.findFirst({
      where: { userId, anio: selectedYear },
      orderBy: { numero: "desc" },
      select: { numero: true },
    }),
  ]);

  const mesNombre = MESES_ES[selectedMonth - 1];
  const defaultFecha = formatDateInputValue(
    getLastDayOfMonth(selectedYear, selectedMonth)
  );
  const suggestedNumero = lastReceipt
    ? lastReceipt.numero + 1
    : (user?.receiptNextNumber ?? null);

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
        <ReportesFilter year={selectedYear} month={selectedMonth} />
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
            <InformeButton
              anio={selectedYear}
              mes={selectedMonth}
              mesNombre={mesNombre}
            />
          </Card>
        </FadeIn>

        <FadeIn delay={0.25}>
          <Card className="flex h-full flex-col transition-shadow hover:shadow-card-hover">
            <CardHeader
              title="Recibo"
              description="Hoja de Excel con número de recibo, monto y fecha"
              icon={<ReceiptIcon />}
            />
            <ReciboForm
              anio={selectedYear}
              mes={selectedMonth}
              mesNombre={mesNombre}
              suggestedNumero={suggestedNumero}
              defaultMonto={user?.defaultMontoSubtotal ?? null}
              defaultFecha={defaultFecha}
            />
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              El número se sugiere según tus últimos recibos y el subtotal
              viene de tus{" "}
              <Link
                href="/perfil"
                className="font-medium text-brand-600 hover:text-brand-800"
              >
                ajustes de perfil
              </Link>
              .
            </p>
          </Card>
        </FadeIn>
      </div>
    </AppShell>
  );
}
