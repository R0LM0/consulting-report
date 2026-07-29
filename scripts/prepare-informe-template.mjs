// One-off (rerunnable) tool that takes the consultant's real, hand-made
// "Informe de Actividades" .docx and produces a docxtemplater-ready copy
// with {tag} placeholders, WITHOUT touching the original file and without
// disturbing the letterhead/watermark images or any other formatting.
//
// Why this exists: Word splits a single visible line of text into several
// <w:r> runs (spellcheck/rsid tracking), so a naive text search-and-replace
// on word/document.xml would not find "Julio del 2026" as one contiguous
// string. This script targets the exact run sequences (verified by manually
// inspecting the unzipped XML) and does surgical, byte-precise replacements
// instead of reserializing/reformatting the whole document.
//
// Usage:
//   node scripts/prepare-informe-template.mjs [inputDocx] [outputDocx]
//
// Defaults to the consultant's real July 2026 file as input and
// src/templates/informe.template.docx as output.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import PizZip from "pizzip";

const DEFAULT_INPUT =
  "D:\\DESCARGA\\2025\\2026\\JULIO\\Informe de Activdades Julio 2026.docx";
const DEFAULT_OUTPUT = resolve(
  import.meta.dirname,
  "../src/templates/informe.template.docx"
);

const inputPath = process.argv[2] ?? DEFAULT_INPUT;
const outputPath = process.argv[3] ?? DEFAULT_OUTPUT;

const original = readFileSync(inputPath);
const zip = new PizZip(original);

const docXmlPath = "word/document.xml";
const documentXml = zip.file(docXmlPath);
if (!documentXml) {
  throw new Error(`${docXmlPath} not found inside ${inputPath}`);
}

let xml = documentXml.asText();

// ---------------------------------------------------------------------
// 1) "Informe del mes: <tab><tab>Julio del 2026" -> "{mes} del {anio}"
//
// The month/year text is split across 3 runs due to a manual edit
// ("Julio" / " del 202" / "6"). Replace all 3 with a single run carrying
// the same run properties (rPr) as the original runs, so the visual
// style (Arial 11pt es-NI) is unchanged.
// ---------------------------------------------------------------------
const monthRunsPattern =
  '<w:r w:rsidR="00FF367F"><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Calibri" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="es-NI"/></w:rPr><w:t>Julio</w:t></w:r>' +
  '<w:r w:rsidRPr="00FE70B4"><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Calibri" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="es-NI"/></w:rPr><w:t xml:space="preserve"> del 202</w:t></w:r>' +
  '<w:r><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Calibri" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="es-NI"/></w:rPr><w:t>6</w:t></w:r>';

const monthRunsCount = xml.split(monthRunsPattern).length - 1;
if (monthRunsCount !== 1) {
  throw new Error(
    `Expected exactly 1 occurrence of the month run sequence, found ${monthRunsCount}. ` +
      "The source document layout changed - inspect word/document.xml manually before rerunning."
  );
}

const monthReplacement =
  '<w:r><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Calibri" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="es-NI"/></w:rPr><w:t xml:space="preserve">{mes} del {anio}</w:t></w:r>';

xml = xml.replace(monthRunsPattern, monthReplacement);

// ---------------------------------------------------------------------
// 2) The 14 numbered activity paragraphs (auto-numbered via w:numId=3,
//    the numbers "1.", "2." ... are NOT literal text) become a
//    docxtemplater paragraph loop over a plain string[]:
//
//    {#actividades}
//    <one paragraph, numPr preserved so Word keeps auto-numbering>{.}
//    {/actividades}
//
//    docxtemplater repeats the single body paragraph once per array item
//    and removes the two marker paragraphs. Because numPr lives on the
//    repeated paragraph, Word still renders 1., 2., 3., ... automatically.
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

if (blockStart === -1 || firstParaEnd === -1 || blockEnd === -1) {
  throw new Error("Failed to locate paragraph boundaries around w:numId=3.");
}

const firstParaRaw = xml.slice(blockStart, firstParaEnd);

const pPrMatch = firstParaRaw.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
if (!pPrMatch) {
  throw new Error("First activity paragraph has no <w:pPr> to reuse.");
}
const pPr = pPrMatch[0];

// First <w:r>...<w:rPr>...</w:rPr> found OUTSIDE of <w:pPr> (i.e. the
// first actual run's formatting), so the loop body keeps the same
// Courier New styling as the original list items.
const afterPPr = firstParaRaw.slice(pPrMatch.index + pPr.length);
const runRPrMatch = afterPPr.match(/<w:r[ >][\s\S]*?<w:rPr>([\s\S]*?)<\/w:rPr>/);
if (!runRPrMatch) {
  throw new Error("Could not find a run rPr to reuse for the loop body.");
}
const runRPr = runRPrMatch[1];

const countInBlock = (
  xml.slice(blockStart, blockEnd).match(new RegExp(numIdMarker, "g")) ?? []
).length;
if (countInBlock !== 14) {
  throw new Error(
    `Expected 14 activity paragraphs, found ${countInBlock}. ` +
      "The source document changed - inspect word/document.xml manually before rerunning."
  );
}

const startLoopPara = "<w:p><w:r><w:t>{#actividades}</w:t></w:r></w:p>";
const bodyPara = `<w:p>${pPr}<w:r><w:rPr>${runRPr}</w:rPr><w:t xml:space="preserve">{.}</w:t></w:r></w:p>`;
const endLoopPara = "<w:p><w:r><w:t>{/actividades}</w:t></w:r></w:p>";

xml =
  xml.slice(0, blockStart) +
  startLoopPara +
  bodyPara +
  endLoopPara +
  xml.slice(blockEnd);

// ---------------------------------------------------------------------
// Write back into the zip (only word/document.xml changes; every other
// part - images, headers, footers, styles, numbering.xml - is untouched
// byte-for-byte) and save.
// ---------------------------------------------------------------------
zip.file(docXmlPath, xml);

const outBuffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
writeFileSync(outputPath, outBuffer);

console.log(`Wrote tagged template to ${outputPath}`);
console.log("Placeholders inserted: {mes}, {anio}, {#actividades}{.}{/actividades}");
