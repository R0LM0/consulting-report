import { readFile } from "node:fs/promises";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "src/templates/informe-gira.template.docx"
);

export interface GenerateInformeGiraInput {
  /** Free-text period shown after "Informe del mes:", e.g. "3 al 6 noviembre del 2026". */
  periodo: string;
  /** Activity descriptions; Word auto-numbers them (no "1." prefix). */
  actividades: string[];
}

export async function generateInformeGira(
  input: GenerateInformeGiraInput
): Promise<Buffer> {
  const templateBytes = await readFile(TEMPLATE_PATH);
  const doc = new Docxtemplater(new PizZip(templateBytes), {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render({
    periodo: input.periodo,
    actividades: input.actividades,
  });

  // DEFLATE keeps the letterhead-heavy document small (default is STORE).
  return doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
}
