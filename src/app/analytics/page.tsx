import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { loadDashboardData } from "@/lib/data";
import { Deal } from "@/lib/types";

import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const { deals, thesis, usage } = await loadDashboardData();

  return (
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <AnalyticsClient deals={deals as Deal[]} />
  