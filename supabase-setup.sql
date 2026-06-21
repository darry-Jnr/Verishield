-- Run this in Supabase SQL editor

-- Create a public storage bucket for media files
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload files to media bucket
create policy "Authenticated users can upload to media"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

-- Allow public read access (so URLs work without auth)
create policy "Public read access to media"
  on storage.objects for select
  using (bucket_id = 'media');

-- Allow owners to delete their files from media
create policy "Owners can delete from media"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.uid() = owner);

-- System health heartbeat table
create table if not exists service_heartbeat (
  service_name text primary key,
  last_seen timestamptz not null default now()
);

alter table service_heartbeat enable row level security;

create policy "Authenticated users can read service heartbeat"
  on service_heartbeat for select
  using (auth.role() = 'authenticated');

create policy "Service key can upsert service heartbeat"
  on service_heartbeat for all
  using (true)
  with check (true);

-- Add columns to the files table
alter table files add column if not exists url text;
alter table files add column if not exists storage_path text;
alter table files add column if not exists status text default 'processing';
alter table files add column if not exists tracking_id text;
alter table files add column if not exists error_log text;
