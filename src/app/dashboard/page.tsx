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
              Deal flow from inbox to invested.
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Open a card for the deal room, deck upload, and AI diligence. Use compare
              for side-by-side scoring across two to four deals.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/compare">Compare deals</Link>
          </Button>
        </section>

        {deals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 px-6 py-12 text-center text-sm text-muted-foreground">
            <p>Your pipeline is empty. New deals will land in Inbox as you add them.</p>
            <p className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/compare">Open compare view</Link>
              </Button>
            </p>
          </div>
        ) : (
          <DealBoard deals={deals} />
        )}
      </div>
    </AppShell>
  );
}
