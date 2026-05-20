import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildAnalysisFromHeuristics,
  runAnthropicAnalysis,
} from "@/features/analysis/server/anthropic";
import { buildThesisFit } from "@/features/analysis/server/thesis-fit";
import { buildWebResearchSummary } from "@/features/analysis/server/web-research";
import { MIN_DECK_TEXT_LENGTH } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ThesisProfile } from "@/lib/types";

const requestSchema = z.object({
  dealId: z.string(),
  companyName: z.string(),
  founderName: z.string().optional().default(""),
  extractedText: z.string().min(MIN_DECK_TEXT_LENGTH),
  thesis: z.custom<ThesisProfile>(),
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const deckErr = flat.fieldErrors.extractedText?.[0];
    return NextResponse.json(
      {
        error:
          deckErr ??
          "Invalid analysis request. Check company name, deck text, and thesis fields.",
        details: flat,
      },
      { status: 400 },
    );
  }

  const body = parsed.data;

  try {
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

    if (supabase) {
      const { error: upsertError } = await supabase.from("deal_analysis").upsert({
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

      if (upsertError) {
        console.error("deal_analysis upsert failed:", upsertError);
      }

      const { error: rpcError } = await supabase.rpc("increment_analysis_usage");
      if (rpcError) {
        console.error("increment_analysis_usage failed:", rpcError);
      }
    }

    return NextResponse.json(fullAnalysis);
  } catch (error) {
    console.error("Analysis pipeline error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Analysis failed unexpectedly.",
      },
      { status: 500 },
    );
  }
}
