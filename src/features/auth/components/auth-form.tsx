"use client";

import { useState } from "react";
import { Mail, LockKeyhole, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

import { GoogleAuthButton } from "./google-auth-button";

type Mode = "sign-in" | "sign-up";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      toast.error("Add Supabase env vars to enable authentication.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });

        if (error) throw error;

        toast.success(
          "Account created. Check your inbox to confirm your email before signing in.",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Signed in.");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-secondary/30 p-1">
        <Button
          className="rounded-xl"
          onClick={() => setMode("sign-in")}
          type="button"
          variant={mode === "sign-in" ? "secondary" : "ghost"}
        >
          Sign In
        </Button>
        <Button
          className="rounded-xl"
          onClick={() => setMode("sign-up")}
          type="button"
          variant={mode === "sign-up" ? "secondary" : "ghost"}
        >
          Create Account
        </Button>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoComplete="email"
            className="pl-10"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@fund.com"
            type="email"
            value={email}
          />
        </div>

        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            className="pl-10"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
            type="password"
            value={password}
          />
        </div>

        <Button className="w-full" disabled={loading} type="submit">
          {mode === "sign-up" ? <UserPlus /> : <Mail />}
          {loading
            ? mode === "sign-up"
              ? "Creating account..."
              : "Signing in..."
            : mode === "sign-up"
              ? "Create account"
              : "Sign in with email"}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/70" />
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          or
        </span>
        <div className="h-px flex-1 bg-border/70" />
      </div>

      <GoogleAuthButton />
    </div>
  );
}
