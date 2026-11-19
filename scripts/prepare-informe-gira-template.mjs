// One-off (rerunnable) tool that turns the consultant's real field-trip
// ("gira de campo") report into a docxtemplater-ready template, without
// touching the original file or its letterhead images.
//
// The field-trip report uses a different letterhead, header lines and
// signatures than the monthly informe, so it has its own template instead
// of reusing informe.template.docx.
//
// Usage:
//   node scripts/prepare-informe-gira-template.mjs [inputDocx] [outputDocx]

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import PizZip from "pizzip";

const DEFAULT_INPUT = resolve(
  import.meta.dirname,
  "../doc/Informe de Actividades 3 al 6 de Noviembre 2026.docx"
);
const DEFAULT_OUTPUT = resolve(
  import.meta.dirname,
  "../src/templates/informe-gira.template.docx"
);
const EXPECTED_ACTIVITY_COUNT = 8;

const inputPath = process.argv[2] ?? DEFAULT_INPUT;
const outputPath = process.argv[3] ?? DEFAULT_OUTPUT;

const zip = new PizZip(readFileSync(inputPath));

// docxtemplater also parses header/footer text: a stray brace inside a
// <w:t> would break rendering. (Braces in attributes, like extLst GUIDs,
// are fine - only text nodes are parsed.)
for (const part of ["word/document.xml", "word/header1.xml", "word/footer1.xml"]) {
  const xmlText = zip.file(part)?.asText() ?? "";
  const text = [...xmlText.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)]
    .map((m) => m[1])
    .join("");
  if (/[{}]/.test(text)) {
    throw new Error(`${part} already contains "{" or "}" - inspect it first.`);
  }
}

const docXmlPath = "word/document.xml";
let xml = zip.file(docXmlPath).asText();

// ---------------------------------------------------------------------
// 1) "Informe del mes: <tab><tab>3 al 6 noviembre del 2026" -> "{periodo}"
//    The period is split across 4 runs ("3 al " / "6" / " noviembre" /
//    " del 2026"), all with the same Arial 11pt rPr.
// ---------------------------------------------------------------------
const RPR =
  '<w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Calibri" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="es-NI"/></w:rPr>';
const periodRunsPattern =
  `<w:r w:rsidR="001F4583">${RPR}<w:t xml:space="preserve">3 al </w:t></w:r>` +
  `<w:r w:rsidR="00191F3A">${RPR}<w:t>6</w:t></w:r>` +
  `<w:r w:rsidR="001F4583">${RPR}<w:t xml:space="preserve"> noviembre</w:t></w:r>` +
  `<w:r>${RPR}<w:t xml:space="preserve"> del 2026</w:t></w:r>`;

const periodCount = xml.split(periodRunsPattern).length - 1;
if (periodCount !== 1) {
  throw new Error(
    `Expected exactly 1 period run sequence, found ${periodCount}. ` +
      "The source document changed - inspect word/document.xml manually."
  );
}
xml = xml.replace(
  periodRunsPattern,
  `<w:r>${RPR}<w:t xml:space="preserve">{periodo}</w:t></w:r>`
);

// ---------------------------------------------------------------------
// 2) The numbered activity paragraphs (w:numId=3) become a paragraph
//    loop. numPr stays on the repeated paragraph so Word keeps numbering.
// ---------------------------------------------------------------------
const numIdMarker = '<w:numId w:val="3"/>';
const firstNumIdx = xml.indexOf(numIdMarker);
const lastNumIdx = xml.lastIndexOf(numIdMarker);
if (firstNumIdx === -1) {
  throw new Error("Could not find any activity paragraph (w:numId val=3).");
}

const blockStart = xml.lastIndexOf("<w:p ", firstNumIdx);
const firstParaEnd = xml.indexOf("</w:p>", firstNumIdx) + "</w:p>".length;
const blockEnd = xml.indexOf("</w:p>", lastNumIdx) + "</w:p>".length;

const countInBlock = (
  xml.slice(blockStart, blockEnd).match(new RegExp(numIdMarker, "g")) ?? []
).length;
if (countInBlock !== EXPECTED_ACTIVITY_COUNT) {
  throw new Error(
    `Expected ${EXPECTED_ACTIVITY_COUNT} activity paragraphs, found ${countInBlock}.`
  );
}

const firstParaRaw = xml.slice(blockStart, firstParaEnd);
const pPrMatch = firstParaRaw.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
if (!pPrMatch) {
  throw new Error("First activity paragraph has no <w:pPr> to reuse.");
}
const pPr = pPrMatch[0];
const afterPPr = firstParaRaw.slice(pPrMatch.index + pPr.length);
const runRPrMatch = afterPPr.match(/<w:r[ >][\s\S]*?<w:rPr>([\s\S]*?)<\/w:rPr>/);
if (!runRPrMatch) {
  throw new Error("Could not find a run rPr to reuse for the loop body.");
}

const startLoopPara = "<w:p><w:r><w:t>{#actividades}</w:t></w:r></w:p>";
const bodyPara = `<w:p>${pPr}<w:r><w:rPr>${runRPrMatch[1]}</w:rPr><w:t xml:space="preserve">{.}</w:t></w:r></w:p>`;
const endLoopPara = "<w:p><w:r><w:t>{/actividades}</w:t></w:r></w:p>";

xml =
  xml.slice(0, blockStart) +
  startLoopPara +
  bodyPara +
  endLoopPara +
  xml.slice(blockEnd);

zip.file(docXmlPath, xml);
writeFileSync(
  outputPath,
  zip.generate({ type: "nodebuffer", compression: "DEFLATE" })
);

console.log(`Wrote tagged template to ${outputPath}`);
console.log("Placeholders inserted: {periodo}, {#actividades}{.}{/actividades}");
