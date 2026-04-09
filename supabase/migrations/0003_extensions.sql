-- Extend deals with AI fields, memo, analysis workflow
alter table public.deals add column if not exists analysis_status text not null default 'pending';
alter table public.deals add column if not exists memo text;
alter table public.deals add column if not exists deck_url text;
alter table public.deals add column if not exists recommendation text;
alter table public.deals add column if not exists team_score int;
alter table public.deals add column if not exists market_score int;
alter table public.deals add column if not exists traction_score int;
alter table public.deals add column if not exists business_model_score int;
alter table public.deals add column if not exists risk_score int;
alter table public.deals add column if not exists thesis_fit int;
alter table public.deals add column if not exists fit_score int;
alter table public.deals add column if not exists ai_summary text;
alter table public.deals add column if not exists ai_team_notes text;
alter table public.deals add column if not exists ai_market_notes text;
alter table public.deals add column if not exists ai_risk_notes text;

alter table public.deal_activity add column if not exists activity_type text not null default 'note_added';
alter table public.deal_activity add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  deal_id uuid references public.deals(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
on public.notifications for select
using (auth.uid() = user_id);

create policy "notifications_insert_own"
on public.notifications for insert
with check (auth.uid() = user_id);

create policy "notifications_update_own"
on public.notifications for update
using (auth.uid() = user_id);

create policy "notifications_delete_own"
on public.notifications for delete
using (auth.uid() = user_id);

-- Allow users to delete their own deals (account cleanup)
create policy "deals_delete_own"
on public.deals for delete
using (auth.uid() = user_id);

-- Thesis: single upsert-style policy (merge with existing policies)
drop policy if exists "thesis_insert_own" on public.thesis;
drop policy if exists "thesis_update_own" on public.thesis;

create policy "thesis_upsert_own"
on public.thesis for insert
with check (auth.uid() = user_id);

create policy "thesis_update_own_v2"
on public.thesis for update
using (auth.uid() = user_id);

create policy "thesis_delete_own"
on public.thesis for delete
using (auth.uid() = user_id);
