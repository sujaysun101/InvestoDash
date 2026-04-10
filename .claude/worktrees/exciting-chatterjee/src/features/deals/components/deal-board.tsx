import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/lib/constants";
import { Deal } from "@/lib/types";

export function DealBoard({ deals }: { deals: Deal[] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-6">
      {PIPELINE_STAGES.map((stage) => {
        const stageDeals = deals.filter((deal) => deal.status === stage);

        return (
          <Card key={stage} className="min-h-[520px]">
            <CardHeader>
              <CardTitle className="text-base">{stage}</CardTitle>
              <CardDescription>{stageDeals.length} deals</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {stageDeals.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
                  No deals in {stage.toLowerCase()} yet.
                </div>
              ) : (
                stageDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const fit = deal.analysis?.thesis_fit_score ?? 0;
  const risk = deal.analysis?.overall_risk_score ?? 0;

  return (
    <Link href={`/deals/${deal.id}`}>
      <div className="rounded-2xl border border-border/60 bg-secondary/25 p-4 transition-transform hover:-translate-y-0.5 hover:border-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">{deal.company_name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{deal.date_added}</p>
          </div>
          <Badge>{deal.sector}</Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={fit >= 8 ? "secondary" : fit >= 5 ? "outline" : "destructive"}>
            Fit {fit || "—"}
          </Badge>
          <Badge variant={risk >= 7 ? "destructive" : "outline"}>Risk {risk || "—"}</Badge>
        </div>
      </div>
    </Link>
  );
}
