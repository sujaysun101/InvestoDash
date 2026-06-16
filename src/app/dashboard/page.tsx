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
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Pipeline
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Move deals from inbox to invested.
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Each column is a pipeline stage. Open a card for the deal room, AI
              memo, and exports.
            </p>
          </div>
          <Button asChild className="shrink-0 self-start sm:self-auto" variant="outline">
            <Link href="/compare">Compare deals</Link>
          </Button>
        </section>

        <DealBoard deals={deals} />
      </div>
    </AppShell>
  );
}
