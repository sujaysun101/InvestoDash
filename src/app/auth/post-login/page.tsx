import { redirect } from "next/navigation";

import { PostLoginResolver } from "@/features/auth/components/post-login-resolver";
import { getCurrentUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PostLoginPage() {
  // Use getCurrentUser directly — avoids the confusing requireUser("/auth/post-login")
  // guard pattern and lets this page decide its own fallback behaviour.
  const user = await getCurrentUser();

  if (!user) {
    // Session not yet visible server-side (e.g. cookies still propagating after
    // OAuth callback). Fall back to a client-side resolver that uses getUser()
    // to verify the token and redirect appropriately.
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

  redirect(existingThesis ? "/compare" : "/onboarding");
}
