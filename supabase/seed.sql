-- ANSA Basketball Academy — production-friendly seed
-- Run in Supabase SQL Editor when setting up a fresh project.
-- Creates default player groups only. No sample players, coaches, attendance, or announcements.
-- Add players, coaches, and content through the dashboard after real accounts exist.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.player_groups LIMIT 1) THEN
    INSERT INTO public.player_groups (name) VALUES
      ('Juniors (8-12)'),
      ('Seniors (13-17)');
  END IF;

  RAISE NOTICE 'Seed complete: default groups ensured (if empty).';
END $$;
