"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisPanel } from "@/features/analysis/components/analysis-panel";
import { DownloadReportButton } from "@/features/analysis/components/download-report-button";
import { Deal, DealAnalysis, ThesisProfile } from "@/lib/types";

export function RunAnalysisCard({
  deal,
  initialAnalysis,
  parsedDeckText,
  thesis,
  usageRemaining,
}: {
  deal: Deal;
  initialAnalysis: DealAnalysis | null;
  parsedDeckText: string;
  thesis: ThesisProfile | null;
  usageRemaining: number;
}) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(initialAnalysis);
  const [showPaywall, setShowPaywall] = useState(false);

  const disabledReason = useMemo(() => {
    if (!parsedDeckText) return "Upload a deck first.";
    if (!thesis) return "Complete the thesis profile first.";
    return null;
  }, [parsedDeckText, thesis]);

  async function runAnalysis() {
    if (!thesis || !parsedDeckText) {
      toast.error(disabledReason ?? "Deck and thesis are required.");
      return;
    }

    if (usageRemaining <= 0) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealId: deal.id,
          companyName: deal.company_name,
          founderName: deal.founder_name,
          extractedText: parsedDeckText,
          thesis,
        }),
      });

      const payload = (await response.json()) as DealAnalysis | { error?: string };

      if (!response.ok) {
        const apiError =
          "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Analysis request failed.";
        throw new Error(apiError);
      }

      const json = payload as DealAnalysis;
      setAnalysis(json);
      toast.success("Analysis complete.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not analyze deck.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-sm font-medium">AI analysis engine</p>
            <p className="text-sm text-muted-foreground">
              Claude Sonnet handles structured diligence, thesis fit, and web
              context generation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={loading || Boolean(disabledReason)}
              onClick={runAnalysis}
            >
              {loading ? "Running analysis..." : "Run Analysis"}
            </Button>
            {analysis ? <DownloadReportButton analysis={analysis} deal={deal} /> : null}
          </div>
        </CardContent>
      </Card>

      {showPaywall ? (
        <Card className="border-primary/30 bg-primary/8">
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                You&apos;ve used your 3 free analyses.
              </p>
              <p className="text-sm text-muted-foreground">
                Subscribe to unlock unlimited deal flow — $49/month.
              </p>
            </div>
            <Button onClick={() => setShowPaywall(false)} variant="outline">
              Dismiss
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {analysis ? <AnalysisPanel analysis={analysis} /> : null}
    </div>
  );
}
