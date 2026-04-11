import { OfficeParser } from "officeparser";

const MAX_UPLOAD_BYTES = 40 * 1024 * 1024;

const PLAIN_TEXT_EXT = new Set([
  "txt",
  "md",
  "csv",
  "json",
  "html",
  "htm",
  "xml",
  "log",
  "yaml",
  "yml",
]);

const IMAGE_EXT = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "tif",
  "tiff",
  "heic",
  "heif",
]);

const VIDEO_EXT = new Set([
  "mp4",
  "webm",
  "mov",
  "m4v",
  "avi",
  "mkv",
  "mpeg",
  "mpg",
]);

function fileExt(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i + 1).toLowerCase() : "";
}

function imageMime(ext: string, declared: string): string {
  if (declared.startsWith("image/")) return declared;
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    tif: "image/tiff",
    tiff: "image/tiff",
    heic: "image/heic",
    heif: "image/heif",
  };
  return map[ext] ?? "image/png";
}

export type DeckMaterial =
  | { kind: "text"; text: string }
  | { kind: "vision"; base64: string; mime: string; filename: string };

/**
 * Normalize an uploaded file into plain text (slides, docs, tabular exports)
 * or a vision payload for raster/photo pitch material.
 */
export async function prepareDeckMaterial(file: File): Promise<DeckMaterial> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File is too large (max ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB).`,
    );
  }

  const filename = file.name || "upload";
  const ext = fileExt(filename);
  const mime = (file.type || "").toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());

  if (PLAIN_TEXT_EXT.has(ext) || mime.startsWith("text/") || mime === "application/json") {
    return { kind: "text", text: buf.toString("utf8") };
  }

  if (ext === "svg" || mime === "image/svg+xml") {
    return {
      kind: "text",
      text: `SVG document (${filename}):\n${buf.toString("utf8")}`,
    };
  }

  if (mime.startsWith("image/") || IMAGE_EXT.has(ext)) {
    return {
      kind: "vision",
      base64: buf.toString("base64"),
      mime: imageMime(ext, mime),
      filename,
    };
  }

  if (mime.startsWith("video/") || VIDEO_EXT.has(ext)) {
    return {
      kind: "text",
      text: [
        `Video file: "${filename}" (${mime || ext || "video"}).`,
        "Frames and audio are not transcribed in this pipeline.",
        "Produce diligence scores using the company name and sector below, clearly noting in ai_summary that the assessment is not based on the video contents.",
        "Flag elevated uncertainty in ai_risk_notes.",
      ].join("\n"),
    };
  }

  try {
    const ast = await OfficeParser.parseOffice(buf);
    const text = ast.toText().trim();
    if (text.length > 0) {
      return { kind: "text", text };
    }
  } catch {
    /* try utf-8 fallback below */
  }

  const asUtf8 = buf.toString("utf8");
  let printable = 0;
  for (let i = 0; i < asUtf8.length; i += 1) {
    const code = asUtf8.charCodeAt(i);
    if ((code >= 32 && code < 127) || code === 9 || code === 10 || code === 13) {
      printable += 1;
    }
  }
  const printableRatio = asUtf8.length > 0 ? printable / asUtf8.length : 0;

  if (asUtf8.length >= 80 && printableRatio > 0.85) {
    return { kind: "text", text: asUtf8 };
  }

  throw new Error(
    `Could not extract content from "${filename}". ` +
      "Try PD