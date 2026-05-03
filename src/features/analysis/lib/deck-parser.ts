"use client";

function extractTextFromSlideXml(xml: string): string {
  const chunks: string[] = [];
  const drawingText = /<a:t>([^<]*)<\/a:t>/g;
  let match = drawingText.exec(xml);
  while (match !== null) {
    const piece = match[1].replace(/\s+/g, " ").trim();
    if (piece) chunks.push(piece);
    match = drawingText.exec(xml);
  }

  if (chunks.length === 0) {
    return xml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return chunks.join(" ");
}

async function parseDeckPptx(file: File): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  const slideNames = Object.keys(zip.files).filter((name) =>
    /^ppt\/slides\/slide\d+\.xml$/i.test(name),
  );

  slideNames.sort((a, b) => {
    const na = Number.parseInt(a.match(/slide(\d+)/i)?.[1] ?? "0", 10);
    const nb = Number.parseInt(b.match(/slide(\d+)/i)?.[1] ?? "0", 10);
    return na - nb;
  });

  const parts: string[] = [];
  for (const name of slideNames) {
    const entry = zip.file(name);
    if (!entry) continue;
    const xml = await entry.async("string");
    const slideText = extractTextFromSlideXml(xml);
    if (slideText) parts.push(slideText);
  }

  const text = parts.join("\n\n").trim();
  if (text.length < 50) {
    throw new Error(
      "Could not extract enough text from this deck. Try a PDF export or ensure slides contain visible text.",
    );
  }

  return text;
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

  const trimmed = text.trim();
  if (trimmed.length < 50) {
    throw new Error(
      "Could not extract enough text from this PDF. The file may be image-only; try a text-based export.",
    );
  }

  return trimmed;
}

const PPTX_MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

export function isPptxFile(file: File): boolean {
  return (
    file.type === PPTX_MIME ||
    file.name.toLowerCase().endsWith(".pptx")
  );
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

/** Client-side deck text extraction for PDF and PPTX (OOXML) uploads. */
export async function parseDeckFile(file: File): Promise<string> {
  if (isPdfFile(file)) {
    return parseDeckPdf(file);
  }
  if (isPptxFile(file)) {
    return parseDeckPptx(file);
  }

  throw new Error("Unsupported file type. Upload a PDF or PPTX deck.");
}
