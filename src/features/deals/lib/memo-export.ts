import { formatDate } from "@/lib/format-date";
import { Deal } from "@/lib/types";

/**
 * Builds a printable HTML memo for the given deal.
 * Kept in a plain .ts file to avoid TSX parser issues with HTML closing tags
 * inside template literals.
 */
export function buildMemoHtml(deal: Deal, memo: string): string {
  const a = deal.analysis;
  const cl = "<" + "/"; // avoids </tag> confusing the TSX parser in the caller

  const liTag = (text: string) => "<li>" + text + cl + "li>";
  const strengths = a?.strengths?.map(liTag).join("") ?? "";
  const redFlags = a?.red_flags?.map(liTag).join("") ?? "";
  const missingInfo = a?.missing_info?.map(liTag).join("") ?? "";

  function row(label: string, value: string, note: string) {
    const td = (s: string, extra = "") =>
      `<td style="padding:6px 12px;border:1px solid #334155${extra}">${s}${cl}td>`;
    return "<tr>" + td(label) + td(value) + td(note, ";color:#94a3b8") + cl + "tr>";
  }

  const scores = a
    ? [
        "<table style=\"border-collapse:collapse;width:100%;margin-top:8px\">",
        row("Team", `${a.team_score.score}/10`, a.team_score.reasoning),
        row("Market", `${a.market_score.score}/10`, a.market_score.reasoning),
        row("Traction", `${a.traction_score.score}/10`, a.traction_score.reasoning),
        row("Business model", `${a.business_model_score.score}/10`, a.business_model_score.reasoning),
        row("Risk", `${a.overall_risk_score}/10`, ""),
        row("Thesis fit", `${a.thesis_fit_score}/10`, a.thesis_fit_reason ?? ""),
        cl + "table>",
      ].join("\n")
    : "<p>No analysis data." + cl + "p>";

  const verdictBadge = a
    ? `<span class="verdict">${a.recommendation.verdict}${cl}span>`
    : "";

  const strengthsSection = strengths
    ? `<h2>Strengths${cl}h2><ul>${strengths}${cl}ul>`
    : "";
  const redFlagsSection = redFlags
    ? `<h2>Red Flags${cl}h2><ul>${redFlags}${cl}ul>`
    : "";
  const missingSection = missingInfo
    ? `<h2>Missing Information${cl}h2><ul>${missingInfo}${cl}ul>`
    : "";

  const founderMeta = deal.founder_name ? ` · Founder: ${deal.founder_name}` : "";
  const generated = formatDate(new Date().toISOString());

  return (
    "<!doctype html>" +
    "<html>" +
    "<head>" +
    `<title>Investment Memo — ${deal.company_name}${cl}title>` +
    "<style>" +
    "body{font-family:system-ui,-apple-system,sans-serif;padding:40px;max-width:900px;margin:0 auto;background:#0f1623;color:#e2e8f0}" +
    "h1{font-size:28px;font-weight:700;margin-bottom:4px}" +
    "h2{font-size:15px;font-weight:600;color:#60a5fa;text-transform:uppercase;letter-spacing:.1em;margin-top:28px;margin-bottom:8px}" +
    ".meta{color:#64748b;font-size:13px;margin-bottom:24px}" +
    ".verdict{display:inline-block;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;background:rgba(16,185,129,.15);color:#34d399;border:1px solid rgba(16,185,129,.3)}" +
    ".summary{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:16px;font-size:14px;line-height:1.7}" +
    "ul{margin:0;padding:0 0 0 18px}" +
    "li{margin:4px 0;font-size:14px;color:#cbd5e1}" +
    ".memo-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;font-size:14px;line-height:1.8;white-space:pre-wrap}" +
    "@media print{body{background:white;color:black}}" +
    cl + "style>" +
    cl + "head>" +
    "<body>" +
    `<h1>Investment Memo — ${deal.company_name}${cl}h1>` +
    `<p class="meta">Sector: ${deal.sector} · Stage: ${deal.stage}${founderMeta} · Generated: ${generated}${cl}p>` +
    verdictBadge +
    `<h2>AI Summary${cl}h2>` +
    `<div class="summary">${a?.executive_summary ?? "No analysis available."}${cl}div>` +
    `<h2>Diligence Scores${cl}h2>` +
    scores +
    strengthsSection +
    redFlagsSection +
    missingSection +
    `<h2>Investor Notes${cl}h2>` +
    `<div class="memo-box">${memo || "(No notes added)"}${cl}div>` +
    "<script>window.onloa