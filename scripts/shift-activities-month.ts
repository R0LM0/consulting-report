// One-off (rerunnable) fix: moves activities whose dates were entered one
// month ahead back to their real month, keeping the day-of-month.
//
// Why this exists: before the app understood the consultant's convention
// (the "Informe de <month M>" reports activities worked in month M-1),
// activities were dated in the informe's month instead of the real work
// date. This script shifts every activity in a given month back by one
// month (e.g. 2026-08-03 -> 2026-07-03).
//
// Usage:
//   npx tsx scripts/shift-activities-month.ts 2026-08           (dry run)
//   npx tsx scripts/shift-activities-month.ts 2026-08 --apply   (applies)
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const monthArg = process.argv[2]; // "YYYY-MM" — month to shift BACK one month
const apply = process.argv.includes("--apply");

if (!monthArg || !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthArg)) {
  console.error('Uso: npx tsx scripts/shift-activities-month.ts YYYY-MM [--apply]');
  process.exit(1);
}

const [year, month] = monthArg.split("-").map(Number);
const start = new Date(Date.UTC(year, month - 1, 1));
const end = new Date(Date.UTC(year, month, 1));

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function fmt(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function main() {
  const activities = await prisma.activity.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  if (activities.length === 0) {
    console.log(`No hay actividades con fecha en ${monthArg}. Nada que hacer.`);
    return;
  }

  console.log(
    `${activities.length} actividad(es) en ${monthArg} ${apply ? "MOVIDAS" : "por mover"} un mes atrás:\n`
  );

  for (const activity of activities) {
    const newDate = new Date(
      Date.UTC(
        activity.date.getUTCFullYear(),
        activity.date.getUTCMonth() - 1,
        activity.date.getUTCDate()
      )
    );
    console.log(
      `  ${fmt(activity.date)} -> ${fmt(newDate)}  ${activity.description.slice(0, 60)}`
    );
    if (apply) {
      await prisma.activity.update({
        where: { id: activity.id },
        data: { date: newDate },
      });
    }
  }

  console.log(
    apply
      ? `\nListo: ${activities.length} actividad(es) actualizadas.`
      : `\nDry run: nada se modificó. Revisá la lista y corré con --apply para aplicar.`
  );
}

main()
  .catch((error) => {
    console.error("[shift] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
