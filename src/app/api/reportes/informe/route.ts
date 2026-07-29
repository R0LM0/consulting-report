import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { toArrayBuffer } from "@/lib/buffer-response";
import { generateInforme } from "@/lib/generate-informe";
import { MESES_ES, getMonthBounds } from "@/lib/months";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const anio = Number(searchParams.get("anio"));
  const mesNumero = Number(searchParams.get("mes"));

  if (
    !Number.isInteger(anio) ||
    !Number.isInteger(mesNumero) ||
    mesNumero < 1 ||
    mesNumero > 12
  ) {
    return NextResponse.json(
      { error: "Parámetros de mes/año inválidos" },
      { status: 400 }
    );
  }

  const mes = MESES_ES[mesNumero - 1];
  const { start, end } = getMonthBounds(anio, mesNumero);

  const activities = await prisma.activity.findMany({
    where: { userId, date: { gte: start, lt: end } },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  const buffer = await generateInforme({
    mes,
    anio,
    actividades: activities.map((activity) => activity.description),
  });

  return new NextResponse(toArrayBuffer(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="Informe de Actividades ${mes} ${anio}.docx"`,
    },
  });
}
