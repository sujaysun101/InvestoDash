"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Deal } from "@/lib/types";

const STORAGE_KEY = "investodash:compare";

function ScoreBar({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, value * 10)}%` }}
        />
      </div>
      <span className="w-4 text-sm tabular-nums">{value}</span>
    </div>
  );
}

export function CompareDealsView({ deals }: { deals: Deal[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedIds(parsed.filter((id) => deals.some((d) => d.id === id)));
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setSelectedIds(deals.slice(0, Math.min(2, deals.length)).map((deal) => deal.id));
  }, [deals]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
    } catch {
      /* ignore */
    }
  }, [selectedIds]);

  const selectedDeals = useMemo(
    () => deals.filter((deal) => selectedIds.includes(deal.id)).slice(0, 4),
    [deals, selectedIds],
  );

  function toggleDeal(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 4) {
        return current;
      }
      return [...current, id];
    });
  }

  const rows: Array<{
    label: string;
    getter: (deal: Deal) => React.ReactNode;
  }> = [
    {
      label: "Recommendation",
      getter: (deal) => (
        <Badge>{deal.analysis?.recommendation.verdict ?? "N/A"}</Badge>
      ),
    },
    {
      label: "Team score",
      getter: (deal) => (
        <ScoreBar value={deal.analysis?.team_score.score ?? null} />
      ),
    },
    {
      label: "Market score",
      getter: (deal) => (
        <ScoreBar value={deal.analysis?.market_score.score ?? null} />
      ),
    },
    {
      label: "Traction score",
      getter: (deal) => (
        <ScoreBar value={deal.analysis?.traction_score.score ?? null} />
      ),
    },
    {
      label: "Business model",
      getter: (deal) => (
        <ScoreBar value={deal.analysis?.business_model_score.score ?? null} />
      ),
    },
    {
      label: "Risk score",
      getter: (deal) => (
        <ScoreBar value={deal.analysis?.overall_risk_score ?? null} />
      ),
    },
    {
      label: "Thesis fit",
      getter: (deal) => (
        <ScoreBar
          value={deal.fit_score ?? deal.analysis?.thesis_fit_score ?? null}
        />
      ),
    },
    { label: "Stage", getter: (deal) => deal.stage },
    { label: "Sector", getter: (deal) => deal.sector },
  ];

  return (
    <TooltipProvider>
      <div className="flex max-h-[calc(100vh-120px)] flex-col gap-8 overflow-y-auto">
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
            {deals.map((deal) => {
              const isSelected = selectedIds.includes(deal.id);
              const atCap = selectedIds.length >= 4 && !isSelected;
              const button = (
                <Button
                  key={deal.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  disabled={atCap}
                  className={
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : ""
                  }
                  onClick={() => toggleDeal(deal.id)}
                >
                  {isSelected ? (
                    <Check className="mr-1 h-3 w-3" />
                  ) : null}
                  {deal.company_name}
                </Button>
              );

              if (atCap) {
                return (
                  <Tooltip key={deal.id}>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          key={deal.id}
                          type="button"
                          variant="outline"
                          disabled
                          className="cursor-not-allowed"
                        >
                          {deal.company_name}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Deselect a deal first to add another.
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </CardContent>
        </Card>

        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto pt-6">
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
                      <TableCell key={`${deal.id}-${label}`}>
                        {getter(deal)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
