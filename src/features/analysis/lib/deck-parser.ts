"use client";

import JSZip from "jszip";

function decodeXmlText(value: string) {
  if (typeof document === "undefined") {
    return value
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&amp;", "&")
      .replaceAll("&quot;", '"')
      .replaceAll("&apos;", "'");
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

export async function parseDeckPdf(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  let text = "";

  for (let index = 1; index <= pdfDocument.numPages; index += 1) {
    const page = await pdfDocument.getPage(index);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    text += `${pageText}\n`;
  }

  return text.trim();
}

function fileExtension(name: string) {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index + 1).toLowerCase() : "";
}

/**
 * Extract plain text from a .pptx (Open XML) deck by reading slide XML.
 * Concatenates all <a:t> text runs in slide order (Office may split runs).
 */
export async function parseDeckPptx(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slidePaths = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const na = Number.parseInt(a.match(/slide(\d+)/i)?.[1] ?? "0", 10);
      const nb = Number.parseInt(b.match(/slide(\d+)/i)?.[1] ?? "0", 10);
      return na - nb;
    });

  if (slidePaths.length === 0) {
    throw new Error(
      "This file does not look like a valid PPTX (no slides found). Try a different export or use PDF.",
    );
  }

  let text = "";

  for (const path of slidePaths) {
    const content = await zip.file(path)?.async("string");
    if (!content) {
      continue;
    }

    const runs: string[] = [];
    const textRunPattern = /<a:t>([^<]*)<\/a:t>/g;
    let runMatch: RegExpExecArray | null = textRunPattern.exec(content);

    while (runMatch) {
      runs.push(decodeXmlText(runMatch[1] ?? ""));
      runMatch = textRunPattern.exec(content);
    }
    const slideText = runs.join(" ").replace(/\s+/g, " ").trim();

    if (slideText) {
      text += `${slideText}\n`;
    }
  }

  const trimmed = text.trim();
  if (trimmed.length < 50) {
    throw new Error(
      "Could not extract enough text from this PPTX. Try exporting as PDF or ensure slides contain editable text (not only images).",
    );
  }

  return trimmed;
}

export async function parseDeckFile(file: File) {
  const ext = fileExtension(file.name);
  const isPdf =
    ext === "pdf" || file.type === "application/pdf" || file.type === "application/x-pdf";
  const isPptx =
    ext === "pptx" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation";

  if (isPdf) {
    return parseDeckPdf(file);
  }

  if (isPptx) {
    return parseDeckPptx(file);
  }

  throw new Error("Unsupported file type. Upload a PDF or PPTX deck.");
}
