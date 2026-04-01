"use client";

import { jsPDF } from "jspdf";

import { Button } from "@/components/ui/button";
import { Deal, DealAnalysis } from "@/lib/types";

export function DownloadReportButton({
  analysis,
  deal,
}: {
  analysis: DealAnalysis;
  deal: Deal;
}) {
  function download() {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text(`${deal.company_name} - Deal Report`, 16, 20);

    doc.setFontSize(11);
    doc.text(`Stage: ${deal.stage}`, 16, 32);
    doc.text(`Sector: ${deal.sector}`, 72, 32);
    doc.text(`Risk: ${analysis.overall_risk_score}/10`, 130, 32);
    doc.text(`Thesis fit: ${analysis.thesis_fit_score}/10`, 16, 40);
    doc.text(`Recommendation: ${analysis.recommendation.verdict}`, 72, 40);

    doc.setFontSize(14);
    doc.text("Executive summary", 16, 56);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(analysis.executive_summary, 178), 16, 64);

    doc.setFontSize(14);
    doc.text("Scores", 16, 88);
    doc.setFontSize(11);
    doc.text(
      [
        `Team: ${analysis.team_score.score}/10 - ${analysis.team_score.reasoning}`,
        `Market: ${analysis.market_score.score}/10 - ${analysis.market_score.reasoning}`,
        `Traction: ${analysis.traction_score.score}/10 - ${analysis.traction_score.reasoning}`,
        `Business model: ${analysis.business_model_score.score}/10 - ${analysis.business_model_score.reasoning}`,
      ],
      16,
      96,
    );

    doc.addPage();
    doc.setFontSize(14);
    doc.text("Strengths", 16, 20);
    doc.setFontSize(11);
    doc.text(
      doc.splitTextToSize(
        analysis.strengths.map((item) => `• ${item}`).join("\n"),
        178,
      ),
      16,
      28,
    );

    doc.setFontSize(14);
    doc.text("Red flags", 16, 76);
    doc.setFontSize(11);
    doc.text(
      doc.splitTextToSize(
        analysis.red_flags.map((item) => `• ${item}`).join("\n"),
        178,
      ),
      16,
      84,
    );

    doc.setFontSize(14);
    doc.text("Missing info", 16, 132);
    doc.setFontSize(11);
    doc.text(
      doc.splitTextToSize(
        analysis.missing_info.map((item) => `• ${item}`).join("\n"),
        178,
      ),
      16,
      140,
    );

    doc.setFontSize(14);
    doc.text("Thesis fit + web research", 16, 188);
    doc.setFontSize(11);
    doc.text(
      doc.splitTextToSize(
        `${analysis.thesis_fit_reason} ${analysis.web_context}`,
        178,
      ),
      16,
      196,
    );

    doc.save(`${deal.company_name.toLowerCase().replace(/\s+/g, "-")}-report.pdf`);
  }

  return <Button onClick={download}>Download Report</Button>;
}
