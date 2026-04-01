import { AppShell } from "@/components/app-shell";
import { CompareDealsView } from "@/features/deals/components/compare-deals-view";
import { loadDashboardData } from "@/lib/data";

export default async function ComparePage() {
  const { deals, thesis, usage } = await loadDashboardData();

  return (
    <AppShell thesis={thesis} usage={usage}>
      <CompareDealsView deals={deals} />
    </AppShell>
  );
}
