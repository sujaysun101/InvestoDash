import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const thesisSchema = z.object({
  sectors: z.array(z.string()),
  target_stage: z.array(z.string()),
  check_size_range: z.string(),
  geography_preference: z.string(),
  custom_note: z.string(),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = thesisSchema.parse(await request.json());

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from("thesis").upsert({
    user_id: userId,
    ...body,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
