"use client";

import JSZip from "jszip";

function decodeXmlTextEntities(raw: string) {
  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = raw;
    return textarea.value;
  }
  return raw
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function extractTextFromPptxSlideXml(xml: string) {
  const chunks: string[] = [];
  const pattern = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
  let match = pattern.exec(xml);
  while (match) {
    chunks.push(decodeXmlTextEntities(match[1]));
    match = pattern.exec(xml);
  }
  return chunks.join(" ").replace(/\s+/g, " ").trim();
}

async function parseDeckPptx(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort((a, b) => {
      const na = Number.parseInt(/slide(\d+)/i.exec(a)?.[1] ?? "0", 10);
      const nb = Number.parseInt(/slide(\d+)/i.exec(b)?.[1] ?? "0", 10);
      return na - nb;
    });

  if (slidePaths.length === 0) {
    throw new Error("Could not read slides from this PPTX (unexpected structure).");
  }

  let text = "";
  for (const path of slidePaths) {
    const entry = zip.file(path);
    if (!entry) continue;
    const xml = await entry.async("string");
    const slideText = extractTextFromPptxSlideXml(xml);
    if (slideText) {
      text += `${slideText}\n`;
    }
  }

  const trimmed = text.trim();
  if (trimmed.length < 20) {
    throw new Error(
      "Very little text was found in this deck. Try a PDF export or a deck with editable text.",
    );
  }

  return trimmed;
}

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

export async function parseDeckFile(file: File) {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();

  if (name.endsWith(".pdf") || mime === "application/pdf") {
    return parseDeckPdf(file);
  }

  if (
    name.endsWith(".pptx") ||
    mime ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return parseDeckPptx(file);
  }

  throw new Error("Unsupported file type. Use a PDF or PPTX deck.");
}
