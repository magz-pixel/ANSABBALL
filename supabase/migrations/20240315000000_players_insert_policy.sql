-- Allow players to create their own profile (for signup flow)
-- Run this in Supabase SQL Editor if you get "row-level security policy" error on player signup

-- Optional: parent contact columns (for players who provide parent details)
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS parent_name TEXT,
  ADD COLUMN IF NOT EXISTS parent_phone TEXT;

DROP POLICY IF EXISTS "Players can insert own profile" ON public.players;
CREATE POLICY "Players can insert own profile"
  ON public.players FOR INSERT
  WITH CHECK (player_user_id = auth.uid());

DROP POLICY IF EXISTS "Players can update own profile" ON public.players;
CREATE POLICY "Players can update own profile"
  ON public.players FOR UPDATE
  USING (player_user_id = auth.uid());
