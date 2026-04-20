import { AppShell } from "@/components/app-shell";
import { DealBoard } from "@/features/deals/components/deal-board";
import { requireUser } from "@/lib/auth";
import { loadDashboardData } from "@/lib/data";

export default async function PipelinePage() {
  const user = await requireUser();
  const { deals, thesis, usage } = await loadDashboardData();

  return (
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Pipeline
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Kanban deal flow from inbox to invested.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Drag deals through stages in the deal room; this board reflects each
            deal&apos;s current status. Open a card to upload a deck and run AI
            diligence.
          </p>
        </section>
        <DealBoard deals={deals} />
      </div>
    </AppShell>
  );
}
