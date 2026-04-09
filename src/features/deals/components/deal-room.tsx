"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AnalysisRadarChart } from "@/features/analysis/components/analysis-radar-chart";
import { PIPELINE_STAGES } from "@/lib/constants";
import { formatDate } from "@/lib/format-date";
import { createClient } from "@/lib/supabase/client";
import { Deal, PipelineStage, ThesisProfile, UsageCounter } from "@/lib/types";

export function DealRoom({
  deal,
  thesis,
  usage,
}: {
  deal: Deal;
  thesis: ThesisProfile | null;
  usage: UsageCounter;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [memo, setMemo] = useState(deal.memo ?? deal.notes_html ?? "");
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(deal.status);
  const [analysisStatus, setAnalysisStatus] = useState(deal.analysis_status ?? "pending");
  const [runningAi, setRunningAi] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMemo(deal.memo ?? deal.notes_html ?? "");
    setPipelineStage(deal.status);
    setAnalysisStatus(deal.analysis_status ?? "pending");
  }, [deal]);

  const saveMemo = useCallback(
    async (value: string) => {
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("deals")
        .update({
          memo: value,
          notes_html: value,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deal.id)
        .eq("user_id", user.id);
    },
    [deal.id, supabase],
  );

  function onMemoChange(value: string) {
    setMemo(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveMemo(value);
    }, 500);
  }

  async function onStageChange(next: PipelineStage) {
    const prev = pipelineStage;
    setPipelineStage(next);
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("deals")
      .update({
        status: next,
        updated_at: new Date().toISOString(),
      })
      .eq("id", deal.id)
      .eq("user_id", user.id);

    if (error) {
      toast.error(error.message);
      setPipelineStage(prev);
      return;
    }

    await supabase.from("deal_activity").insert({
      deal_id: deal.id,
      title: "Stage updated",
      note: `Moved from ${prev} to ${next}.`,
      user_id: user.id,
      activity_type: "stage_change",
    });

    router.refresh();
  }

  async function runAi(file: File) {
    if (usage.remaining <= 0) {
      toast.error("No analyses remaining on the free tier.");
      return;
    }
    setRunningAi(true);
    setAnalysisStatus("analyzing");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("deal_id", deal.id);
      formData.append("company_name", deal.company_name);
      formData.append("sector", deal.sector);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Analysis failed");
      }
      setAnalysisStatus("complete");
      toast.success("Analysis complete.");
      router.refresh();
    } catch (e) {
      setAnalysisStatus("error");
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setRunningAi(false);
    }
  }

  function exportMemo() {
    const w = window.open("", "_blank");
    if (!w) return;
    const html = `
      <!doctype html><html><head><title>Memo</title>
      <style>
        body { font-family: system-ui; padding: 32px; background: #0b0f16; color: #e8eef7; }
        h1 { font-size: 22px; }
        section { margin-top: 16px; }
      </style></head><body>
      <h1>INVESTMENT MEMO — ${deal.company_name}</h1>
      <p>Generated: ${formatDate(new Date().toISOString())}</p>
      <section><strong>RECOMMENDATION:</strong> ${deal.analysis?.recommendation.verdict ?? "N/A"}</section>
      <section><strong>AI SUMMARY</strong><br/>${deal.analysis?.executive_summary ?? ""}</section>
      <section><strong>INVESTOR NOTES</strong><br/>${memo}</section>
      <script>window.onload = () => window.print();</script>
      </body></html>`;
    w.document.write(html);
    w.document.close();
  }

  const showRunAi =
    analysisStatus === "pending" || analysisStatus === "error";

  return (
    <div className="flex flex-col gap-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void runAi(f);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Button asChild className="w-fit" variant="ghost">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Pipeline
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight">
                {deal.company_name}
              </h1>
              <Badge>{deal.sector}</Badge>
              <Badge variant="outline">{deal.stage}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Added {formatDate(deal.date_added)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Move stage</span>
            <Select
              value={pipelineStage}
              onValueChange={(v) => void onStageChange(v as PipelineStage)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Pipeline stage" />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showRunAi ? (
            <Button
              className="mt-6"
              disabled={runningAi}
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              {runningAi ? "Running AI…" : "Run AI"}
            </Button>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="outline" type="button" onClick={exportMemo}>
              Print memo
            </Button>
            <Button asChild variant="outline" type="button">
              <a href={`/api/export/${deal.id}`} download>
                Download .txt
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>AI scores</CardTitle>
            <CardDescription>Structured diligence lenses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.analysis ? (
              <>
                <AnalysisRadarChart analysis={deal.analysis} />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <ScoreLine label="Fit" value={deal.analysis.thesis_fit_score} />
                  <ScoreLine label="Risk" value={deal.analysis.overall_risk_score} />
                  <ScoreLine label="Team" value={deal.analysis.team_score.score} />
                  <ScoreLine label="Market" value={deal.analysis.market_score.score} />
                  <ScoreLine label="Traction" value={deal.analysis.traction_score.score} />
                  <ScoreLine
                    label="Biz model"
                    value={deal.analysis.business_model_score.score}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Run AI analysis to populate scores.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>AI summary</CardTitle>
                {deal.analysis ? (
                  <Badge>{deal.analysis.recommendation.verdict}</Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{deal.analysis?.executive_summary ?? "—"}</p>
              <div>
                <p className="font-medium text-foreground">Team notes</p>
                <p className="mt-1">{deal.analysis?.team_score.reasoning ?? "—"}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Market notes</p>
                <p className="mt-1">{deal.analysis?.market_score.reasoning ?? "—"}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Risk notes</p>
                <p className="mt-1">
                  {deal.analysis?.red_flags?.join("; ") || "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My memo</CardTitle>
              <CardDescription>Auto-saves as you type.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={memo}
                onChange={(e) => onMemoChange(e.target.value)}
                rows={8}
                className="min-h-[180px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity log</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {deal.activity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/60 bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.timestamp)}
                    </p>
                  </div>
                  <p className="mt-1 text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment thesis alignment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
              {thesis ? (
                <>
                  <p>Sectors: {thesis.sectors.join(", ")}</p>
                  <p>Stages: {thesis.target_stage.join(", ")}</p>
                  <p>Check size: {thesis.check_size_range}</p>
                  <p>Geo: {thesis.geography_preference}</p>
                </>
              ) : (
                <p>Complete the thesis profile to unlock fit scoring context.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
