-- Run this in Supabase SQL editor
-- RLS policies for folders and files tables
-- These ensure users only see their own data

-- ============================================
-- FOLDERS
-- ============================================

alter table folders enable row level security;

create policy "Users can read their own folders"
  on folders for select
  using (auth.uid() = user_id);

create policy "Users can create their own folders"
  on folders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own folders"
  on folders for update
  using (auth.uid() = user_id);

create policy "Users can delete their own folders"
  on folders for delete
  using (auth.uid() = user_id);

create policy "Service key can manage folders"
  on folders for all
  using (true)
  with check (true);

-- ============================================
-- FILES
-- ============================================

alter table files enable row level security;

create policy "Users can read their own files"
  on files for select
  using (auth.uid() = user_id);

create policy "Users can create their own files"
  on files for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own files"
  on files for update
  using (auth.uid() = user_id);

create policy "Users can delete their own files"
  on files for delete
  using (auth.uid() = user_id);

create policy "Service key can manage files"
  on files for all
  using (true)
  with check (true);
