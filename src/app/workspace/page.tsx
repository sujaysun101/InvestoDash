import { AppShell } from "@/components/app-shell";
import { CompareDealsView } from "@/features/deals/components/compare-deals-view";
import { DealBoard } from "@/features/deals/components/deal-board";
import { requireUser } from "@/lib/auth";
import { loadDashboardData } from "@/lib/data";

export default async function WorkspacePage() {
  const user = await requireUser();
  const { deals, thesis, usage } = await loadDashboardData();

  return (
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Pipeline
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Kanban from Inbox to Invested
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Drag-style workflow is modeled as columns; open a deal card to run AI
            diligence, upload a deck, and capture notes.
          </p>
        </section>

        <DealBoard deals={deals} />

        <CompareDealsView deals={deals} variant="section" />
      </div>
    </AppShell>
  );
}
