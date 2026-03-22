-- Public bucket for player passport-style photos (uploaded at registration / profile)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'player-photos',
  'player-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Path format: {auth.uid()}/{filename} — only owner can write; anyone can read (public bucket)
DROP POLICY IF EXISTS "Public read player photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload own player photos" ON storage.objects;
DROP POLICY IF EXISTS "Users update own player photos" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own player photos" ON storage.objects;

CREATE POLICY "Public read player photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'player-photos');

CREATE POLICY "Authenticated users upload own player photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'player-photos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users update own player photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'player-photos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users delete own player photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'player-photos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
