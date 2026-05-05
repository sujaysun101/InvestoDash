"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (deals.length === 0) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds((current) => {
      const stillPresent = current.filter((id) =>
        deals.some((deal) => deal.id === id),
      );

      if (stillPresent.length >= 2) {
        return stillPresent.slice(0, 4);
      }

      if (stillPresent.length === 1) {
        return stillPresent;
      }

      return deals.slice(0, Math.min(2, deals.length)).map((deal) => deal.id);
    });
  }, [deals]);

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

  if (deals.length === 0) {
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
            <CardTitle>No deals yet</CardTitle>
            <CardDescription>
              Add a company to your pipeline or open a deal room, then return here to
              compare scores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/pipeline">Go to pipeline</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const needsMoreSelections = selectedDeals.length < 2;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Compare view
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Select 2 to 4 deals for side-by-side scoring.
        </h1>
        {deals.length === 1 ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            You only have one deal right now. Add another company to the pipeline to
            unlock side-by-side comparison.
          </p>
        ) : null}
        {needsMoreSelections ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            Choose at least two deals below to see the comparison table.
          </p>
        ) : null}
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
          {needsMoreSelections ? (
            <div className="rounded-2xl border border-dashed border-border/60 px-6 py-12 text-center text-sm text-muted-foreground">
              Select two or more deals above to populate the matrix.
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
