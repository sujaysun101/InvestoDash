import { NextResponse } from "next/server";
import OpenAI from "openai";

import { ANALYSIS_PAYWALL_ENABLED } from "@/lib/constants";
import { prepareDeckMaterial } from "@/lib/ingest/deck-material";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ThesisProfile } from "@/lib/types";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Prompt helpers
// ---------------------------------------------------------------------------

const JSON_SCHEMA_INSTRUCTION = `Return ONLY a valid JSON object with exactly these keys:

{
  "recommendation": "INVEST" | "EXPLORE" | "PASS",
  "recommendation_rationale": string (2-3 sentence rationale for the verdict),
  "executive_summary": string (3-5 sentence overview for a VC memo),
  "team_score": integer 1-10,
  "team_reasoning": string (2-3 sentences on founding team quality),
  "market_score": integer 1-10,
  "market_reasoning": string (2-3 sentences on market size and timing),
  "traction_score": integer 1-10,
  "traction_reasoning": string (2-3 sentences on revenue, growth, and customer proof),
  "business_model_score": integer 1-10,
  "business_model_reasoning": string (2-3 sentences on monetization and unit economics),
  "risk_score": integer 1-10 where 1 = very low risk, 10 = very high risk,
  "strengths": string[] (3-5 notable strengths as concise bullet strings),
  "red_flags": string[] (2-4 risks or red flags as concise bullet strings),
  "missing_info": string[] (2-3 things missing from the deck that would help diligence),
  "thesis_fit_score": integer 1-10 (how well this matches the investor thesis provided),
  "thesis_fit_reason": string (1-2 sentences explaining thesis alignment or mismatch),
  "ai_summary": string (same as executive_summary, used for legacy display),
  "ai_team_notes": string (same as team_reasoning),
  "ai_market_notes": string (same as market_reasoning),
  "ai_risk_notes": string (one-line risk summary)
}

Do NOT include any text outside of the JSON object.`;

function buildThesisContext(thesis: ThesisProfile | null): string {
  if (!thesis) return "No investor thesis provided — score thesis fit as 5/10 by default.";
  const parts: string[] = [];
  if (thesis.sectors?.length) parts.push(`Preferred sectors: ${thesis.sectors.join(", ")}`);
  if (thesis.target_stage?.length) parts.push(`Target stages: ${thesis.target_stage.join(", ")}`);
  if (thesis.check_size_range) parts.push(`Check size: ${thesis.check_size_range}`);
  if (thesis.geography_preference) parts.push(`Geography: ${thesis.geography_preference}`);
  if (thesis.custom_note) parts.push(`Investor notes: ${thesis.custom_note}`);
  return parts.join(". ");
}

function textUserPrompt(
  companyName: string,
  sector: string,
  deckText: string,
  thesisContext: string,
) {
  return `You are an experienced angel investor and venture analyst performing structured first-pass diligence.

Company: ${companyName}
Sector: ${sector}
Investor thesis: ${thesisContext}

Analyze the following pitch deck and provide a rigorous, honest assessment.
${JSON_SCHEMA_INSTRUCTION}

PITCH DECK CONTENT:
${deckText}`;
}

