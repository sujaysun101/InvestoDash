import { AppShell } from "@/components/app-shell";
import { CompareDealsView } from "@/features/deals/components/compare-deals-view";
import { DealBoard } from "@/features/deals/components/deal-board";
import { requireUser } from "@/lib/auth";
import { loadDashboardData } from "@/lib/data";

export default async function ComparePage() {
  const user = await requireUser();
  const { deals, thesis, usage } = await loadDashboardData();

  return (
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <div className="flex flex-col gap-12">
        <section className="scroll-mt-8" id="pipeline">
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Pipeline
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Deal flow — inbox to invested
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Kanban by pipeline stage; open a card for the deal room, deck upload,
              and AI diligence.
            </p>
          </div>
          <DealBoard deals={deals} />
        </section>
        <CompareDealsView deals={deals} />
      </div>
    </AppShell>
  );
}
