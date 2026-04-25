"use client";

/* Client-only: PDF (pdf.js) and PPTX (JSZip + slide XML). */

function decodeXmlEntities(raw: string) {
  const map: Record<string, string> = {
    amp: "&",
    apos: "'",
    lt: "<",
    gt: ">",
    quot: "\u0022",
  };
  return raw
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 10)),
    )
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    )
    .replace(/&([a-z]+);/gi, (match, name) => map[name.toLowerCase()] ?? match);
}

function textFromSlideXml(xml: string) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const texts = Array.from(doc.getElementsByTagName("a:t")).map((node) =>
    node.textContent?.trim() ?? "",
  );
  return texts.filter(Boolean).join(" ");
}

function sortedSlidePaths(names: string[]) {
  return names
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const na = Number.parseInt(a.replace(/^ppt\/slides\/slide/i, ""), 10);
      const nb = Number.parseInt(b.replace(/^ppt\/slides\/slide/i, ""), 10);
      return na - nb;
    });
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
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const slideNames = sortedSlidePaths(Object.keys(zip.files));
  if (slideNames.length === 0) {
    throw new Error(
      "No slides found in this deck. Try exporting as PDF or re-saving the PPTX.",
    );
  }

  const chunks: string[] = [];
  for (const name of slideNames) {
    const xml = await zip.file(name)?.async("string");
    if (!xml) continue;
    const slideText = textFromSlideXml(xml);
    if (slideText) {
      chunks.push(decodeXmlEntities(slideText));
    }
  }

  const combined = chunks.join("\n\n").trim();
  if (!combined) {
    throw new Error(
      "Could not read text from this PPTX (images-only slides are common). Try PDF export.",
    );
  }

  return combined;
}

export async function parseDeckFile(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (name.endsWith(".ppt") && !name.endsWith(".pptx")) {
    throw new Error(
      "Legacy .ppt files are not supported. Save as .pptx or PDF and upload again.",
    );
  }

  if (name.endsWith(".pptx") || type.includes("presentationml")) {
    return parseDeckPptx(file);
  }

  if (name.endsWith(".pdf") || type === "application/pdf") {
    return parseDeckPdf(file);
  }

  throw new Error("Unsupported file type. Upload a PDF or PPTX deck.");
}
