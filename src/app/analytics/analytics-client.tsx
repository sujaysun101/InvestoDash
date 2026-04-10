"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  Layers,
  CheckCircle2,
  Clock,
  BarChart2,
  ArrowRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/lib/constants";
import { formatDate } from "@/lib/format-date";
import { Deal, PipelineStage } from "@/lib/types";

// ─── Colour palette ──────────────────────────────────────────────────────────
const STAGE_COLORS: Record<PipelineStage, string> = {
  Inbox: "#6366f1",
  Reviewing: "#3b82f6",
  Exploring: "#06b6d4",
  "Due Diligence": "#f59e0b",
  Passed: "#ef4444",
  Invested: "#10b981",
};

const SECTOR_COLORS = [
  "#6366f1", "#3b82f6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f97316",
];

const VERDICT_COLORS: Record<string, string> = {
  STRONG_YES: "#10b981",
  INVEST: "#10b981",
  EXPLORE: "#f59e0b",
  PASS: "#ef4444",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card className="rounded-2xl border-border/70">
      <CardContent className="flex items-start gap-4 pt-6">
        <div className={`rounded-xl border border-border/60 bg-secondary/30 p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-2 text-sm shadow-lg">
      {label ? <p className="mb-1 font-medium">{label}</p> : null}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AnalyticsClient({ deals }: { deals: Deal[] }) {
  // ── Derived data ────────────────────────────────────────────────────────
  const analyzedDeals = useMemo(
    () => deals.filter((d) => d.analysis !== null),
    [deals],
  );

  // Pipeline funnel
  const pipelineData = useMemo(
    () =>
      PIPELINE_STAGES.map((stage) => ({
        stage,
        count: deals.filter((d) => d.status === stage).length,
        fill: STAGE_COLORS[stage],
      })),
    [deals],
  );

  // Sector distribution
  const sectorData = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of deals) {
      map.set(d.sector, (map.get(d.sector) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, fill: SECTOR_COLORS[i % SECTOR_COLORS.length] }));
  }, [deals]);

  // Average scores by sector (only analysed deals)
  const scoresBySector = useMemo(() => {
    const map = new Map<
      string,
      { team: number[]; market: number[]; traction: number[]; fit: number[] }
    >();
    for (const d of analyzedDeals) {
      const a = d.analysis!;
      const entry = map.get(d.sector) ?? { team: [], market: [], traction: [], fit: [] };
      entry.team.push(a.team_score.score);
      entry.market.push(a.market_score.score);
      entry.traction.push(a.traction_score.score);
      const fit = d.fit_score ?? a.thesis_fit_score;
      if (fit) entry.fit.push(fit);
      map.set(d.sector, entry);
    }
    return Array.from(map.entries()).map(([sector, s]) => ({
      sector: sector.length > 10 ? sector.slice(0, 9) + "…" : sector,
      Team: avg(s.team),
      Market: avg(s.market),
      Traction: avg(s.traction),
      Fit: avg(s.fit),
    }));
  }, [analyzedDeals]);

  // Verdict breakdown
  const verdictData = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of analyzedDeals) {
      const v = d.analysis!.recommendation.verdict;
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
      fill: VERDICT_COLORS[name] ?? "#6b7280",
    }));
  }, [analyzedDeals]);

  // Fit score histogram
  const fitHistogram = useMemo(() => {
    const buckets = [
      { range: "1-3", count: 0 },
      { range: "4-5", count: 0 },
      { range: "6-7", count: 0 },
      { range: "8-9", count: 0 },
      { range: "10", count: 0 },
    ];
    for (const d of analyzedDeals) {
      const fit = d.fit_score ?? d.analysis?.thesis_fit_score ?? 0;
      if (fit <= 3) buckets[0].count++;
      else if (fit <= 5) buckets[1].count++;
      else if (fit <= 7) buckets[2].count++;
      else if (fit <= 9) buckets[3].count++;
      else buckets[4].count++;
    }
    return buckets;
  }, [analyzedDeals]);

  // Average score radar (overall portfolio)
  const portfolioRadar = useMemo(() => {
    if (analyzedDeals.length === 0) return [];
    return [
      { subject: "Team", value: avg(analyzedDeals.map((d) => d.analysis!.team_score.score)) },
      { subject: "Market", value: avg(analyzedDeals.map((d) => d.analysis!.market_score.score)) },
      {
        subject: "Traction",
        value: avg(analyzedDeals.map((d) => d.analysis!.traction_score.score)),
      },
      {
        subject: "Biz Model",
        value: avg(
          analyzedDeals.map((d) => d.analysis!.business_model_score.score),
        ),
      },
      {
        subject: "Thesis Fit",
        value: avg(
          analyzedDeals.map((d) => d.fit_score ?? d.analysis!.thesis_fit_score ?? 5),
        ),
      },
    ];
  }, [analyzedDeals]);

  // Top deals by composite score
  const topDeals = useMemo(() => {
    return analyzedDeals
      .map((d) => {
        const a = d.analysis!;
        const composite =
          (a.team_score.score +
            a.market_score.score +
            a.traction_score.score +
            a.business_model_score.score) /
          4;
        const fit = d.fit_score ?? a.thesis_fit_score ?? 5;
        return { deal: d, composite: Math.round(composite * 10) / 10, fit };
      })
      .sort((a, b) => b.fit - a.fit || b.composite - a.composite)
      .slice(0, 8);
  }, [analyzedDeals]);

  // Stage age: avg days per stage
  const stageAgeData = useMemo(
    () =>
      PIPELINE_STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.status === stage);
        const ages = stageDeals.map((d) => daysAgo(d.date_added));
        return {
          stage: stage.length > 9 ? stage.slice(0, 8) + "…" : stage,
          avgDays: avg(ages),
          count: stageDeals.length,
          fill: STAGE_COLORS[stage],
        };
      }),
    [deals],
  );

  // ── Summary stats ────────────────────────────────────────────────────────
  const investedCount = deals.filter((d) => d.status === "Invested").length;
  const avgFit =
    analyzedDeals.length > 0
      ? avg(
          analyzedDeals.map((d) => d.fit_score ?? d.analysis?.thesis_fit_score ?? 0),
        )
      : 0;
  const conversionRate =
    deals.length > 0 ? Math.round((investedCount / deals.length) * 100) : 0;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Portfolio analytics</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Pipeline Intelligence</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aggregated insights across your {deals.length} deal{deals.length !== 1 ? "s" : ""} —
          {analyzedDeals.length} analyzed.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Layers}
          label="Total deals"
          value={deals.length}
          sub={`${analyzedDeals.length} with AI analysis`}
          color="text-indigo-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg thesis fit"
          value={avgFit > 0 ? `${avgFit}/10` : "—"}
          sub="across analyzed deals"
          color="text-cyan-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Invested"
          value={investedCount}
          sub={`${conversionRate}% conversion rate`}
          color="text-emerald-400"
        />
        <StatCard
          icon={Clock}
          label="Avg deal age"
          value={
            deals.length > 0
              ? `${avg(deals.map((d) => daysAgo(d.date_added)))}d`
              : "—"
          }
          sub="days since added"
          color="text-amber-400"
        />
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline funnel */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-4 w-4 text-primary" />
              Pipeline Funnel
            </CardTitle>
            <CardDescription>Deals by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pipelineData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
                  tickFormatter={(v: string) => (v.length > 8 ? v.slice(0, 7) + "…" : v)}
                />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Deals" radius={[6, 6, 0, 0]}>
                  {pipelineData.map((entry) => (
                    <Cell key={entry.stage} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector distribution */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Sector Distribution</CardTitle>
            <CardDescription>Deals by category</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {sectorData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deals yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    label={false}
                    labelLine={false}
                  >
                    {sectorData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Fit score histogram */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Thesis Fit Distribution</CardTitle>
            <CardDescription>How well deals match your investment thesis</CardDescription>
          </CardHeader>
          <CardContent>
            {analyzedDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Run AI analysis on deals to see fit distribution.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={fitHistogram} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
                    label={{
                      value: "Fit score range",
                      position: "insideBottom",
                      offset: -2,
                      fontSize: 11,
                      fill: "rgba(255,255,255,0.4)",
                    }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Deals" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Portfolio radar */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Portfolio Average Scores</CardTitle>
            <CardDescription>Mean diligence scores across all analyzed deals</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {portfolioRadar.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No analyzed deals yet — upload decks to see the radar.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart cx="50%" cy="50%" outerRadius={85} data={portfolioRadar}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.55)" }}
                  />
                  <Radar
                    name="Portfolio avg"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                    dot={{ fill: "#6366f1", r: 3 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Scores by sector */}
        {scoresBySector.length > 0 ? (
          <Card className="rounded-2xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Average Scores by Sector</CardTitle>
              <CardDescription>Team, Market, Traction, and Thesis Fit per sector</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={scoresBySector} barCategoryGap="20%" barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="sector" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    formatter={(value) => (
                      <span style={{ color: "rgba(255,255,255,0.65)" }}>{value}</span>
                    )}
                  />
                  <Bar dataKey="Team" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Market" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Traction" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Fit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : null}

        {/* Stage age */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Deal Velocity</CardTitle>
            <CardDescription>Average days deals have been in each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stageAgeData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
                  label={{
                    value: "days",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                    fill: "rgba(255,255,255,0.4)",
                  }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="avgDays" name="Avg days" radius={[6, 6, 0, 0]}>
                  {stageAgeData.map((entry) => (
                    <Cell key={entry.stage} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Verdict breakdown */}
        {verdictData.length > 0 ? (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">AI Verdict Breakdown</CardTitle>
              <CardDescription>Distribution of AI recommendations across pipeline</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={verdictData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={3}
                  >
                    {verdictData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    formatter={(value) => (
                      <span style={{ color: "rgba(255,255,255,0.65)" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Top deals table */}
      {topDeals.length > 0 ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Top Deals by Thesis Fit</CardTitle>
            <CardDescription>Your highest-conviction opportunities ranked by fit score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="pb-3 text-left font-medium text-muted-foreground">#</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Company</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Sector</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Stage</th>
                    <th className="pb-3 text-center font-medium text-muted-foreground">Fit</th>
                    <th className="pb-3 text-center font-medium text-muted-foreground">Composite</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Verdict</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Added</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody>
                  {topDeals.map(({ deal, composite, fit }, i) => {
                    const verdict = deal.analysis?.recommendation.verdict ?? "—";
                    const verdictColor =
                      verdict === "STRONG_YES"
                        ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/30"
                        : verdict === "EXPLORE"
                          ? "bg-amber-400/15 text-amber-300 border-amber-400/30"
                          : "bg-rose-400/15 text-rose-300 border-rose-400/30";
                    return (
                      <tr
                        key={deal.id}
                        className="border-b border-border/30 transition-colors hover:bg-secondary/20"
                      >
                        <td className="py-3 pr-3 text-muted-foreground">{i + 1}</td>
                        <td className="py-3 pr-4 font-medium">{deal.company_name}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className="text-xs">
                            {deal.sector}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{deal.status}</td>
                        <td className="py-3 pr-4 text-center">
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                            {fit}/10
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-center font-mono text-xs text-muted-foreground">
                          {composite}/10
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${verdictColor}`}
                          >
                            {verdict}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">
                          {formatDate(deal.date_added)}
                        </td>
                        <td className="py-3">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            View <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Empty state */}
      {deals.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16