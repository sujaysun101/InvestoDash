"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { buildMemoHtml } from "@/features/deals/lib/memo-export";

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
import {
  ANALYSIS_PAYWALL_ENABLED,
  PITCH_FILE_ACCEPT,
  PIPELINE_STAGES,
} from "@/lib/constants";
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
    if (ANALYSIS_PAYWALL_ENABLED && usage.remaining <= 0) {
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
    const html = buildMemoHtml(deal, memo);
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
        accept={PITCH_FILE_ACCEPT}
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
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {deal.founder_name ? (
                <span>Founder: <span className="text-foreground">{deal.founder_name}</span></span>
              ) : null}
              {deal.website_url ? (
                <a
                  href={deal.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Website <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
              <span>Added {formatDate(deal.date_added)}</span>
            </div>
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
                  <Badge
                    className={
                      deal.analysis.recommendation.verdict === "STRONG_YES"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : deal.analysis.recommendation.verdict === "PASS"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }
                    variant="outline"
                  >
                    {deal.analysis.recommendation.verdict}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{deal.analysis?.executive_summary ?? "—"}</p>
              <div>
                <p className="font-medium text-foreground">Team</p>
                <p className="mt-1">{deal.analysis?.team_score.reasoning ?? "—"}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Market</p>
                <p className="mt-1">{deal.analysis?.market_score.reasoning ?? "—"}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Traction</p>
                <p className="mt-1">{deal.analysis?.traction_score.reasoning ?? "—"}</p>
              </div>
              {deal.analysis?.strengths && deal.analysis.strengths.length > 0 ? (
                <div>
                  <p className="font-medium text-emerald-400">Strengths</p>
                  <ul className="mt-1 space-y-1">
                    {deal.analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {deal.analysis?.red_flags && deal.analysis.red_flags.length > 0 ? (
                <div>
                  <p className="font-medium text-rose-400">Red flags</p>
                  <ul className="mt-1 space-y-1">
                    {deal.analysis.red_flags.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {deal.analysis?.missing_info && deal.analysis.missing_info.length > 0 ? (
                <div>
                  <p className="font-medium text-amber-400">Missing info</p>
                  <ul className="mt-1 space-y-1">
                    {deal.analysis.missing_info.map((m, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
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
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Thesis alignment</CardTitle>
                {deal.analysis?.thesis_fit_score ? (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {deal.analysis.thesis_fit_score}/10
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
              {deal.analysis?.thesis_fit_reason ? (
                <p className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-foreground">
                  {deal.analysis.thesis_fit_reason}
                </p>
              ) : null}
              {thesis ? (
                <>
                  <p>Sectors: {thesis.sectors.join(", ")}</p>
                  <p>Stages: {thesis.target_stage.join(", ")}</p>
                  <p>Check size: {thesis.check_size_range}</p>
                  <p>Geo: {thesis.geography_preference}</p>
                </>
              ) : (
                <p>Complete the thesis profile to unlock contextual fit scoring.</p>
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
