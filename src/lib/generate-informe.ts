import { readFile } from "node:fs/promises";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "src/templates/informe.template.docx"
);

export interface GenerateInformeInput {
  /** Month name, e.g. "Julio". */
  mes: string;
  anio: number;
  /**
   * Free-text activity descriptions, one per numbered list item. The
   * template auto-numbers them via Word's list numbering (numId=3), so no
   * "1.", "2." prefix should be included here.
   */
  actividades: string[];
}

export async function generateInforme(
  input: GenerateInformeInput
): Promise<Buffer> {
  const templateBytes = await readFile(TEMPLATE_PATH);
  const zip = new PizZip(templateBytes);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render({
    mes: input.mes,
    anio: input.anio,
    actividades: input.actividades,
  });

  // compression MUST be DEFLATE: pizzip/docxtemplater default to STORE
  // (no compression) on generate, which bloats this letterhead+watermark
  // heavy document from ~1.7MB to ~9MB for no benefit.
  const buffer = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return buffer;
}
