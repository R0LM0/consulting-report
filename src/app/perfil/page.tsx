import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getCurrentUserId } from "@/lib/auth-user";
import { signOutAction } from "@/lib/auth-actions";
import { prisma } from "@/lib/prisma";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";
import { Field, Input } from "@/components/ui/input";
import { ReceiptIcon, SettingsIcon } from "@/components/icons";
import { SaveSettingsButton } from "./save-button";

async function updateBillingSettings(formData: FormData): Promise<void> {
  "use server";

  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const montoRaw = formData.get("defaultMontoSubtotal");
  const numeroRaw = formData.get("receiptNextNumber");

  const monto =
    typeof montoRaw === "string" && montoRaw.trim() !== ""
      ? Number(montoRaw)
      : null;
  const numero =
    typeof numeroRaw === "string" && numeroRaw.trim() !== ""
      ? Number(numeroRaw)
      : null;

  if (monto !== null && (!Number.isFinite(monto) || monto < 0)) {
    throw new Error("El subtotal debe ser un número válido.");
  }
  if (numero !== null && (!Number.isInteger(numero) || numero < 1)) {
    throw new Error("El próximo número de recibo debe ser un entero positivo.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { defaultMontoSubtotal: monto, receiptNextNumber: numero },
  });

  revalidatePath("/perfil");
  revalidatePath("/reportes");
}

export default async function PerfilPage() {
  const session = await auth();
  const userId = await getCurrentUserId();
  if (!session?.user || !userId) {
    redirect("/login");
  }

  const [user, lastReceipt] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { defaultMontoSubtotal: true, receiptNextNumber: true },
    }),
    prisma.receipt.findFirst({
      where: { userId },
      orderBy: [{ anio: "desc" }, { numero: "desc" }],
      select: { numero: true, anio: true },
    }),
  ]);

  return (
    <AppShell user={session.user} signOutAction={signOutAction}>
      <PageHeader
        title="Ajustes de perfil"
        subtitle="Valores por defecto para generar tus documentos."
        action={
          lastReceipt ? (
            <Badge tone="brand" className="px-3 py-1 text-sm">
              Último recibo: No. {lastReceipt.numero} - {lastReceipt.anio}
            </Badge>
          ) : null
        }
      />

      <FadeIn delay={0.05}>
        <Card className="max-w-xl">
          <CardHeader
            title="Facturación"
            description="Se usan para prellenar el recibo cada mes"
            icon={<ReceiptIcon />}
          />
          <form action={updateBillingSettings} className="flex flex-col gap-4">
            <Field label="Subtotal mensual (USD)" htmlFor="defaultMontoSubtotal">
              <Input
                id="defaultMontoSubtotal"
                type="number"
                name="defaultMontoSubtotal"
                step="0.01"
                min={0}
                placeholder="1200"
                defaultValue={user?.defaultMontoSubtotal ?? undefined}
              />
            </Field>
            <p className="-mt-2.5 text-xs text-slate-400">
              Solo cámbialo cuando cambie tu contrato o salario.
            </p>
            <Field
              label="Próximo número de recibo"
              htmlFor="receiptNextNumber"
            >
              <Input
                id="receiptNextNumber"
                type="number"
                name="receiptNextNumber"
                min={1}
                placeholder="26"
                defaultValue={user?.receiptNextNumber ?? undefined}
              />
            </Field>
            <p className="-mt-2.5 text-xs text-slate-400">
              Solo se usa la primera vez; después el contador avanza solo con
              cada recibo que generes.
            </p>
            <div className="mt-1 flex justify-end">
              <SaveSettingsButton />
            </div>
          </form>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card className="max-w-xl">
          <CardHeader
            title="Cuenta"
            description="Tus datos de acceso"
            icon={<SettingsIcon />}
          />
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Nombre</dt>
              <dd className="font-medium text-slate-900">
                {session.user.name}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Correo</dt>
              <dd className="font-medium text-slate-900">
                {session.user.email}
              </dd>
            </div>
          </dl>
        </Card>
      </FadeIn>
    </AppShell>
  );
}
