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
            Move deals from inbox to invested.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Kanban view of your deal flow. Open a card to upload a deck, run AI
            diligence, and update status.
          </p>
        </section>

        {deals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 px-6 py-12 text-center">
            <p className="text-lg font-medium">No deals in your pipeline yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Deals appear here after you add them to InvestoDash. Demo mode
              includes sample companies when Supabase is not configured.
            </p>
          </div>
        ) : (
          <DealBoard deals={deals} />
        )}
      </div>
    </AppShell>
  );
}
