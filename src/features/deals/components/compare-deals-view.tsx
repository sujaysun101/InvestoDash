"use client";

import { useMemo, useState } from "react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Deal } from "@/lib/types";

export function CompareDealsView({ deals }: { deals: Deal[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    deals.slice(0, 2).map((deal) => deal.id),
  );

  const selectedDeals = useMemo(
    () => deals.filter((deal) => selectedIds.includes(deal.id)).slice(0, 4),
    [deals, selectedIds],
  );

  function toggleDeal(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 4
          ? [...current, id]
          : [...current.slice(1), id],
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Compare view
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Select 2 to 4 deals for side-by-side scoring.
        </h1>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Pick deals</CardTitle>
          <CardDescription>
            Compare diligence scores, recommendation, risk, and thesis fit.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {deals.map((deal) => (
            <Button
              key={deal.id}
              onClick={() => toggleDeal(deal.id)}
              variant={selectedIds.includes(deal.id) ? "secondary" : "outline"}
            >
              {deal.company_name}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                {selectedDeals.map((deal) => (
                  <TableHead key={deal.id}>{deal.company_name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                [
                  "Recommendation",
                  (deal: Deal) => (
                    <Badge>{deal.analysis?.recommendation.verdict ?? "N/A"}</Badge>
                  ),
                ],
                ["Team score", (deal: Deal) => deal.analysis?.team_score.score ?? "—"],
                ["Market score", (deal: Deal) => deal.analysis?.market_score.score ?? "—"],
                [
                  "Traction score",
                  (deal: Deal) => deal.analysis?.traction_score.score ?? "—",
                ],
                [
                  "Business model",
                  (deal: Deal) => deal.analysis?.business_model_score.score ?? "—",
                ],
                ["Risk score", (deal: Deal) => deal.analysis?.overall_risk_score ?? "—"],
                ["Thesis fit", (deal: Deal) => deal.analysis?.thesis_fit_score ?? "—"],
                ["Stage", (deal: Deal) => deal.stage],
                ["Sector", (deal: Deal) => deal.sector],
              ].map(([label, getter]) => (
                <TableRow key={label}>
                  <TableCell className="font-medium">{label}</TableCell>
                  {selectedDeals.map((deal) => (
                    <TableCell key={`${deal.id}-${label}`}>
                      {(getter as (deal: Deal) => React.ReactNode)(deal)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
