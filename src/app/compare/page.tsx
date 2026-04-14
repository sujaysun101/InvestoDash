import { AppShell } from "@/components/app-shell";
import { CompareDealsView } from "@/features/deals/components/compare-deals-view";
import { requireUser } from "@/lib/auth";
import { loadDashboardData } from "@/lib/data";

export default async function ComparePage() {
  const user = await requireUser();
  const { deals, thesis, usage } = await loadDashboardData();

  return (
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <CompareDealsView deals={deals} />
    </AppShell>
  );
}