function visionUserPrompt(companyName: string, sector: string, thesisContext: string) {
  return `You are an experienced angel investor performing structured first-pass diligence.

Company: ${companyName}
Sector: ${sector}
Investor thesis: ${thesisContext}

The user attached an image (slide, screenshot, or scan). Carefully read all visible text, charts, numbers, and visual cues.
${JSON_SCHEMA_INSTRUCTION}`;
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n...[truncated for length]`;
}

function clamp(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) {
    return Math.min(10, Math.max(1, Math.round(v)));
  }
  return null;
}

function safeStr(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  return fallback;
}

function safeStrArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const dealId = formData.get("deal_id") as string | null;
  const companyName = (formData.get("company_name") as string) || "Unknown";
  const sector = (formData.get("sector") as string) || "";

  if (!file || !dealId) {
    return NextResponse.json({ error: "file and deal_id are required" }, { status: 400 });
  }

  // Mark deal as analyzing
  await supabase
    .from("deals")
    .update({ analysis_status: "analyzing", updated_at: new Date().toISOString() })
    .eq("id", dealId)
    .eq("user_id", user.id);

  // Load investor thesis for context-aware scoring
  let thesis: ThesisProfile | null = null;
  try {
    const { data: thesisRow } = await supabase
      .from("thesis")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (thesisRow) {
      thesis = {
        sectors: (thesisRow as { sectors: string[] }).sectors ?? [],
        check_size_range: (thesisRow as { check_size_range?: string }).check_size_range ?? "",
        target_stage: (thesisRow as { target_stage?: string[] }).target_stage ?? [],
        geography_preference:
          (thesisRow as { geography_preference?: string }).geography_preference ?? "",
        custom_note: (thesisRow as { custom_note?: string | null }).custom_note ?? "",
      };
    }
  } catch {
    /* non-fatal — proceed without thesis */
  }

  const thesisContext = buildThesisContext(thesis);

  // Parse file into AI-ready material
  let material: Awaited<ReturnType<typeof prepareDeckMaterial>>;
  try {
    material = await prepareDeckMaterial(file);
  } catch (e) {
    await supabase
      .from("deals")
      .update({ analysis_status: "error", updated_at: new Date().toISOString() })
      .eq("id", dealId)
      .eq("user_id", user.id);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not read file" },
      { status: 400 },
    );
  }

  const provider = process.env.AI_PROVIDER ?? "openai";
  const apiKey = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;

  if (!apiKey || provider !== "openai") {
    await supabase
      .from("deals")
      .update({ analysis_status: "error", updated_at: new Date().toISOString() })
      .eq("id", dealId)
      .eq("user_id", user.id);
    return NextResponse.json(
      { error: "Configure AI_PROVIDER=openai and AI_API_KEY to run analysis." },
      { status: 503 },
    );
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";

  let completion;
  try {
    if (material.kind === "vision") {
      completion = await openai.chat.completions.create({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: visionUserPrompt(companyName, sector, thesisContext),
              },
              {
                type: "image_url",
                image_url: { url: `data:${material.mime};base64,${material.base64}` },
              },
            ],
          },
        ],
      });
    } else {
      const deckText = truncate(material.text.trim(), 14_000);
      if (deckText.length < 20) {
        await supabase
          .from("deals")
          .update({ analysis_status: "error", updated_at: new Date().toISOString() })
          .eq("id", dealId)
          .eq("user_id", user.id);
        return NextResponse.json(
          { error: "Not enough text extracted from this file to analyze." },
          { status: 400 },
        );
      }
      completion = await openai.chat.completions.create({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: textUserPrompt(companyName, sector, deckText, thesisContext),
          },
        ],
      });
    }
  } catch (e) {
    await supabase
      .from("deals")
      .update({ analysis_status: "error", updated_at: new Date().toISOString() })
      .eq("id", dealId)
      .eq("user_id", user.id);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI analysis failed" },
      { status: 502 },
    );
  }

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    await supabase
      .from("deals")
      .update({ analysis_status: "error", updated_at: new Date().toISOString() })
      .eq("id", dealId)
      .eq("user_id", user.id);
    return NextResponse.json({ error: "Invalid AI response format" }, { status: 502 });
  }

  // Extract and validate all fields
  const teamScore = clamp(parsed.team_score) ?? 5;
  const marketScore = clamp(parsed.market_score) ?? 5;
  const tractionScore = clamp(parsed.traction_score) ?? 5;
  const bizScore = clamp(parsed.business_model_score) ?? 5;
  const riskScore = clamp(parsed.risk_score) ?? 5;
  const thesisFitScore = clamp(parsed.thesis_fit_score) ?? 5;
  const fitScore = thesisFitScore; // unified

  const recommendation = safeStr(parsed.recommendation, "EXPLORE").toUpperCase();
  const recommendationRationale = safeStr(parsed.recommendation_rationale);
  const execSummary = safeStr(parsed.executive_summary) || safeStr(parsed.ai_summary);
  const teamReasoning = safeStr(parsed.team_reasoning) || safeStr(parsed.ai_team_notes);
  const marketReasoning = safeStr(parsed.market_reasoning) || safeStr(parsed.ai_market_notes);
  const tractionReasoning = safeStr(parsed.traction_reasoning);
  const bizReasoning = safeStr(parsed.business_model_reasoning);
  const strengths = safeStrArr(parsed.strengths);
  const redFlags = safeStrArr(parsed.red_flags);
  const missingInfo = safeStrArr(parsed.missing_info);
  const thesisFitReason = safeStr(parsed.thesis_fit_reason);
  const aiSummary = execSummary;
  const aiTeamNotes = teamReasoning;
  const aiMarketNotes = marketReasoning;
  const aiRiskNotes = safeStr(parsed.ai_risk_notes) || redFlags.join("; ");

  const now = new Date().toISOString();

  // 1. Update flat columns on deals table (fast lookup / backward compat)
  await supabase
    .from("deals")
    .update({
      recommendation,
      team_score: teamScore,
      market_score: marketScore,
      traction_score: tractionScore,
      business_model_score: bizScore,
      risk_score: riskScore,
      thesis_fit: thesisFitScore,
      fit_score: fitScore,
      ai_summary: aiSummary,
      ai_team_notes: aiTeamNotes,
      ai_market_notes: aiMarketNotes,
      ai_risk_notes: aiRiskNotes,
      analysis_status: "complete",
      updated_at: now,
    })
    .eq("id", dealId)
    .eq("user_id", user.id);

  // 2. Upsert into deal_analysis for rich structured data
  await supabase.from("deal_analysis").upsert(
    {
      deal_id: dealId,
      executive_summary: execSummary || "Analysis complete.",
      team_score: teamScore,
      team_reasoning: teamReasoning || "See AI notes.",
      market_score: marketScore,
      market_reasoning: marketReasoning || "See AI notes.",
      traction_score: tractionScore,
      traction_reasoning: tractionReasoning || "See AI notes.",
      business_model_score: bizScore,
      business_model_reasoning: bizReasoning || "See AI notes.",
      overall_risk_score: riskScore,
      strengths,
      red_flags: redFlags,
      missing_info: missingInfo,
      recommendation,
      recommendation_rationale: recommendationRationale || execSummary || "",
      thesis_fit_score: thesisFitScore,
      thesis_fit_reason: thesisFitReason || "Based on stated investment thesis.",
      web_context: "",
      raw_json: parsed,
      updated_at: now,
    },
    { onConflict: "deal_id" },
  );

  // 3. Log activity
  await supabase.from("deal_activity").insert({
    deal_id: dealId,
    title: "AI analysis completed",
    note: `Diligence scores saved — fit ${fitScore}/10, risk ${riskScore}/10, verdict: ${recommendation}.`,
    user_id: user.id,
    activity_type: "analysis_run",
  });

  // 4. Create notification
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "analysis_complete",
    title: "Analysis complete",
    message: `${companyName} — fit ${fitScore}/10, verdict: ${recommendation}`,
    deal_id: dealId,
    read: false,
  });

  if (ANALYSIS_PAYWALL_ENABLED) {
    await supabas