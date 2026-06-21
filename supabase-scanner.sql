-- Run this in Supabase SQL editor

create table if not exists scan_results (
  id bigint generated always as identity primary key,
  tracking_id text not null,
  file_id bigint not null references files(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  matched_url text not null,
  matched_image_url text not null,
  page_title text,
  site_email text,
  impact_summary text,
  detected_at timestamptz not null default now()
);

alter table scan_results enable row level security;

create policy "Users can read their own scan results"
  on scan_results for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scan results"
  on scan_results for insert
  with check (auth.uid() = user_id);

create policy "Service key can manage scan results"
  on scan_results for all
  using (true)
  with check (true);
