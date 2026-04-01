import { mockDeals, mockThesis, mockUsage } from "@/lib/mock-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Deal, ThesisProfile, UsageCounter } from "@/lib/types";

export async function loadDashboardData(): Promise<{
  deals: Deal[];
  thesis: ThesisProfile | null;
  usage: UsageCounter;
}> {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return { deals: mockDeals, thesis: mockThesis, usage: mockUsage };
  }

  const [{ data: dealsData }, { data: thesisData }, { data: usageData }] =
    await Promise.all([
      supabase.from("deals").select("*"),
      supabase.from("thesis").select("*").maybeSingle(),
      supabase.from("usage_counters").select("*").maybeSingle(),
    ]);

  return {
    deals: (dealsData as Deal[]) ?? mockDeals,
    thesis: (thesisData as ThesisProfile) ?? mockThesis,
    usage:
      usageData && "limit_count" in usageData
        ? {
            used: usageData.used as number,
            limit: usageData.limit_count as number,
            remaining: Math.max(
              0,
              (usageData.limit_count as number) - (usageData.used as number),
            ),
          }
        : mockUsage,
  };
}

export async function loadDealById(id: string) {
  const { deals } = await loadDashboardData();
  return deals.find((deal) => deal.id === id) ?? null;
}
