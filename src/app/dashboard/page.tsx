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
        <header className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.35em] text-primary">Pipeline</p>
            <h1 className="text-3xl font-semibold">Deal flow</h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Kanban-style columns by pipeline stage. Open a deal card for AI diligence,
              thesis fit, and exports.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
            <Link href="/compare">Compare deals</Link>
          </Button>
        </header>
        <DealBoard deals={deals} />
      </div>
    </AppShell>
  );
}
