import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PostLoginPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/compare");
  }

  const { data: existingThesis } = await supabase
    .from("thesis")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  redirect(existingThesis ? "/compare" : "/onboarding");
}
