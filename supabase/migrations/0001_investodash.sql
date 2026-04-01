create extension if not exists "pgcrypto";

create table if not exists thesis (
  user_id uuid primary key,
  sectors text[] not null default '{}',
  check_size_range text not null,
  target_stage text[] not null default '{}',
  geography_preference text not null,
  custom_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  company_name text not null,
  founder_name text not null default '',
  website_url text not null default '',
  stage text not null,
  sector text not null,
  notes_html text not null default '',
  status text not null default 'Inbox',
  date_added date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists deal_activity (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  title text not null,
  note text not null,
  timestamp timestamptz not null default now()
);

create table if not exists deal_files (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists deal_analysis (
  deal_id uuid primary key references deals(id) on delete cascade,
  executive_summary text not null,
  team_score int not null,
  team_reasoning text not null,
  market_score int not null,
  market_reasoning text not null,
  traction_score int not null,
  traction_reasoning text not null,
  business_model_score int not null,
  business_model_reasoning text not null,
  overall_risk_score int not null,
  strengths text[] not null default '{}',
  red_flags text[] not null default '{}',
  missing_info text[] not null default '{}',
  recommendation text not null,
  recommendation_rationale text not null,
  thesis_fit_score int not null,
  thesis_fit_reason text not null,
  web_context text not null,
  raw_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists usage_counters (
  user_id uuid primary key,
  used int not null default 0,
  limit_count int not null default 3,
  updated_at timestamptz not null default now()
);

create or replace function increment_analysis_usage()
returns void
language plpgsql
security definer
as $$
begin
  update usage_counters
  set used = used + 1,
      updated_at = now()
  where user_id = auth.uid();
end;
$$;
