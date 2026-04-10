alter table thesis enable row level security;
alter table deals enable row level security;
alter table deal_activity enable row level security;
alter table deal_files enable row level security;
alter table deal_analysis enable row level security;
alter table usage_counters enable row level security;

create policy "thesis_select_own"
on thesis for select
using (auth.uid() = user_id);

create policy "thesis_insert_own"
on thesis for insert
with check (auth.uid() = user_id);

create policy "thesis_update_own"
on thesis for update
using (auth.uid() = user_id);

create policy "deals_select_own"
on deals for select
using (auth.uid() = user_id);

create policy "deals_insert_own"
on deals for insert
with check (auth.uid() = user_id);

create policy "deals_update_own"
on deals for update
using (auth.uid() = user_id);

create policy "deal_activity_select_own"
on deal_activity for select
using (
  exists (
    select 1 from deals
    where deals.id = deal_activity.deal_id
    and deals.user_id = auth.uid()
  )
);

create policy "deal_activity_insert_own"
on deal_activity for insert
with check (
  exists (
    select 1 from deals
    where deals.id = deal_activity.deal_id
    and deals.user_id = auth.uid()
  )
);

create policy "deal_files_select_own"
on deal_files for select
using (
  exists (
    select 1 from deals
    where deals.id = deal_files.deal_id
    and deals.user_id = auth.uid()
  )
);

create policy "deal_files_insert_own"
on deal_files for insert
with check (
  exists (
    select 1 from deals
    where deals.id = deal_files.deal_id
    and deals.user_id = auth.uid()
  )
);

create policy "deal_analysis_select_own"
on deal_analysis for select
using (
  exists (
    select 1 from deals
    where deals.id = deal_analysis.deal_id
    and deals.user_id = auth.uid()
  )
);

create policy "deal_analysis_insert_own"
on deal_analysis for insert
with check (
  exists (
    select 1 from deals
    where deals.id = deal_analysis.deal_id
    and deals.user_id = auth.uid()
  )
);

create policy "deal_analysis_update_own"
on deal_analysis for update
using (
  exists (
    select 1 from deals
    where deals.id = deal_analysis.deal_id
    and deals.user_id = auth.uid()
  )
);

create policy "usage_counters_select_own"
on usage_counters for select
using (auth.uid() = user_id);

create policy "usage_counters_insert_own"
on usage_counters for insert
with check (auth.uid() = user_id);

create policy "usage_counters_update_own"
on usage_counters for update
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usage_counters (user_id, used, limit_count)
  values (new.id, 0, 3)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
