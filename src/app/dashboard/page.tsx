/*
Run this in Supabase SQL editor:
-- CREATE TABLE deals (
--   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id uuid REFERENCES auth.users NOT NULL,
--   company_name text NOT NULL,
--   sector text,
--   stage text,
--   status text DEFAULT 'inbox',
--   ai_risk_score integer,
--   thesis_fit_score integer,
--   recommendation text,
--   created_at timestamptz DEFAULT now()
-- );
-- ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can only see their own deals" ON deals FOR ALL USING (auth.uid() = user_id);
*/

import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { loadDashboardData } from "@/lib/data";

import { Deal } from "@/lib/types";

import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const { deals, thesis, usage } = await loadDashboardData();

  return (
    <AppShell thesis={thesis} usage={usage} userEmail={user.email ?? null}>
      <DashboardClient deals={deals as Deal[]} />
    </AppShell>
  );
}
