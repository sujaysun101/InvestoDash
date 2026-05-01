import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { CompareDealsView } from "@/features/deals/components/compare-deals-view";
import { requireUser } from "@/lib/auth";
import { loadDashboardData } from "@/lib/data";

export default async function ComparePage() {
  const user = await requireUser();
  const { deals, thesis, usage } = await loadDashboardData();

  return (
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <div className="flex flex-col gap-3 pb-2">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Compare only
        </p>
        <p className="text-sm text-muted-foreground">
          For the full pipeline plus comparison, use{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/workspace">
            Workspace
          </Link>
          .
        </p>
      </div>
      <CompareDealsView deals={deals} />
    </AppShell>
  );
}
