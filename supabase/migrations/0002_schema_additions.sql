-- =====================================================================
-- Migration 0002: Add missing columns and tables
-- Run in Supabase SQL editor or via supabase db push
-- =====================================================================

-- ─── deals table: add all columns the app code expects ───────────────
ALTER TABLE deals ADD COLUMN IF NOT EXISTS analysis_status text NOT NULL DEFAULT 'pending';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS memo text NOT NULL DEFAULT '';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deck_url text;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS recommendation text;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS team_score int;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS market_score int;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS traction_score int;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS business_model_score int;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS risk_score int;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS thesis_fit int;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS fit_score int;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ai_summary text;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ai_team_notes text;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ai_market_notes text;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ai_risk_notes text;

-- ─── deal_activity: add user_id and activity_type ────────────────────
ALTER TABLE deal_activity ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE deal_activity ADD COLUMN IF NOT EXISTS activity_type text NOT NULL DEFAULT 'note';

-- ─── notifications table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their own notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id);

-- ─── RLS for existing tables (idempotent) ────────────────────────────
ALTER TABLE thesis ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their own thesis"
  ON thesis FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their own deals"
  ON deals FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE deal_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage activity for their deals"
  ON deal_activity FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM deals WHERE deals.id = deal_activity.deal_id AND deals.user_id = auth.uid()
    )
  );

ALTER TABLE deal_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage analysis for their deals"
  ON deal_analysis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM deals WHERE deals.id = deal_analysis.deal_id AND deals.user_id = auth.uid()
    )
  );

ALTER TABLE deal_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage files for their deals"
  ON deal_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM deals WHERE deals.id = deal_files.deal_id AND deals.user_id = auth.uid()
    )
  );

ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can m