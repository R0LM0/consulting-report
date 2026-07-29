import { readFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "src/templates/recibo.template.xlsx"
);

export interface GenerateReciboInput {
  /** Month name, e.g. "Julio". Casing doesn't matter, it's normalized. */
  mes: string;
  anio: number;
  /** Sequential receipt number for the month, e.g. 25. */
  numero: number;
  fecha: Date;
  /** Subtotal amount in USD before deductions, e.g. 1200. */
  montoSubtotal: number;
}

/**
 * Formats a number the way the original template writes it in "RECIBO POR：
 * USD 1200" and D17 (SUBTOTAL): no thousands separator, no decimals for
 * whole numbers, 2 decimals otherwise.
 */
function formatMonto(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/** "31 de julio  2026" - note the double space before the year, matching
 * the original hand-typed template exactly. */
function formatFechaLarga(fecha: Date, mesLower: string): string {
  return `${fecha.getDate()} de ${mesLower}  ${fecha.getFullYear()}`;
}

export async function generateRecibo(
  input: GenerateReciboInput
): Promise<Buffer> {
  const { mes, anio, numero, fecha, montoSubtotal } = input;
  const mesUpper = mes.toUpperCase();
  const mesLower = mes.toLowerCase();

  const workbook = new ExcelJS.Workbook();
  const templateBytes = await readFile(TEMPLATE_PATH);
  // exceljs bundles its own (older) @types/node via @fast-csv, whose Buffer
  // type is structurally incompatible with the project's @types/node
  // Buffer at the type level only (extra properties like `resizable` on
  // newer Node typings) - the value itself is a plain Node Buffer at
  // runtime, so this `any` cast is safe. `as unknown as Buffer` doesn't
  // work here because it resolves to the *same* (project-scope) Buffer
  // type, not exceljs's nested one.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(templateBytes as any);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error("recibo.template.xlsx has no worksheets");
  }

  // B3:D3 merged - "RECIBO POR: USD 1200"
  sheet.getCell("B3").value = `RECIBO POR: USD ${formatMonto(montoSubtotal)}`;

  // B7 - "RECIBO DE JULIO -2026"
  sheet.getCell("B7").value = `RECIBO DE ${mesUpper} -${anio}`;

  // C7:D7 merged - "No.  25 - 2026"
  sheet.getCell("C7").value = `No.  ${numero} - ${anio}`;

  // B16:B19 merged - "31 de julio  2026"
  const fechaLarga = formatFechaLarga(fecha, mesLower);
  sheet.getCell("B16").value = fechaLarga;

  // C16 - description mentioning the month
  sheet.getCell(
    "C16"
  ).value = `Recibo correspondiente a pago de honorarios correspondientes al mes de ${mesLower} del ${anio}`;

  // D17 - SUBTOTAL (plain number). D18/D19 are formulas ("+D17*11%",
  // "+D17-D18") referencing D17 - leave them untouched so they recompute.
  sheet.getCell("D17").value = montoSubtotal;

  // Force Excel to fully recalculate on open, so D18/D19's cached formula
  // results (stale from the template) are refreshed against the new D17
  // instead of showing the old 132/1068 until the user manually recalcs.
  workbook.calcProperties.fullCalcOnLoad = true;

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
