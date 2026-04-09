"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignInButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="lg" onClick={handleSignIn} disabled={loading}>
      {loading ? "Redirecting..." : "Sign in with Google"}
    </Button>
  );
}
