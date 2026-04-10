"use client";

import { useEffect } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function AuthSessionRedirect({
  redirectTo = "/auth/post-login",
}: {
  redirectTo?: string;
}) {
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    let active = true;

    // Use getUser() (not getSession()) — it verifies the token with Supabase's
    // server, so stale/expired JWTs do not trigger a false redirect.
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) {
        window.location.replace(redirectTo);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Only react to a genuine sign-in, not a passive session restore that
      // may carry a stale token.
      if (event === "SIGNED_IN" && session) {
        window.location.replace(redirectTo);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [redirectTo]);

  return null;
}
