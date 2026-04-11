import { DealAnalysis, ThesisProfile } from "@/lib/types";

// ---------------------------------------------------------------------------
// Thesis fit scoring — multi-dimensional, weighted
// Dimensions and weights:
//   Sector match        — 35 %
//   Stage match         — 25 %
//   Quality floor       — 25 %
//   Geography match     — 10 %
//   Custom / catch-all  —  5 %
// ---------------------------------------------------------------------------

type PartialAnalysis = Omit<
  DealAnalysis,
  "thesis_fit_score" | "thesis_fit_reason" | "web_context" | "analyzed_at"
>;

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function containsAny(haystack: string, needles: string[]): boolean {
  const h = norm(haystack);
  return needles.some((n) => h.includes(norm(n)));
}

// ---------------------------------------------------------------------------
// Sector match  (0 - 1)
// ---------------------------------------------------------------------------
function scoreSectorMatch(
  thesis: ThesisProfile,
  analysis: PartialAnalysis,
  companyContext: string,
): number {
  if (!thesis.sectors?.length) return 0.5;

  const corpus = [
    analysis.executive_summary,
    analysis.team_score.reasoning,
    analysis.market_score.reasoning,
    companyContext,
  ].join(" ");

  const matchCount = thesis.sectors.filter((sector) =>
    containsAny(corpus, [sector, ...getSectorAliases(sector)]),
  ).length;

  if (matchCount === 0) return 0.1;
  if (matchCount === 1) return 0.7;
  return 1.0;
}

function getSectorAliases(sector: string): string[] {
  const aliases: Record<string, string[]> = {
    Fintech: ["financial", "payments", "banking", "lending", "credit", "fintech", "treasury", "wealth"],
    "B2B SaaS": ["saas", "enterprise software", "b2b", "workflow", "platform"],
    "AI Infrastructure": ["ai infrastructure", "llm", "machine learning", "inference", "model serving", "mlops", "gpu"],
    "Developer Tools": ["devtools", "developer", "sdk", "api", "observability", "cicd", "deployment", "engineering"],
    Healthtech: ["health", "medical", "clinical", "healthcare", "pharma", "biotech", "patient"],
    Climate: ["climate", "energy", "carbon", "sustainability", "clean tech", "renewable", "grid"],
    "Vertical SaaS": ["vertical", "industry-specific", "niche software", "workflow automation"],
    Consumer: ["consumer", "app", "marketplace", "retail", "d2c", "social"],
    DeepTech: ["deeptech", "deep tech", "research", "semiconductor", "quantum", "robotics", "materials"],
    Other: [],
  };
  return aliases[sector] ?? [];
}

// ---------------------------------------------------------------------------
// Stage match  (0 - 1)
// ---------------------------------------------------------------------------
function scoreStageMatch(thesis: ThesisProfile, dealStage: string): number {
  if (!thesis.target_stage?.length) return 0.5;

  const deal = norm(dealStage);
  const exact = thesis.target_stage.some((s) => norm(s) === deal);
  if (exact) return 1.0;

  const stageOrder = ["pre-seed", "seed", "series a", "series b", "growth", "other"];
  const dealIdx = stageOrder.findIndex((s) => deal.includes(s));
  const thesisIdxs = thesis.target_stage.map((s) =>
    stageOrder.findIndex((o) => norm(s).includes(o)),
  );

  const minDistance =
    dealIdx >= 0
      ? Math.min(...thesisIdxs.filter((i) => i >= 0).map((i) => Math.abs(i - dealIdx)))
      : 2;

  if (minDistance === 0) return 1.0;
  if (minDistance === 1) return 0.6;
  if (minDistance === 2) return 0.3;
  return 0.1;
}

// ---------------------------------------------------------------------------
// Quality floor  (0 - 1)
// ---------------------------------------------------------------------------
function scoreQualityFloor(analysis: PartialAnalysis): number {
  const composite =
    (analysis.team_score.score +
      analysis.market_score.score +
      analysis.business_model_score.score) /
    3;

  if (composite >= 8) return 1.0;
  if (composite >= 7) return 0.85;
  if (composite >= 6) return 0.7;
  if (composite >= 5) return 0.5;
  if (composite >= 4) return 0.3;
  return 0.15;
}

