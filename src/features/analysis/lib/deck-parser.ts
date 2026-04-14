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

function decodeXmlEntities(raw: string) {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) =>
      String.fromCodePoint(Number.parseInt(n, 10)),
    )
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
      String.fromCodePoint(Number.parseInt(h, 16)),
    );
}

function extractTextFromPptxSlideXml(xml: string) {
  const chunks: string[] = [];
  const tTag =
    /<(?:w|a):t(?:\s[^>]*)?>([\s\S]*?)<\/(?:w|a):t>/g;
  let match: RegExpExecArray | null = tTag.exec(xml);
  while (match !== null) {
    const inner = match[1].replace(/<[^>]+>/g, "");
    const decoded = decodeXmlEntities(inner).trim();
    if (decoded) chunks.push(decoded);
    match = tTag.exec(xml);
  }
  if (chunks.length > 0) {
    return chunks.join(" ");
  }
  const stripped = xml.replace(/<[^>]+>/g, " ");
  return decodeXmlEntities(stripped).replace(/\s+/g, " ").trim();
}

export async function parseDeckPptx(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const slidePaths = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const na = Number.parseInt(a.match(/slide(\d+)/i)?.[1] ?? "0", 10);
      const nb = Number.parseInt(b.match(/slide(\d+)/i)?.[1] ?? "0", 10);
      return na - nb;
    });

  if (slidePaths.length === 0) {
    throw new Error("No slide content found in this PPTX file.");
  }

  const parts: string[] = [];
  for (const path of slidePaths) {
    const entry = zip.file(path);
    if (!entry) continue;
    const xml = await entry.async("string");
    const slideText = extractTextFromPptxSlideXml(xml);
    if (slideText) parts.push(slideText);
  }

  const text = parts.join("\n").trim();
  if (text.length < 50) {
    throw new Error(
      "Could not extract enough text from this PPTX. Try exporting slides as PDF or saving as a different format.",
    );
  }
  return text;
}

export async function parseDeckFile(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  const isPdf =
    name.endsWith(".pdf") || type === "application/pdf";
  const isPptx =
    name.endsWith(".pptx") ||
    type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation";

  if (isPdf) return parseDeckPdf(file);
  if (isPptx) return parseDeckPptx(file);

  throw new Error("Unsupported file type. Upload a PDF or PPTX deck.");
}
