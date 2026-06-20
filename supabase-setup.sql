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

-- Add url column to the files table
alter table files add column if not exists url text;