// ---------------------------------------------------------------------------
// Geography match  (0 - 1)
// ---------------------------------------------------------------------------
function scoreGeographyMatch(thesis: ThesisProfile, companyContext: string): number {
  const geo = norm(thesis.geography_preference ?? "");
  if (!geo || geo === "global" || geo === "worldwide" || geo === "any") return 0.8;

  const corpus = norm(companyContext);
  const geoTokens = geo.split(/[\s,+\/]+/).filter((t) => t.length > 1);
  const matchCount = geoTokens.filter((t) => corpus.includes(t)).length;

  if (matchCount === 0) return 0.3;
  if (matchCount === 1) return 0.7;
  return 1.0;
}

// ---------------------------------------------------------------------------
// Custom note signal  (0 - 1)
// ---------------------------------------------------------------------------
function scoreCustomNote(thesis: ThesisProfile, analysis: PartialAnalysis): number {
  const note = norm(thesis.custom_note ?? "");
  if (!note || note.length < 5) return 0.5;

  const corpus = norm(
    [
      analysis.executive_summary,
      analysis.team_score.reasoning,
      analysis.market_score.reasoning,
    ].join(" "),
  );

  const stopWords = new Set(["with", "that", "this", "from", "into", "have", "their", "want", "lean"]);
  const keywords = note.split(/\s+/).filter((w) => w.length > 4 && !stopWords.has(w));

  if (keywords.length === 0) return 0.5;
  const matches = keywords.filter((kw) => corpus.includes(kw)).length;
  const ratio = matches / keywords.length;

  if (ratio >= 0.5) return 1.0;
  if (ratio >= 0.25) return 0.7;
  return 0.3;
}

// ---------------------------------------------------------------------------
// Reason builder
// ---------------------------------------------------------------------------
function buildReason(
  thesis: ThesisProfile,
  sectorScore: number,
  stageScore: number,
  qualityScore: number,
  finalScore: number,
  dealStage: string,
): string {
  const parts: string[] = [];

  if (sectorScore >= 0.9) {
    parts.push(`strong sector overlap with ${thesis.sectors.slice(0, 2).join(" / ")}`);
  } else if (sectorScore >= 0.6) {
    parts.push(`partial sector overlap with stated thesis`);
  } else {
    parts.push(`sector sits outside the stated focus areas (${thesis.sectors.slice(0, 2).join(", ")})`);
  }

  if (stageScore >= 0.9) {
    parts.push(`${dealStage} is a target stage`);
  } else if (stageScore >= 0.5) {
    parts.push(`${dealStage} is adjacent to target stages (${thesis.target_stage.join(", ")})`);
  } else {
    parts.push(`${dealStage} is outside preferred stages (${thesis.target_stage.join(", ")})`);
  }

  if (qualityScore >= 0.85) {
    parts.push(`team and market quality clears the thesis bar`);
  } else if (qualityScore < 0.4) {
    parts.push(`underlying scores are below the quality threshold`);
  }

  const verdict =
    finalScore >= 8
      ? "Strong thesis match."
      : finalScore >= 6
        ? "Reasonable thesis alignment."
        : finalScore >= 4
          ? "Partial alignment — proceed with caution."
          : "Weak thesis fit — may be outside core mandate.";

  return `${verdict} Signals: ${parts.join("; ")}.`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function buildThesisFit(
  thesis: ThesisProfile,
  analysis: PartialAnalysis,
  dealStage = "Unknown",
  companyContext = "",
): { thesis_fit_score: number; thesis_fit_reason: string } {
  const sectorScore = scoreSectorMatch(thesis, analysis, companyContext);
  const stageScore = scoreStageMatch(thesis, dealStage);
  const qualityScore = scoreQualityFloor(analysis);
  const geoScore = scoreGeographyMatch(thesis, companyContext);
  const customScore = scoreCustomNote(thesis, analysis);

  const weighted =
    sectorScore * 0.35 +
    stageScore * 0.25 +
    qualityScore * 0.25 +
    geoScore * 0.10 +
    customScore * 0.05;

  const rawScore = weighted * 10;
  const thesis_fit_score = Math.min(10, Math.max(1, Math.round(rawScore)));

  const thesis_fit_reason = buildReason(
    thesis,
    sectorScore,
    stageScore,
    qualityScore,
    thesis_fit_score,
    dealStage,
  );

  return { thesis_fit_score, thesis_fit_reason };
}
