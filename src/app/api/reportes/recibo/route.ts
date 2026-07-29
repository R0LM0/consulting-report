import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-user";
import { toArrayBuffer } from "@/lib/buffer-response";
import { generateRecibo } from "@/lib/generate-recibo";
import { MESES_ES, parseDateInputLocal } from "@/lib/months";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const anio = Number(searchParams.get("anio"));
  const mesNumero = Number(searchParams.get("mes"));
  const numero = Number(searchParams.get("numero"));
  const montoSubtotal = Number(searchParams.get("montoSubtotal"));
  const fechaParam = searchParams.get("fecha");

  if (
    !Number.isInteger(anio) ||
    !Number.isInteger(mesNumero) ||
    mesNumero < 1 ||
    mesNumero > 12 ||
    !Number.isInteger(numero) ||
    !Number.isFinite(montoSubtotal) ||
    !fechaParam
  ) {
    return NextResponse.json(
      {
        error:
          "Parámetros inválidos: verifica número de recibo, subtotal y fecha.",
      },
      { status: 400 }
    );
  }

  const mes = MESES_ES[mesNumero - 1];
  const fecha = parseDateInputLocal(fechaParam);

  const buffer = await generateRecibo({
    mes,
    anio,
    numero,
    fecha,
    montoSubtotal,
  });

  return new NextResponse(toArrayBuffer(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Recibo ${mes} ${anio}.xlsx"`,
    },
  });
}
