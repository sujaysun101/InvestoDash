import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { loadDashboardData } from "@/lib/data";
import { formatDate } from "@/lib/format-date";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const { thesis, usage, deals } = await loadDashboardData();
  const supabase = createServerSupabaseClient();

  let lastActive = new Date().toISOString();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    lastActive = data.user?.last_sign_in_at ?? lastActive;
  }

  return (
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Account settings
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>Primary sign-in address.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{user.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Your pipeline and analysis activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Deals in pipeline: {deals.length}</p>
            <p>Analyses completed: {usage.used}</p>
            <p>Last active: {formatDate(lastActive)}</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
            <CardDescription>Destructive actions for your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" type="button" disabled>
              Delete all data
            </Button>
            <Button variant="destructive" type="button" disabled>
              Delete account
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
