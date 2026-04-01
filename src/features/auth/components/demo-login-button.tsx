"use client";

import { FlaskConical } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const demoEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
const demoPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD;

export function DemoLoginButton() {
  async function handleDemoLogin() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      toast.error("Add Supabase env vars to enable authentication.");
      return;
    }

    if (!demoEmail || !demoPassword) {
      toast.error(
        "Set NEXT_PUBLIC_TEST_EMAIL and NEXT_PUBLIC_TEST_PASSWORD to enable the demo login button.",
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    window.location.href = "/auth/post-login";
  }

  return (
    <Button className="w-full" onClick={handleDemoLogin} variant="ghost">
      <FlaskConical />
      Log in with Test Credentials
    </Button>
  );
}
