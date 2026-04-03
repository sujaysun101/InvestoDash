import { notFound, redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { DealRoom } from "@/features/deals/components/deal-room";
import { requireUser } from "@/lib/auth";
import { loadDashboardData, loadDealById } from "@/lib/data";

export default async function DealPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const [{ thesis, usage }, deal] = await Promise.all([
    loadDashboardData(),
    loadDealById(params.id),
  ]);

  if (!deal) {
    notFound();
  }

  return (
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <DealRoom deal={deal} thesis={thesis} />
    </AppShell>
  );
}
