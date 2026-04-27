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

/**
 * Extracts plain text from .pptx (OOXML) slide XML. Runs client-side only.
 */
export async function parseDeckPptx(file: File) {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const slidePaths = Object.keys(zip.files).filter((path) =>
    /^ppt\/slides\/slide\d+\.xml$/i.test(path),
  );

  if (slidePaths.length === 0) {
    throw new Error(
      "Could not read slides from this PPTX. Try re-exporting from PowerPoint or Keynote.",
    );
  }

  slidePaths.sort((a, b) => {
    const na = Number.parseInt(a.match(/slide(\d+)/i)?.[1] ?? "0", 10);
    const nb = Number.parseInt(b.match(/slide(\d+)/i)?.[1] ?? "0", 10);
    return na - nb;
  });

  const chunks: string[] = [];

  for (const path of slidePaths) {
    const entry = zip.files[path];
    if (!entry) continue;
    const xml = await entry.async("string");
    const matches = Array.from(
      xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g),
      (match) => match[1]?.trim() ?? "",
    ).filter(Boolean);
    if (matches.length > 0) {
      chunks.push(matches.join(" "));
    }
  }

  const text = chunks.join("\n").trim();

  if (text.length < 20) {
    throw new Error(
      "Very little text was found in this PPTX. Try a deck with selectable text (not only images).",
    );
  }

  return text;
}

export async function parseDeckFile(file: File) {
  const lower = file.name.toLowerCase();
  const { type } = file;

  if (lower.endsWith(".pdf") || type === "application/pdf") {
    return parseDeckPdf(file);
  }

  if (
    lower.endsWith(".pptx") ||
    type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return parseDeckPptx(file);
  }

  if (lower.endsWith(".ppt")) {
    throw new Error("Legacy .ppt files are not supported. Save as .pptx and upload again.");
  }

  throw new Error("Unsupported file type. Upload a PDF or PPTX deck.");
}
