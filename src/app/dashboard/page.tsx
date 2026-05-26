import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DealBoard } from "@/features/deals/components/deal-board";
import { requireUser } from "@/lib/auth";
import { loadDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const user = await requireUser();
  const { deals, thesis, usage } = await loadDashboardData();

  return (
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-primary">Pipeline</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Deal flow</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Kanban view of your deal flow from inbox through invested.
            </p>
          </div>
          <Button asChild className="shrink-0" variant="outline">
            <Link href="/compare">Compare deals</Link>
          </Button>
        </div>

        {deals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-secondary/10 px-6 py-12 text-center text-sm text-muted-foreground">
            No deals yet. Open a deal from your deck uploads or seed data to see the
            pipeline here.
          </div>
        ) : (
          <DealBoard deals={deals} />
        )}
      </div>
    </AppShell>
  );
}
