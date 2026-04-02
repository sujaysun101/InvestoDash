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

    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) {
        window.location.replace(redirectTo);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
