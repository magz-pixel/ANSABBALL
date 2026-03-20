-- Add height, weight, and enrollment type for player signup profile
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS height_cm INT,
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS enrollment_type TEXT DEFAULT 'independent' CHECK (enrollment_type IN ('school', 'independent'));

-- Allow players to create their own profile (for signup flow)
CREATE POLICY "Players can insert own profile"
  ON public.players FOR INSERT
  WITH CHECK (player_user_id = auth.uid());

-- Allow players to update their own profile (limited - e.g. during pending)
CREATE POLICY "Players can update own profile"
  ON public.players FOR UPDATE
  USING (player_user_id = auth.uid());

-- Allow admins/coaches to update user approval_status
CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );
