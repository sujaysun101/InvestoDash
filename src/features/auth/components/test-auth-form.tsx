"use client";

import { useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const TEST_EMAIL = "test@investodash.com";
const TEST_PASSWORD = "sss123456789";

export function TestAuthForm() {
  const [email, setEmail] = useState(TEST_EMAIL);
  const [password, setPassword] = useState(TEST_PASSWORD);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (email.trim().toLowerCase() !== TEST_EMAIL || password !== TEST_PASSWORD) {
      toast.error("Test environment only accepts the demo test credentials.");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      toast.error("Add Supabase env vars to enable sign in.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      if (error) throw error;
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoComplete="email"
          className="pl-10"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
      </div>

      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoComplete="current-password"
          className="pl-10"
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
      </div>

      <Button className="w-full" disabled={loading} type="submit">
        {loading ? "Signing in..." : "Sign in to Test Environment"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Test login only: <span className="font-medium">{TEST_EMAIL}</span>
      </p>
    </form>
  );
}
