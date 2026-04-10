import { PipelineStage } from "@/lib/types";

/**
 * When false, analysis limits are not enforced (no upgrade prompts or usage blocking).
 * Set to true to restore free-tier behavior.
 */
export const ANALYSIS_PAYWALL_ENABLED = false;

/** HTML `accept` for pitch / diligence uploads (server ingests these types). */
export const PITCH_FILE_ACCEPT =
  ".pdf,.ppt,.pptx,.potx,.doc,.docx,.dotx,.xls,.xlsx,.xltx,.csv,.rtf,.odt,.odp,.ods,.txt,.md,.json,.html,.htm,.xml,.key," +
  ".png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.tif,.tiff,.heic,.heif," +
  ".mp4,.webm,.mov,.m4v,.avi,.mkv";

export const PIPELINE_STAGES: PipelineStage[] = [
  "Inbox",
  "Reviewing",
  "Exploring",
  "Due Diligence",
  "Passed",
  "Invested",
];

/** Single source of truth for sector pickers (thesis, upload deck, filters). */
export const SECTORS = [
  "Fintech",
  "B2B SaaS",
  "AI Infrastructure",
  "Developer Tools",
  "Healthtech",
  "Climate",
  "Vertical SaaS",
  "Consumer",
  "DeepTech",
  "Other",
] as const;

export const STAGES = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Other",
] as const;

/** @deprecated Use SECTORS — kept for incremental refactors */
export const THESIS_SECTORS = [...SECTORS];
