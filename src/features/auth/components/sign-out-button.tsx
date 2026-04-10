"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  async function signOut() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    window.location.href = "/login";
  }

  return (
    <Button className="justify-start" onClick={signOut} variant="ghost">
      <LogOut />
      Sign Out
    </Button>
  );
}
