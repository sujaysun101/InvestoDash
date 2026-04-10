import { DealAnalysis, ThesisProfile } from "@/lib/types";

export function buildThesisFit(
  thesis: ThesisProfile,
  analysis: Omit<
    DealAnalysis,
    "thesis_fit_score" | "thesis_fit_reason" | "web_context" | "analyzed_at"
  >,
) {
  const sectorOverlap = thesis.sectors.some((sector) =>
    analysis.executive_summary.toLowerCase().includes(sector.toLowerCase()),
  );
  const score = Math.min(
    10,
    Math.max(
      1,
      Math.round(
        (analysis.team_score.score +
          analysis.market_score.score +
          analysis.business_model_score.score) /
          3 +
          (sectorOverlap ? 1 : -1),
      ),
    ),
  );

  return {
    thesis_fit_score: score,
    thesis_fit_reason: sectorOverlap
      ? "The company maps well to the investor's stated sectors and quality bar."
      : "The deal shows some merit, but sector and thesis alignment are only partial.",
  };
}
