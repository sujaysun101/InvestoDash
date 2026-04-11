"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, Check, Menu } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { ANALYSIS_PAYWALL_ENABLED } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { ThesisProfile, UsageCounter } from "@/lib/types";
import { cn } from "@/lib/utils";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export function AppShellLayout({
  children,
  thesis,
  usage,
  userEmail,
}: Readonly<{
  children: React.ReactNode;
  thesis: ThesisProfile | null;
  usage: UsageCounter;
  userEmail: string | null;
}>) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  const loadNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const json = (await res.json()) as { items: NotificationRow[] };
    setNotifications(json.items ?? []);
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
          () => {
            void loadNotifications();
          },
        )
        .subscribe();
    } catch {
      /* Realtime may be disabled in some environments */
    }

    return () => {
      if (channel) void supabase.removeChannel(channel);
    };
  }, [loadNotifications]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setNotifOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    void loadNotifications();
  }

  const remaining = usage.remaining;
  const remainingLabel =
    remaining === 1 ? "analysis" : "analyses";

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button aria-label="Open menu" size="sm" variant="outline">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-[min(100%,320px)] overflow-y-auto"
            side="left"
            title="Navigation menu"
          >
            <SidebarInner
              thesis={thesis}
              usage={usage}
              userEmail={userEmail}
              remainingLabel={remainingLabel}
              unreadCount={unread}
              onOpenNotifications={() => setNotifOpen(true)}
            />
          </SheetContent>
        </Sheet>
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">
          InvestoDash
        </p>
        <Button
          aria-label="Notifications alt+T"
          size="sm"
          variant="outline"
          className="relative"
          onClick={() => setNotifOpen(true)}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
              {unread}
            </span>
          ) : null}
        </Button>
      </div>

      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-b border-border/70 bg-panel px-6 py-8 lg:block lg:border-b-0 lg:border-r">
          <SidebarInner
            thesis={thesis}
            usage={usage}
            userEmail={userEmail}
            remainingLabel={remainingLabel}
            unreadCount={unread}
            onOpenNotifications={() => setNotifOpen(true)}
          />
        </aside>

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-8 lg:px-10">
          {children}
        </main>
      </div>

      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent className="w-[min(100%,400px)]" side="right" title="Notifications">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <SheetClose asChild>
              <Button size="sm" variant="ghost">
                Close
              </Button>
            </SheetClose>
          </div>
          <div
            aria-label="Notifications alt+T"
            className="flex max-h-[calc(100vh-120px)] flex-col gap-3 overflow-y-auto"
            role="region"
          >
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={cn(
                    "w-full rounded-xl border border-border/60 bg-secondary/20 p-3 text-left text-sm transition hover:bg-secondary/40",
                    !n.read && "border-primary/40",
                  )}
                  onClick={() => void markRead(n.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{n.title}</span>
                    {!n.read ? (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-muted-foreground">{n.message}</p>
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SidebarInner({
  thesis,
  usage,
  userEmail,
  remainingLabel,
  unreadCount,
  onOpenNotifications,
}: {
  thesis: ThesisProfile | null;
  usage: UsageCounter;
  userEmail: string | null;
  remainingLabel: string;
  unreadCount: number;
  onOpenNotifications: () => void;
}) {
  const remaining = usage.remaining;
  const showLastFree = ANALYSIS_PAYWALL_ENABLED && remaining === 1;

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">
            InvestoDash
          </p>
          <Button
            aria-label="Notifications alt+T"
            className="relative hidden lg:inline-flex"
            size="sm"
            variant="outline"
            type="button"
            onClick={onOpenNotifications}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {unreadCount}
              </span>
            ) : null}
          </Button>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Deal OS</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Persistent CRM plus AI diligence for angel investors.
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <Button asChild className="justify-start" variant="ghost">
          <Link href="/dashboard">Pipeline</Link>
        </Button>
        <Button asChild className="justify-start" variant="ghost">
          <Link href="/analytics">Analytics</Link>
        </Button>
        <Button asChild className="justify-start" variant="ghost">
          <Link href="/compare">Compare Deals</Link>
        </Button>
        <Button asChild className="justify-start" variant="ghost">
          <Link href="/onboarding">Investment Thesis</Link>
        </Button>
        <Button asChild className="justify-start" variant="ghost">
          <Link href="/account">Account</Link>
        </Button>
        <SignOutButton />
      </nav>

      {userEmail ? (
        <div className="rounded-2xl border border-border/70 bg-secondary/25 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Signed in
          </p>
          <p className="mt-2 truncate text-sm text-foreground">{userEmail}</p>
        </div>
      ) : null}

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">
              {ANALYSIS_PAYWALL_ENABLED ? "Free analyses" : "Analyses"}
            </span>
            <div className="flex items-center gap-2">
              {showLastFree ? (
                <Badge
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-400"
                >
                  Last free analysis!
                </Badge>
              ) : null}
              {ANALYSIS_PAYWALL_ENABLED ? (
                <Badge variant={usage.remaining > 0 ? "secondary" : "destructive"}>
                  {usage.used}/{usage.limit}
                </Badge>
              ) : (
                <Badge variant="secondary">{usage.used} completed</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {ANALYSIS_PAYWALL_ENABLED
              ? usage.remaining > 0
                ? `${usage.remaining} ${remainingLabel} left on the free tier.`
                : "Free tier exhausted. Upgrade to run more analyses."
              : usage.used === 0
                ? "Run an analysis from a deal or upload a deck on Pipeline."
                : `${usage.used} analysis run${usage.used === 1 ? "" : "ses"} so far.`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Thesis profile</span>
            <Badge variant={thesis ? "secondary" : "outline"}>
              {thesis ? "Active" : "Needs setup"}
            </Badge>
          </div>
          {thesis ? (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Sectors: {thesis.sectors.join(", ")}</p>
              <p>
                Stage: {thesis.target_stage.join(", ")} | Check:{" "}
                {thesis.check_size_range}
              </p>
              <p>Geo: {thesis.geography_preference}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Collect thesis details right after first login to unlock fit scoring.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
