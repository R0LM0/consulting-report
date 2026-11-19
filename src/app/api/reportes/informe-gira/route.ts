import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { toArrayBuffer } from "@/lib/buffer-response";
import { generateInformeGira } from "@/lib/generate-informe-gira";
import {
  addDaysUTC,
  formatPeriodoGira,
  isDateInputValue,
  parseDateInputUTC,
} from "@/lib/months";

const MAX_PERIODO_LENGTH = 120;

/** HTTP headers must be ASCII: strip accents and anything unsafe. */
function toAsciiFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ._-]/g, "")
    .trim();
}

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const desdeParam = searchParams.get("desde");
  const hastaParam = searchParams.get("hasta");

  if (!isDateInputValue(desdeParam) || !isDateInputValue(hastaParam)) {
    return NextResponse.json(
      { error: "Fechas inválidas: usa el formato AAAA-MM-DD." },
      { status: 400 }
    );
  }

  const desde = parseDateInputUTC(desdeParam);
  const hasta = parseDateInputUTC(hastaParam);
  if (desde > hasta) {
    return NextResponse.json(
      { error: "La fecha inicial no puede ser posterior a la final." },
      { status: 400 }
    );
  }

  const periodo =
    searchParams.get("periodo")?.trim().slice(0, MAX_PERIODO_LENGTH) ||
    formatPeriodoGira(desde, hasta);

  const activities = await prisma.activity.findMany({
    where: { userId, date: { gte: desde, lt: addDaysUTC(hasta, 1) } },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  if (activities.length === 0) {
    return NextResponse.json(
      { error: "No hay actividades registradas en ese rango de fechas." },
      { status: 404 }
    );
  }

  const buffer = await generateInformeGira({
    periodo,
    actividades: activities.map((activity) => activity.description),
  });

  const filename = toAsciiFilename(`Informe de Actividades ${periodo}`);

  return new NextResponse(toArrayBuffer(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}.docx"`,
    },
  });
}
