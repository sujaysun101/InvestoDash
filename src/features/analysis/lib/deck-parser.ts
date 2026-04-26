"use client";

import JSZip from "jszip";

export async function parseDeckPdf(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const document = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  let text = "";

  for (let index = 1; index <= document.numPages; index += 1) {
    const page = await document.getPage(index);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    text += `${pageText}\n`;
  }

  return text.trim();
}

function extractTextFromOoxmlXml(xml: string) {
  const parts: string[] = [];
  const tagText = /<(?:a|w):t(?:\s[^>]*)?>([^<]*)<\/(?:a|w):t>/g;
  let match = tagText.exec(xml);
  while (match) {
    if (match[1]) {
      parts.push(match[1]);
    }
    match = tagText.exec(xml);
  }
  return parts.join(" ");
}

export async function parseDeckPptx(file: File) {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const slidePaths = Object.keys(zip.files)
    .filter(
      (path) =>
        /^ppt\/slides\/slide\d+\.xml$/i.test(path) && !zip.files[path].dir,
    )
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)\.xml$/i)?.[1] ?? 0);
      const nb = Number(b.match(/slide(\d+)\.xml$/i)?.[1] ?? 0);
      return na - nb;
    });

  if (slidePaths.length === 0) {
    throw new Error("Could not read slide content from this PPTX.");
  }

  const chunks: string[] = [];
  for (const path of slidePaths) {
    const xml = await zip.files[path].async("string");
    const slideText = extractTextFromOoxmlXml(xml).trim();
    if (slideText) {
      chunks.push(slideText);
    }
  }

  const notesPaths = Object.keys(zip.files).filter(
    (path) =>
      /^ppt\/notesSlides\/notesSlide\d+\.xml$/i.test(path) &&
      !zip.files[path].dir,
  );

  for (const path of notesPaths.sort()) {
    const xml = await zip.files[path].async("string");
    const noteText = extractTextFromOoxmlXml(xml).trim();
    if (noteText) {
      chunks.push(noteText);
    }
  }

  const combined = chunks.join("\n\n").trim();
  if (!combined) {
    throw new Error(
      "This PPTX has no extractable text (try exporting slides with editable text, or use PDF).",
    );
  }

  return combined;
}

const PDF_TYPES = new Set(["application/pdf"]);
const PPTX_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export async function parseDeckFile(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (PDF_TYPES.has(type) || name.endsWith(".pdf")) {
    return parseDeckPdf(file);
  }

  if (PPTX_TYPES.has(type) || name.endsWith(".pptx")) {
    return parseDeckPptx(file);
  }

  throw new Error("Unsupported file type. Upload a PDF or PPTX deck.");
}
