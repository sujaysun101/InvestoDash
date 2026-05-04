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
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    deals.length === 0 ? [] : deals.slice(0, 2).map((deal) => deal.id),
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

  const rows: Array<{
    label: string;
    getter: (deal: Deal) => React.ReactNode;
  }> = [
    {
      label: "Recommendation",
      getter: (deal) => <Badge>{deal.analysis?.recommendation.verdict ?? "N/A"}</Badge>,
    },
    { label: "Team score", getter: (deal) => deal.analysis?.team_score.score ?? "—" },
    { label: "Market score", getter: (deal) => deal.analysis?.market_score.score ?? "—" },
    { label: "Traction score", getter: (deal) => deal.analysis?.traction_score.score ?? "—" },
    {
      label: "Business model",
      getter: (deal) => deal.analysis?.business_model_score.score ?? "—",
    },
    { label: "Risk score", getter: (deal) => deal.analysis?.overall_risk_score ?? "—" },
    { label: "Thesis fit", getter: (deal) => deal.analysis?.thesis_fit_score ?? "—" },
    { label: "Stage", getter: (deal) => deal.stage },
    { label: "Sector", getter: (deal) => deal.sector },
  ];

  const hasNoDeals = deals.length === 0;
  const needsMoreSelection = !hasNoDeals && selectedDeals.length < 2;

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
        <CardContent className="flex flex-col gap-3">
          {hasNoDeals ? (
            <div className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
              No deals to compare yet. Add deals from the pipeline or run analysis
              on a deck first.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {deals.map((deal) => (
                <Button
                  key={deal.id}
                  onClick={() => toggleDeal(deal.id)}
                  variant={selectedIds.includes(deal.id) ? "secondary" : "outline"}
                >
                  {deal.company_name}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {hasNoDeals || needsMoreSelection ? (
            <div className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
              {hasNoDeals
                ? "Comparison table appears once you have at least one deal with scores."
                : "Select at least two deals above to see the comparison table."}
            </div>
          ) : (
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
                {rows.map(({ label, getter }) => (
                  <TableRow key={label}>
                    <TableCell className="font-medium">{label}</TableCell>
                    {selectedDeals.map((deal) => (
                      <TableCell key={`${deal.id}-${label}`}>{getter(deal)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
