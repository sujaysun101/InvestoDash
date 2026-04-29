import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { DEMO_COOKIE_NAME, hasDemoCookie, isInternalDemoEnabled } from "@/lib/demo-auth";
import { THESIS_PROFILE_COOKIE } from "@/lib/thesis-cookie";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const thesisSchema = z.object({
  sectors: z.array(z.string()).min(1),
  target_stage: z.array(z.string()).min(1),
  check_size_range: z.string().min(1),
  geography_preference: z.string().min(1),
  custom_note: z.string(),
});

export async function POST(request: Request) {
  let jsonBody: unknown;
  try {
    jsonBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = thesisSchema.safeParse(jsonBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid thesis payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const thesis = parsed.data;
  const cookieStore = cookies();
  const isDemoSession =
    isInternalDemoEnabled() && hasDemoCookie(cookieStore.get(DEMO_COOKIE_NAME)?.value);

  if (isDemoSession) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: THESIS_PROFILE_COOKIE,
      value: JSON.stringify(thesis),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("thesis").upsert({
    user_id: user.id,
    ...thesis,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
