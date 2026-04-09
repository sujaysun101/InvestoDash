import { NextResponse } from "next/server";

import { loadDealById } from "@/lib/data";
import { formatDate } from "@/lib/format-date";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const deal = await loadDealById(params.id);

  if (!deal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const lines = [
    `INVESTMENT MEMO — ${deal.company_name}`,
    `Generated: ${formatDate(new Date().toISOString())}`,
    "",
    `RECOMMENDATION: ${deal.analysis?.recommendation.verdict ?? "N/A"}`,
    "",
    "SCORES",
    `Thesis Fit: ${deal.analysis?.thesis_fit_score ?? "—"}/10   Risk: ${deal.analysis?.overall_risk_score ?? "—"}/10`,
    `Team: ${deal.analysis?.team_score.score ?? "—"}   Market: ${deal.analysis?.market_score.score ?? "—"}`,
    `Traction: ${deal.analysis?.traction_score.score ?? "—"}   Biz Model: ${deal.analysis?.business_model_score.score ?? "—"}`,
    "",
    "AI SUMMARY",
    deal.analysis?.executive_summary ?? "",
    "",
    "TEAM",
    deal.analysis?.team_score.reasoning ?? "",
    "",
    "MARKET",
    deal.analysis?.market_score.reasoning ?? "",
    "",
    "KEY RISKS",
    (deal.analysis?.red_flags ?? []).join("; "),
    "",
    "INVESTOR NOTES",
    deal.memo ?? deal.notes_html ?? "",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${deal.company_name.replace(/\s+/g, "-")}-memo.txt"`,
    },
  });
}
