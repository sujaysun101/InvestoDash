"use client";

import { useEffect, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function PostLoginResolver() {
  const [message, setMessage] = useState("Finishing sign-in...");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      window.location.replace("/login");
      return;
    }

    let active = true;

    async function resolveDestination() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (!session?.user) {
        setMessage("No active session found. Redirecting to sign in...");
        window.location.replace("/login");
        return;
      }

      setMessage("Opening your workspace...");

      const { data: thesis } = await supabase
        .from("thesis")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      window.location.replace(thesis ? "/compare" : "/onboarding");
    }

    void resolveDestination();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="rounded-2xl border border-border/70 bg-card px-6 py-5 text-sm text-muted-foreground shadow-sm">
        {message}
      </div>
    </main>
  );
}
