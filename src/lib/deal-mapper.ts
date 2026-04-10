import { Deal, DealAnalysis, PipelineStage } from "@/lib/types";

type DealRow = {
  id: string;
  user_id?: string;
  company_name: string;
  founder_name?: string;
  website_url?: string;
  stage: string;
  sector: string;
  notes_html?: string;
  status: string;
  date_added?: string;
  analysis_status?: string | null;
  memo?: string | null;
  deck_url?: string | null;
  recommendation?: string | null;
  team_score?: number | null;
  market_score?: number | null;
  traction_score?: number | null;
  business_model_score?: number | null;
  risk_score?: number | null;
  thesis_fit?: number | null;
  fit_score?: number | null;
  ai_summary?: string | null;
  ai_team_notes?: string | null;
  ai_market_notes?: string | null;
  ai_risk_notes?: string | null;
};

type DealAnalysisRow = {
  deal_id: string;
  executive_summary: string;
  team_score: number;
  team_reasoning: string;
  market_score: number;
  market_reasoning: string;
  traction_score: number;
  traction_reasoning: string;
  business_model_score: number;
  business_model_reasoning: string;
  overall_risk_score: number;
  strengths: string[];
  red_flags: string[];
  missing_info: string[];
  recommendation: string;
  recommendation_rationale: string;
  thesis_fit_score: number;
  thesis_fit_reason: string;
  web_context: string;
  raw_json?: unknown;
  updated_at?: string;
};

function verdictFromRecommendation(
  rec: string,
): "PASS" | "EXPLORE" | "STRONG_YES" {
  const u = rec?.toUpperCase() ?? "";
  if (u === "INVEST" || u === "STRONG_YES") return "STRONG_YES";
  if (u === "PASS") return "PASS";
  if (u === "EXPLORE") return "EXPLORE";
  return "EXPLORE";
}

function buildAnalysisFromDealColumns(row: DealRow): DealAnalysis | null {
  const status = row.analysis_status ?? "pending";
  if (status !== "complete" && status !== "analyzing") {
    if (
      row.team_score == null &&
      row.market_score == null &&
      !row.ai_summary
    ) {
      return null;
    }
  }
  if (
    row.team_score == null &&
    row.market_score == null &&
    !row.ai_summary
  ) {
    return null;
  }

  const team = row.team_score ?? 0;
  const market = row.market_score ?? 0;
  const traction = row.traction_score ?? 0;
  const biz = row.business_model_score ?? 0;
  const risk = row.risk_score ?? 0;
  const thesisFit = row.thesis_fit ?? row.fit_score ?? 0;

  return {
    executive_summary: row.ai_summary ?? "",
    team_score: {
      score: team,
      reasoning: row.ai_team_notes ?? "",
    },
    market_score: {
      score: market,
      reasoning: row.ai_market_notes ?? "",
    },
    traction_score: {
      score: traction,
      reasoning: "",
    },
    business_model_score: {
      score: biz,
      reasoning: "",
    },
    overall_risk_score: risk,
    strengths: [],
    red_flags: [],
    missing_info: [],
    recommendation: {
      verdict: verdictFromRecommendation(row.recommendation ?? "EXPLORE"),
      rationale: row.ai_summary ?? "",
    },
    thesis_fit_score: thesisFit,
    thesis_fit_reason: "",
    web_context: "",
    analyzed_at: new Date().toISOString(),
  };
}

export function buildAnalysisFromDealAnalysisRow(
  row: DealAnalysisRow,
): DealAnalysis {
  return {
    executive_summary: row.executive_summary,
    team_score: {
      score: row.team_score,
      reasoning: row.team_reasoning,
    },
    market_score: {
      score: row.market_score,
      reasoning: row.market_reasoning,
    },
    traction_score: {
      score: row.traction_score,
      reasoning: row.traction_reasoning,
    },
    business_model_score: {
      score: row.business_model_score,
      reasoning: row.business_model_reasoning,
    },
    overall_risk_score: row.overall_risk_score,
    strengths: row.strengths ?? [],
    red_flags: row.red_flags ?? [],
    missing_info: row.missing_info ?? [],
    recommendation: {
      verdict: verdictFromRecommendation(row.recommendation),
      rationale: row.recommendation_rationale,
    },
    thesis_fit_score: row.thesis_fit_score,
    thesis_fit_reason: row.thesis_fit_reason,
    web_context: row.web_context,
    analyzed_at: row.updated_at ?? new Date().toISOString(),
  };
}

export function mapSupabaseDealToDeal(
  row: DealRow,
  analysisRow: DealAnalysisRow | null | Record<string, unknown>,
  activity: Array<{
    id: string;
    title: string;
    note: string;
    timestamp: string;
  }>,
  usageRemaining: number,
): Deal {
  const status = (row.status ?? "Inbox") as PipelineStage;
  const analysis =
    analysisRow != null && "executive_summary" in analysisRow
      ? buildAnalysisFromDealAnalysisRow(analysisRow as DealAnalysisRow)
      : buildAnalysisFromDealColumns(row);

  const notes = row.memo ?? row.notes_html ?? "";

  return {
    id: row.id,
    company_name: row.company_name,
    founder_name: row.founder_name ?? "",
    website_url: row.website_url ?? "",
    stage: row.stage,
    sector: row.sector,
    date_added: String(row.date_added ?? ""),
    status,
    notes_html: notes,
    usage_remaining: usageRemaining,
    activity,
    analysis,
    analysis_status: (row.analysis_status as Deal["analysis_status"]) ?? "pending",
    fit_score:
      analysisRow != null && "thesis_fit_score" in analysisRow
        ? (analysisRow as DealAnalysisRow).thesis_fit_score
        : (row.fit_score ?? row.thesis_fit ?? null),
    memo: notes,
  };
}
