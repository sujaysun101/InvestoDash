import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThesisProfile, UsageCounter } from "@/lib/types";

export function AppShell({
  children,
  thesis,
  usage,
}: Readonly<{
  children: React.ReactNode;
  thesis: ThesisProfile | null;
  usage: UsageCounter;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-border/70 bg-panel px-6 py-8 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-primary">
                InvestoDash
              </p>
              <div>
                <h2 className="text-2xl font-semibold">Deal OS</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Persistent CRM plus AI diligence for angel investors.
                </p>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <Button asChild className="justify-start" variant="ghost">
                <Link href="/">Pipeline</Link>
              </Button>
              <Button asChild className="justify-start" variant="ghost">
                <Link href="/compare">Compare Deals</Link>
              </Button>
              <Button asChild className="justify-start" variant="ghost">
                <Link href="/onboarding">Investment Thesis</Link>
              </Button>
              <Button asChild className="justify-start" variant="ghost">
                <Link href="/login">Auth</Link>
              </Button>
            </nav>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Free analyses</span>
                  <Badge variant={usage.remaining > 0 ? "secondary" : "destructive"}>
                    {usage.used}/{usage.limit}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {usage.remaining > 0
                    ? `${usage.remaining} analyses left before the paywall.`
                    : "Free tier exhausted. Prompt the subscription modal on next run."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Thesis profile</span>
                  <Badge variant={thesis ? "secondary" : "outline"}>
                    {thesis ? "Active" : "Needs setup"}
                  </Badge>
                </div>
                {thesis ? (
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <p>Sectors: {thesis.sectors.join(", ")}</p>
                    <p>
                      Stage: {thesis.target_stage.join(", ")} | Check:{" "}
                      {thesis.check_size_range}
                    </p>
                    <p>Geo: {thesis.geography_preference}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Collect thesis details right after first login to unlock fit
                    scoring.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </aside>

        <main className="px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
