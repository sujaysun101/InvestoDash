import { NextResponse } from "next/server";
import OpenAI from "openai";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function extractTextFromFile(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "";

  if (mime.includes("pdf") || file.name.toLowerCase().endsWith(".pdf")) {
    const mod = await import("pdf-parse");
    const pdfParse = (mod as { default?: unknown }).default ?? mod;
    const parsed = await (
      pdfParse as unknown as (b: Buffer) => Promise<{ text?: string }>
    )(buf);
    return parsed.text ?? "";
  }

  throw new Error("Only PDF decks are supported for server-side analysis. Convert PPTX to PDF.");
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n...[truncated]`;
}

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
  const companyName = (formData.get("company_name") as string) || "";
  const sector = (formData.get("sector") as string) || "";

  if (!file || !dealId) {
    return NextResponse.json(
      { error: "file and deal_id are required" },
      { status: 400 },
    );
  }

  await supabase
    .from("deals")
    .update({
      analysis_status: "analyzing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId)
    .eq("user_id", user.id);

  let deckText: string;
  try {
    deckText = await extractTextFromFile(file);
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

  deckText = truncate(deckText, 14_000);

  const provider = process.env.AI_PROVIDER ?? "openai";
  const apiKey = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;

  if (!apiKey || provider !== "openai") {
    await supabase
      .from("deals")
      .update({ analysis_status: "error", updated_at: new Date().toISOString() })
      .eq("id", dealId)
      .eq("user_id", user.id);
    return NextResponse.json(
      { error: "Configure AI_PROVIDER=openai and AI_API_KEY for analysis." },
      { status: 503 },
    );
  }

  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: `You are an experienced angel investor analyzing a pitch deck.
Company: ${companyName}. Sector: ${sector}.
Analyze the following pitch deck content and return ONLY a JSON object with keys:
recommendation ("INVEST"|"EXPLORE"|"PASS"),
team_score, market_score, traction_score, business_model_score, risk_score, thesis_fit, fit_score (integers 1-10; risk_score: 1=low risk, 10=high risk),
ai_summary, ai_team_notes, ai_market_notes, ai_risk_notes (strings).

Pitch deck content:
${deckText}`,
      },
    ],
  });

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
    return NextResponse.json({ error: "Invalid AI response" }, { status: 502 });
  }

  const num = (v: unknown) =>
    typeof v === "number" && !Number.isNaN(v) ? Math.min(10, Math.max(1, Math.round(v))) : null;

  const update = {
    recommendation: String(parsed.recommendation ?? "EXPLORE"),
    team_score: num(parsed.team_score),
    market_score: num(parsed.market_score),
    traction_score: num(parsed.traction_score),
    business_model_score: num(parsed.business_model_score),
    risk_score: num(parsed.risk_score),
    thesis_fit: num(parsed.thesis_fit),
    fit_score: num(parsed.fit_score),
    ai_summary: String(parsed.ai_summary ?? ""),
    ai_team_notes: String(parsed.ai_team_notes ?? ""),
    ai_market_notes: String(parsed.ai_market_notes ?? ""),
    ai_risk_notes: String(parsed.ai_risk_notes ?? ""),
    analysis_status: "complete" as const,
    updated_at: new Date().toISOString(),
  };

  await supabase.from("deals").update(update).eq("id", dealId).eq("user_id", user.id);

  await supabase.from("deal_activity").insert({
    deal_id: dealId,
    title: "AI analysis completed",
    note: "Automated diligence scores were saved to this deal.",
    user_id: user.id,
    activity_type: "analysis_run",
  });

  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "analysis_complete",
    title: "Analysis complete",
    message: `${companyName || "Deal"} analysis finished — Fit ${update.fit_score ?? "—"}`,
    deal_id: dealId,
    read: false,
  });

  await supabase.rpc("increment_analysis_usage");

  return NextResponse.json({ success: true, scores: update });
}
