import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DealBoard } from "@/features/deals/components/deal-board";
import { requireUser } from "@/lib/auth";
import { loadDashboardData } from "@/lib/data";

export default async function PipelinePage() {
  const user = await requireUser();
  const { deals, thesis, usage } = await loadDashboardData();

  return (
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Pipeline
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Deal flow from inbox to invested.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Drag-style columns mirror your CRM stages. Open a card for the deal room,
              deck upload, and AI diligence.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/compare">Compare deals</Link>
          </Button>
        </section>

        <DealBoard deals={deals} />
      </div>
    </AppShell>
  );
}
