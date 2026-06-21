-- Run this in your NEW Supabase project's SQL Editor for the test-shop

-- Items table (public read, service key write)
CREATE TABLE shop_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  price numeric(10,2) NOT NULL,
  description text DEFAULT '',
  image_url text,
  video_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view (scanner crawls this)
CREATE POLICY "Public can read shop_items"
  ON shop_items FOR SELECT USING (true);

-- Service key can insert/update/delete
CREATE POLICY "Service key can insert shop_items"
  ON shop_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Service key can update shop_items"
  ON shop_items FOR UPDATE USING (true);

-- Media bucket (for uploaded product images/videos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read on media bucket
CREATE POLICY "Public can read media"
  ON storage.objects FOR SELECT USING (bucket_id = 'media');

-- Service key can upload
CREATE POLICY "Service key can upload to media"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
