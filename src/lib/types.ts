export type PipelineStage =
  | "Inbox"
  | "Reviewing"
  | "Exploring"
  | "Due Diligence"
  | "Passed"
  | "Invested";

export interface ThesisProfile {
  sectors: string[];
  check_size_range: string;
  target_stage: string[];
  geography_preference: string;
  custom_note: string;
}

export interface ScoreReason {
  score: number;
  reasoning: string;
}

export interface DealAnalysis {
  executive_summary: string;
  team_score: ScoreReason;
  market_score: ScoreReason;
  traction_score: ScoreReason;
  business_model_score: ScoreReason;
  overall_risk_score: number;
  strengths: string[];
  red_flags: string[];
  missing_info: string[];
  recommendation: {
    verdict: "PASS" | "EXPLORE" | "STRONG_YES";
    rationale: string;
  };
  thesis_fit_score: number;
  thesis_fit_reason: string;
  web_context: string;
  analyzed_at: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  note: string;
  timestamp: string;
}

export type AnalysisWorkflowStatus =
  | "pending"
  | "analyzing"
  | "complete"
  | "error";

export interface Deal {
  id: string;
  company_name: string;
  founder_name: string;
  website_url: string;
  stage: string;
  sector: string;
  date_added: string;
  status: PipelineStage;
  notes_html: string;
  usage_remaining: number;
  activity: ActivityItem[];
  analysis: DealAnalysis | null;
  /** Denormalized fit for filters / badges when analysis object is sparse */
  fit_score?: number | null;
  memo?: string;
  analysis_status?: AnalysisWorkflowStatus;
}

export interface UsageCounter {
  used: number;
  limit: number;
  remaining: number;
}
