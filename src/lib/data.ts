import { mapSupabaseDealToDeal } from "@/lib/deal-mapper";
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

  const dealsRows = dealsData ?? [];
  const dealIds = dealsRows.map((d) => d.id as string);

  const [{ data: analysesData }, { data: activityData }] = await Promise.all([
    dealIds.length
      ? supabase.from("deal_analysis").select("*").in("deal_id", dealIds)
      : Promise.resolve({ data: [] as unknown[] }),
    dealIds.length
      ? supabase.from("deal_activity").select("*").in("deal_id", dealIds)
      : Promise.resolve({ data: [] as unknown[] }),
  ]);

  const analysisByDeal = new Map(
    (analysesData ?? []).map((row) => [(row as { deal_id: string }).deal_id, row]),
  );

  const activityList = (activityData ?? []) as Array<{
    id: string;
    deal_id: string;
    title: string;
    note: string;
    timestamp: string;
  }>;
  const activityByDeal = new Map<string, typeof activityList>();
  for (const row of activityList) {
    const list = activityByDeal.get(row.deal_id) ?? [];
    list.push(row);
    activityByDeal.set(row.deal_id, list);
  }

  const limit = 3;
  const completeIds = new Set<string>();
  for (const row of dealsRows) {
    const r = row as { id: string; analysis_status?: string | null };
    if (r.analysis_status === "complete") completeIds.add(r.id);
  }
  for (const a of analysesData ?? []) {
    completeIds.add((a as { deal_id: string }).deal_id);
  }
  const used = Math.min(completeIds.size, limit);
  const remaining = Math.max(0, limit - used);

  const usage: UsageCounter =
    usageData && "limit_count" in usageData
      ? {
          used,
          limit: (usageData.limit_count as number) ?? limit,
          remaining: Math.max(
            0,
            ((usageData.limit_count as number) ?? limit) - used,
          ),
        }
      : { used, limit, remaining };

  const thesis: ThesisProfile | null = thesisData
    ? {
        sectors: (thesisData as { sectors: string[] }).sectors ?? [],
        check_size_range:
          (thesisData as { check_size_range?: string }).check_size_range ?? "",
        target_stage:
          (thesisData as { target_stage?: string[] }).target_stage ?? [],
        geography_preference:
          (thesisData as { geography_preference?: string })
            .geography_preference ?? "",
        custom_note:
          (thesisData as { custom_note?: string | null }).custom_note ?? "",
      }
    : null;

  if (dealsRows.length === 0) {
    return { deals: [], thesis, usage };
  }

  const deals: Deal[] = dealsRows.map((row) => {
    const id = row.id as string;
    const activities = (activityByDeal.get(id) ?? [])
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .map((a) => ({
        id: a.id,
        title: a.title,
        note: a.note,
        timestamp: a.timestamp,
      }));

    return mapSupabaseDealToDeal(
      row as Parameters<typeof mapSupabaseDealToDeal>[0],
      (analysisByDeal.get(id) as Parameters<typeof mapSupabaseDealToDeal>[1]) ??
        null,
      activities,
      usage.remaining,
    );
  });

  return { deals, thesis: thesis ?? mockThesis, usage };
}

export async function loadDealById(id: string) {
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

  const { data: row } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) {
    return null;
  }

  const [{ data: analysisRow }, { data: activityRows }, { data: usageRow }] =
    await Promise.all([
      supabase.from("deal_analysis").select("*").eq("deal_id", id).maybeSingle(),
      supabase
        .from("deal_activity")
        .select("*")
        .eq("deal_id", id)
        .order("timestamp", { ascending: false }),
      supabase
        .from("usage_counters")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  const limit = (usageRow?.limit_count as number) ?? 3;
  const used = usageRow?.used ?? 0;
  const remaining = Math.max(0, limit - used);

  const activities = (activityRows ?? []).map((a) => ({
    id: (a as { id: string }).id,
    title: (a as { title: string }).title,
    note: (a as { note: string }).note,
    timestamp: (a as { timestamp: string }).timestamp,
  }));

  return mapSupabaseDealToDeal(
    row as Parameters<typeof mapSupabaseDealToDeal>[0],
    (analysisRow as Parameters<typeof mapSupabaseDealToDeal>[1]) ?? null,
    activities,
    remaining,
  );
}
