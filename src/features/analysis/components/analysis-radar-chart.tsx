"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { DealAnalysis } from "@/lib/types";

export function AnalysisRadarChart({ analysis }: { analysis: DealAnalysis }) {
  const data = [
    { metric: "Team", score: analysis.team_score.score },
    { metric: "Market", score: analysis.market_score.score },
    { metric: "Traction", score: analysis.traction_score.score },
    { metric: "Model", score: analysis.business_model_score.score },
  ];

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.12)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "rgba(255,255,255,0.72)", fontSize: 12 }}
          />
          <Radar
            dataKey="score"
            fill="rgba(116, 227, 183, 0.28)"
            fillOpacity={1}
            stroke="rgba(116, 227, 183, 1)"
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
