import { AppShell } from "@/components/app-shell";
import { DealBoard } from "@/features/deals/components/deal-board";
import { loadDashboardData } from "@/lib/data";

export default async function HomePage() {
  const { deals, thesis, usage } = await loadDashboardData();

  return (
    <AppShell thesis={thesis} usage={usage}>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Deal Flow Workspace
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-tight text-balance lg:text-5xl">
                Persistent deal flow, thesis alignment, and first-pass diligence
                in one operating system.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground lg:text-base">
                Track every startup from inbox to decision, run structured AI
                analysis on decks, compare conviction across deals, and keep
                your investment thesis attached to every call.
              </p>
            </div>
          </div>
        </section>
        <DealBoard deals={deals} />
      </div>
    </AppShell>
  );
}
