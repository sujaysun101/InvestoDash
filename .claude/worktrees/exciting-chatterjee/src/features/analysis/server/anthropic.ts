import { z } from "zod";

import { DealAnalysis } from "@/lib/types";

const scoreSchema = z.object({
  score: z.number().min(1).max(10),
  reasoning: z.string(),
});

const analysisSchema = z.object({
  executive_summary: z.string(),
  team_score: scoreSchema,
  market_score: scoreSchema,
  traction_score: scoreSchema,
  business_model_score: scoreSchema,
  overall_risk_score: z.number().min(1).max(10),
  strengths: z.array(z.string()).length(3),
  red_flags: z.array(z.string()).length(3),
  missing_info: z.array(z.string()).min(3),
  recommendation: z.object({
    verdict: z.enum(["PASS", "EXPLORE", "STRONG_YES"]),
    rationale: z.string(),
  }),
});

export async function runAnthropicAnalysis(text: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
      max_tokens: 1400,
      system:
        'You are a senior angel investor conducting first-pass due diligence. Analyze this pitch deck and return a JSON object with these exact keys: executive_summary (2 sentences), team_score (1-10 with reasoning), market_score (1-10 with reasoning), traction_score (1-10 with reasoning), business_model_score (1-10 with reasoning), overall_risk_score (1-10, where 1=lowest risk), strengths (array of 3 strings), red_flags (array of 3 strings), missing_info (array of items the deck did not address but should have), recommendation (one of: PASS / EXPLORE / STRONG_YES, with 1-sentence rationale). Return only valid JSON, no markdown.',
      messages: [
        {
          role: "user",
          content: `Pitch deck text:\n${text}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Anthropic analysis failed.");
  }

  const json = await response.json();
  const rawText = json.content?.[0]?.text ?? "";
  const parsed = JSON.parse(rawText);

  return analysisSchema.parse(normalizeAnalysis(parsed));
}

export function buildAnalysisFromHeuristics(
  companyName: string,
  text: string,
): Omit<
  DealAnalysis,
  "thesis_fit_score" | "thesis_fit_reason" | "web_context" | "analyzed_at"
> {
  const lower = text.toLowerCase();
  const score = (value: number, reasoning: string) => ({ score: value, reasoning });

  const hasRevenue = /(arr|revenue|customers|growth)/.test(lower);
  const hasMarket = /(market|tam|gtm|buyer|segment)/.test(lower);
  const hasTeam = /(founder|team|operator|experience)/.test(lower);
  const hasMoat = /(moat|defensib|advantage|network effect)/.test(lower);

  return {
    executive_summary: `${companyName} presents a coherent early-stage story with clear ambition and credible signals across several core diligence areas. The deck still leaves unanswered questions around risk concentration and evidence depth.`,
    team_score: score(
      hasTeam ? 8 : 6,
      hasTeam
        ? "The deck communicates relevant operator credibility and domain fit."
        : "The team section is thin and needs more evidence of execution history.",
    ),
    market_score: score(
      hasMarket ? 8 : 6,
      hasMarket
        ? "Market framing and customer segmentation are present and directionally convincing."
        : "The deck gestures at market size but needs sharper customer definition.",
    ),
    traction_score: score(
      hasRevenue ? 7 : 5,
      hasRevenue
        ? "The deck includes proof points that suggest some commercial pull."
        : "Traction is mostly narrative and needs harder operating metrics.",
    ),
    business_model_score: score(
      hasMoat ? 7 : 6,
      hasMoat
        ? "The monetization path and product edge are outlined with reasonable clarity."
        : "Business model logic exists but lacks detail on durability and margins.",
    ),
    overall_risk_score: hasRevenue && hasTeam ? 4 : 6,
    strengths: [
      "Concise articulation of the problem and product positioning.",
      "Clear enough signal to support a first-pass partner discussion.",
      "Good foundation for a follow-up diligence call.",
    ],
    red_flags: [
      "Several key claims lack cited operating metrics.",
      "Competitive differentiation could be stronger.",
      "Customer concentration and capital efficiency are not fully addressed.",
    ],
    missing_info: [
      "Detailed revenue quality or retention data.",
      "Specific founder track record and prior outcomes.",
      "Competitive landscape with explicit alternatives.",
    ],
    recommendation: {
      verdict: hasRevenue || hasTeam ? "EXPLORE" : "PASS",
      rationale: hasRevenue || hasTeam
        ? "There is enough signal to justify a follow-up conversation."
        : "The deck does not yet establish enough evidence to move forward.",
    },
  };
}

function normalizeAnalysis(parsed: Record<string, unknown>) {
  const recommendation = parsed.recommendation as
    | { verdict?: string; rationale?: string }
    | string;

  return {
    ...parsed,
    recommendation:
      typeof recommendation === "string"
        ? {
            verdict: recommendation,
            rationale: "Recommendation returned without rationale.",
          }
        : {
            verdict: recommendation.verdict,
            rationale: recommendation.rationale,
          },
  };
}
