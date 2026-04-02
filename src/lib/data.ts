import { cookies } from "next/headers";

import { DEMO_COOKIE_NAME, hasDemoCookie } from "@/lib/demo-auth";
import { mockDeals, mockThesis, mockUsage } from "@/lib/mock-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Deal, ThesisProfile, UsageCounter } from "@/lib/types";

export async function loadDashboardData(): Promise<{
  deals: Deal[];
  thesis: ThesisProfile | null;
  usage: UsageCounter;
}> {
  const cookieStore = cookies();
  if (hasDemoCookie(cookieStore.get(DEMO_COOKIE_NAME)?.value)) {
    return { deals: mockDeals, thesis: mockThesis, usage: mockUsage };
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return { deals: mockDeals, thesis: mockThesis, usage: mockUsage };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { deals: [], thesis: null, usage: mockUsage };
  }

  const [{ data: dealsData }, { data: thesisData }, { data: usageData }] =
    await Promise.all([
      supabase.from("deals").select("*").eq("user_id", user.id),
      supabase.from("thesis").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("usage_counters")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
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
  const cookieStore = cookies();
  if (hasDemoCookie(cookieStore.get(DEMO_COOKIE_NAME)?.value)) {
    return mockDeals.find((deal) => deal.id === id) ?? null;
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return mockDeals.find((deal) => deal.id === id) ?? null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  return (data as Deal | null) ?? null;
}
