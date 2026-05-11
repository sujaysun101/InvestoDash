import { AppShell } from "@/components/app-shell";
import { DealBoard } from "@/features/deals/components/deal-board";
import { requireUser } from "@/lib/auth";
import { loadDashboardData } from "@/lib/data";

export default async function DashboardPage() {
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
            Kanban across Inbox through Invested.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Drag-style columns group deals by stage. Open a card for the deal room,
            deck upload, and AI diligence.
          </p>
        </section>
        <DealBoard deals={deals} />
      </div>
    </AppShell>
  );
}
