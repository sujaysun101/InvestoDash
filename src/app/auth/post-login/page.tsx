import { redirect } from "next/navigation";

import { PostLoginResolver } from "@/features/auth/components/post-login-resolver";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PostLoginPage() {
  const user = await requireUser("/auth/post-login");

  if (!user) {
    return <PostLoginResolver />;
  }

  if (user.isDemo) {
    redirect("/compare");
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    redirect("/compare");
  }

  const { data: existingThesis } = await supabase
    .from("thesis")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingThesis) {
    redirect("/compare");
  }

  redirect("/onboarding");
}
