"use client";

import JSZip from "jszip";

const DRAWINGML_NS =
  "http://schemas.openxmlformats.org/drawingml/2006/main";

function fileExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
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

/** Extract visible text from a .pptx (OOXML) deck in the browser. */
export async function parseDeckPptx(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const slidePaths = Object.keys(zip.files).filter((path) =>
    /^ppt\/slides\/slide\d+\.xml$/i.test(path),
  );

  slidePaths.sort((a, b) => {
    const na = Number.parseInt(a.match(/slide(\d+)\.xml/i)?.[1] ?? "0", 10);
    const nb = Number.parseInt(b.match(/slide(\d+)\.xml/i)?.[1] ?? "0", 10);
    return na - nb;
  });

  const chunks: string[] = [];

  for (const path of slidePaths) {
    const fileEntry = zip.file(path);
    if (!fileEntry) continue;

    const xml = await fileEntry.async("string");
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const textNodes = doc.getElementsByTagNameNS(DRAWINGML_NS, "t");

    for (let i = 0; i < textNodes.length; i += 1) {
      const value = textNodes[i].textContent?.trim();
      if (value) chunks.push(value);
    }
  }

  return chunks.join(" ").replace(/\s+/g, " ").trim();
}

export async function parseDeckText(file: File) {
  const ext = fileExtension(file.name);
  const mime = file.type.toLowerCase();

  const isPdf =
    ext === "pdf" || mime === "application/pdf" || mime === "application/x-pdf";
  const isPptx =
    ext === "pptx" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation";

  if (isPdf) {
    return parseDeckPdf(file);
  }

  if (isPptx) {
    return parseDeckPptx(file);
  }

  throw new Error("Unsupported format. Upload a PDF or PPTX deck.");
}
