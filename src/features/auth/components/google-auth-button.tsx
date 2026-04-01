"use client";

import { useState } from "react";
import { Chrome } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function GoogleAuthButton() {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      toast.error("Add Supabase env vars to enable Google OAuth.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      toast.error(error.message);
    }

    setLoading(false);
  }

  return (
    <Button className="w-full" onClick={signIn} variant="secondary">
      <Chrome />
      {loading ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}
