-- Admin-managed upcoming events for public Programs page
CREATE TABLE IF NOT EXISTS public.marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  schedule_days TEXT NOT NULL DEFAULT '',
  date_range TEXT NOT NULL DEFAULT '',
  time_range TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  requirement TEXT NOT NULL DEFAULT '',
  registration_kes TEXT NOT NULL DEFAULT '',
  session_fee_kes TEXT NOT NULL DEFAULT '',
  session_fee_note TEXT,
  phones TEXT[] NOT NULL DEFAULT '{}',
  social_label TEXT NOT NULL DEFAULT 'Ansa Basketball (Facebook & Instagram)',
  poster_path TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  ends_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published marketing events" ON public.marketing_events;
CREATE POLICY "Public read published marketing events"
  ON public.marketing_events FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins manage marketing events" ON public.marketing_events;
CREATE POLICY "Admins manage marketing events"
  ON public.marketing_events FOR ALL
  USING (public.ansa_is_admin())
  WITH CHECK (public.ansa_is_admin());

-- Seed current April intake (matches legacy static config)
INSERT INTO public.marketing_events (
  title,
  schedule_days,
  date_range,
  time_range,
  venue,
  requirement,
  registration_kes,
  session_fee_kes,
  session_fee_note,
  phones,
  social_label,
  poster_path,
  is_published,
  sort_order,
  ends_on
) VALUES (
  'April Basketball Training',
  'Monday – Saturday',
  '6 April – 25 April',
  '10:30 AM – 12:30 PM',
  'Marist College, Karen',
  'Own basketball',
  'KES 2,500',
  'KES 10,500',
  'for 3 weeks',
  ARRAY['0718082452', '0740406721'],
  'Ansa Basketball (Facebook & Instagram)',
  '/posters/april-basketball-training.png',
  true,
  0,
  '2026-04-25'
);

-- Event poster storage (admin uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-posters',
  'event-posters',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read event posters" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload event posters" ON storage.objects;
DROP POLICY IF EXISTS "Admins update event posters" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete event posters" ON storage.objects;

CREATE POLICY "Public read event posters"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-posters');

CREATE POLICY "Admins upload event posters"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-posters' AND public.ansa_is_admin());

CREATE POLICY "Admins update event posters"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-posters' AND public.ansa_is_admin());

CREATE POLICY "Admins delete event posters"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-posters' AND public.ansa_is_admin());
