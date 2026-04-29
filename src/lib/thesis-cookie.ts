import { ThesisProfile } from "@/lib/types";

export const THESIS_PROFILE_COOKIE = "investodash_thesis_profile";

export function parseThesisProfileCookie(raw: string | undefined): ThesisProfile | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (
      !Array.isArray(o.sectors) ||
      typeof o.check_size_range !== "string" ||
      !Array.isArray(o.target_stage) ||
      typeof o.geography_preference !== "string" ||
      typeof o.custom_note !== "string"
    ) {
      return null;
    }
    return {
      sectors: o.sectors.filter((s): s is string => typeof s === "string"),
      check_size_range: o.check_size_range,
      target_stage: o.target_stage.filter((s): s is string => typeof s === "string"),
      geography_preference: o.geography_preference,
      custom_note: o.custom_note,
    };
  } catch {
    return null;
  }
}
