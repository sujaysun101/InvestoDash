import { PipelineStage } from "@/lib/types";

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
