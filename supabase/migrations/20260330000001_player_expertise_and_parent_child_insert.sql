-- Add player expertise level and allow parents to register children

-- 1) Expertise level on players
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS expertise_level TEXT
    CHECK (expertise_level IN ('beginner', 'developing', 'intermediate', 'advanced', 'elite'));

-- 2) Parents can insert their children (parent-owned rows only)
-- This enables a "Add another child" / "Register child" parent flow.
DROP POLICY IF EXISTS "Parents can insert children" ON public.players;
CREATE POLICY "Parents can insert children"
  ON public.players FOR INSERT
  TO authenticated
  WITH CHECK (
    parent_id = auth.uid()
    AND player_user_id IS NULL
  );

