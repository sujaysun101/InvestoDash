"use client";

function extractTextFromSlideXml(xml: string) {
  const re = /<a:t[^>]*>([\s\S]*?)<\/a:t>/gi;
  const parts: string[] = [];
  let match = re.exec(xml);
  while (match !== null) {
    parts.push(decodeXmlEntities(match[1] ?? "").replace(/\s+/g, " ").trim());
    match = re.exec(xml);
  }
  return parts.filter(Boolean);
}

function decodeXmlEntities(raw: string) {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    );
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

async function parseDeckPptx(file: File) {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  const slideKeys = Object.keys(zip.files)
    .filter(
      (key) =>
        /^ppt\/slides\/slide\d+\.xml$/i.test(key) && !zip.files[key].dir,
    )
    .sort((a, b) => {
      const na = Number.parseInt(/slide(\d+)/i.exec(a)?.[1] ?? "0", 10);
      const nb = Number.parseInt(/slide(\d+)/i.exec(b)?.[1] ?? "0", 10);
      return na - nb;
    });

  if (slideKeys.length === 0) {
    throw new Error("No slides found in this PowerPoint file.");
  }

  const slideTexts: string[] = [];

  for (const key of slideKeys) {
    const xml = await zip.files[key].async("string");
    const slideText = extractTextFromSlideXml(xml).join(" ").trim();
    if (slideText) slideTexts.push(slideText);
  }

  const combined = slideTexts.join("\n").trim();

  if (!combined) {
    throw new Error(
      "Could not read text from this PPTX. Try exporting from PowerPoint again, or use a PDF.",
    );
  }

  return combined;
}

export async function parseDeckFile(file: File) {
  const name = file.name.toLowerCase();
  const { type } = file;

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return parseDeckPdf(file);
  }

  if (
    type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    name.endsWith(".pptx")
  ) {
    return parseDeckPptx(file);
  }

  if (name.endsWith(".ppt")) {
    throw new Error(
      "Legacy .ppt files are not supported. Save as PPTX or export a PDF.",
    );
  }

  throw new Error("Unsupported file type. Upload a PDF or PPTX deck.");
}
