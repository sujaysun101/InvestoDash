import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildAnalysisFromHeuristics,
  runAnthropicAnalysis,
} from "@/features/analysis/server/anthropic";
import { buildThesisFit } from "@/features/analysis/server/thesis-fit";
import { buildWebResearchSummary } from "@/features/analysis/server/web-research";
import { DEMO_COOKIE_NAME, hasDemoCookie } from "@/lib/demo-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ThesisProfile } from "@/lib/types";

const requestSchema = z.object({
  dealId: z.string(),
  companyName: z.string(),
  founderName: z.string().optional().default(""),
  extractedText: z.string().min(50),
  thesis: z.custom<ThesisProfile>(),
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const cookieStore = cookies();
  const isDemoSession = hasDemoCookie(cookieStore.get(DEMO_COOKIE_NAME)?.value);

  if (supabase && !isDemoSession) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let jsonBody: unknown;
  try {
    jsonBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(jsonBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;
  const analysis =
    process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_MODEL
      ? await runAnthropicAnalysis(body.extractedText)
      : buildAnalysisFromHeuristics(body.companyName, body.extractedText);

  const thesisFit = buildThesisFit(body.thesis, analysis);
  const webContext = await buildWebResearchSummary(
    body.companyName,
    body.founderName,
  );

  const fullAnalysis = {
    ...analysis,
    ...thesisFit,
    web_context: webContext,
    analyzed_at: new Date().toISOString(),
  };

  if (supabase && !isDemoSession) {
    await supabase.from("deal_analysis").upsert({
      deal_id: body.dealId,
      executive_summary: fullAnalysis.executive_summary,
      team_score: fullAnalysis.team_score.score,
      team_reasoning: fullAnalysis.team_score.reasoning,
      market_score: fullAnalysis.market_score.score,
      market_reasoning: fullAnalysis.market_score.reasoning,
      traction_score: fullAnalysis.traction_score.score,
      traction_reasoning: fullAnalysis.traction_score.reasoning,
      business_model_score: fullAnalysis.business_model_score.score,
      business_model_reasoning: fullAnalysis.business_model_score.reasoning,
      overall_risk_score: fullAnalysis.overall_risk_score,
      strengths: fullAnalysis.strengths,
      red_flags: fullAnalysis.red_flags,
      missing_info: fullAnalysis.missing_info,
      recommendation: fullAnalysis.recommendation.verdict,
      recommendation_rationale: fullAnalysis.recommendation.rationale,
      thesis_fit_score: fullAnalysis.thesis_fit_score,
      thesis_fit_reason: fullAnalysis.thesis_fit_reason,
      web_context: fullAnalysis.web_context,
      raw_json: fullAnalysis,
    });

    await supabase.rpc("increment_analysis_usage");
  }

  return NextResponse.json(fullAnalysis);
}
