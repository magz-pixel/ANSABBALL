-- Safe if you already ran 20260331000000_coach_scope_rls_and_profile.sql (ADD COLUMN IF NOT EXISTS).
-- Run this in Supabase SQL Editor if you only see: "Could not find the 'photo_url' column of 'coaches'"

ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS photo_url TEXT;
