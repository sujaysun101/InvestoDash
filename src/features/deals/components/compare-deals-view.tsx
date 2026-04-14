"use client";

import Link from "next/link";
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
    deals.length >= 2 ? deals.slice(0, 2).map((deal) => deal.id) : [...deals.map((d) => d.id)],
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
          <CardContent className="py-14 text-center">
            <p className="text-sm font-medium">No deals to compare</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add deals to your workspace, then return here to compare diligence
              scores.
            </p>
            <Button asChild className="mt-6">
              <Link href="/pipeline">Go to pipeline</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
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
          {selectedDeals.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Pick at least one deal above to see the comparison table.
            </p>
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
