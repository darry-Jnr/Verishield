-- Run this in your Supabase project's SQL Editor for the test-shop
-- Creates a dedicated "shop" schema isolated from your main "public" tables

CREATE SCHEMA IF NOT EXISTS shop;

-- Items table
CREATE TABLE shop.items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  price numeric(10,2) NOT NULL,
  description text DEFAULT '',
  image_url text,
  video_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shop.items ENABLE ROW LEVEL SECURITY;

-- Anyone can view (scanner crawls this)
CREATE POLICY "Public can read shop items"
  ON shop.items FOR SELECT USING (true);

-- Service key can insert/update/delete
CREATE POLICY "Service key can insert shop items"
  ON shop.items FOR INSERT WITH CHECK (true);

CREATE POLICY "Service key can update shop items"
  ON shop.items FOR UPDATE USING (true);

CREATE POLICY "Service key can delete shop items"
  ON shop.items FOR DELETE USING (true);

-- Media bucket (for uploaded product images/videos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-media', 'shop-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read on media bucket
CREATE POLICY "Public can read shop-media"
  ON storage.objects FOR SELECT USING (bucket_id = 'shop-media');

-- Service key can upload
CREATE POLICY "Service key can upload to shop-media"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shop-media');
