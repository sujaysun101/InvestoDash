create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  deal_id uuid references public.deals(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications for select
using (auth.uid() = user_id);

drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own"
on public.notifications for insert
with check (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications for update
using (auth.uid() = user_id);

alter table public.deals
  add column if not exists investment_stage text,
  add column if not exists pipeline_stage text default 'Inbox',
  add column if not exists recommendation text,
  add column if not exists team_score integer,
  add column if not exists market_score integer,
  add column if not exists traction_score integer,
  add column if not exists business_model_score integer,
  add column if not exists risk_score integer,
  add column if not exists thesis_fit integer,
  add column if not exists fit_score integer,
  add column if not exists ai_summary text,
  add column if not exists ai_team_notes text,
  add column if not exists ai_market_notes text,
  add column if not exists ai_risk_notes text,
  add column if not exists memo text,
  add column if not exists deck_url text,
  add column if not exists analysis_status text default 'pending';

update public.deals
set
  investment_stage = coalesce(investment_stage, stage),
  pipeline_stage = coalesce(pipeline_stage, status),
  memo = coalesce(memo, notes_html),
  fit_score = coalesce(fit_score, (select thesis_fit_score from public.deal_analysis da where da.deal_id = deals.id)),
  thesis_fit = coalesce(thesis_fit, (select thesis_fit_score from public.deal_analysis da where da.deal_id = deals.id)),
  risk_score = coalesce(risk_score, (select overall_risk_score from public.deal_analysis da where da.deal_id = deals.id)),
  team_score = coalesce(team_score, (select team_score from public.deal_analysis da where da.deal_id = deals.id)),
  market_score = coalesce(market_score, (select market_score from public.deal_analysis da where da.deal_id = deals.id)),
  traction_score = coalesce(traction_score, (select traction_score from public.deal_analysis da where da.deal_id = deals.id)),
  business_model_score = coalesce(business_model_score, (select business_model_score from public.deal_analysis da where da.deal_id = deals.id)),
  ai_summary = coalesce(ai_summary, (select executive_summary from public.deal_analysis da where da.deal_id = deals.id)),
  recommendation = coalesce(recommendation, (select recommendation from public.deal_analysis da where da.deal_id = deals.id)),
  analysis_status = coalesce(analysis_status, 'pending');
