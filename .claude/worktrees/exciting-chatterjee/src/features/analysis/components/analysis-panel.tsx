import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalysisRadarChart } from "@/features/analysis/components/analysis-radar-chart";
import { DealAnalysis } from "@/lib/types";

export function AnalysisPanel({ analysis }: { analysis: DealAnalysis }) {
  const recommendationVariant =
    analysis.recommendation.verdict === "STRONG_YES"
      ? "secondary"
      : analysis.recommendation.verdict === "PASS"
        ? "destructive"
        : "outline";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Analysis results</CardTitle>
              <CardDescription>{analysis.executive_summary}</CardDescription>
            </div>
            <Badge variant={recommendationVariant}>
              {analysis.recommendation.verdict}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <ScoreCell
            label="Team"
            reason={analysis.team_score.reasoning}
            score={analysis.team_score.score}
          />
          <ScoreCell
            label="Market"
            reason={analysis.market_score.reasoning}
            score={analysis.market_score.score}
          />
          <ScoreCell
            label="Traction"
            reason={analysis.traction_score.reasoning}
            score={analysis.traction_score.score}
          />
          <ScoreCell
            label="Business model"
            reason={analysis.business_model_score.reasoning}
            score={analysis.business_model_score.score}
          />
          <ScoreCell
            label="Overall risk"
            reason="1 is the lowest risk. Higher numbers indicate more diligence flags."
            score={analysis.overall_risk_score}
          />
          <ScoreCell
            label="Thesis fit"
            reason={analysis.thesis_fit_reason}
            score={analysis.thesis_fit_score}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Radar view</CardTitle>
            <CardDescription>
              See conviction across the four core diligence lenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalysisRadarChart analysis={analysis} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Strengths and risks</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <BulletList items={analysis.strengths} title="Strengths" />
            <BulletList items={analysis.red_flags} title="Red flags" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missing info</CardTitle>
            <CardDescription>{analysis.web_context}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {analysis.missing_info.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-border/60 bg-secondary/30 px-3 py-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScoreCell({
  label,
  score,
  reason,
}: {
  label: string;
  score: number;
  reason: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <Badge>{score}/10</Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{reason}</p>
    </div>
  );
}

function BulletList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{title}</p>
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-xl border border-border/60 bg-secondary/30 px-3 py-2"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
