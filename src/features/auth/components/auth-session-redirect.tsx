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

    // getSession() reads from local storage — fast, synchronous, and catches
    // both PKCE and implicit-flow sessions immediately after OAuth returns.
    // Any stale-token false-positive is safely caught downstream: PostLoginResolver
    // calls getUser() (server-verified) and sends the user to /login if the
    // session is actually expired, so there is no redirect loop.
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) {
        window.location.replace(redirectTo);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Catch every auth state change (SIGNED_IN, TOKEN_REFRESHED, etc.) so
      // that implicit-flow hash tokens and PKCE cookies are both handled.
      if (session) {
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
