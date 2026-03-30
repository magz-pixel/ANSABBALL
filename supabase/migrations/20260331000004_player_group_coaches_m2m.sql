-- Many-to-many: multiple coaches can be assigned to the same training group.
-- Migrates existing player_groups.coach_id into player_group_coaches, then drops coach_id.

CREATE TABLE IF NOT EXISTS public.player_group_coaches (
  group_id UUID NOT NULL REFERENCES public.player_groups(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, coach_id)
);

CREATE INDEX IF NOT EXISTS idx_player_group_coaches_coach_id ON public.player_group_coaches(coach_id);
CREATE INDEX IF NOT EXISTS idx_player_group_coaches_group_id ON public.player_group_coaches(group_id);

INSERT INTO public.player_group_coaches (group_id, coach_id)
SELECT pg.id, pg.coach_id
FROM public.player_groups pg
WHERE pg.coach_id IS NOT NULL
ON CONFLICT (group_id, coach_id) DO NOTHING;

ALTER TABLE public.player_groups
  DROP COLUMN IF EXISTS coach_id;

-- RLS on junction (admins manage; everyone reads for dashboards)
ALTER TABLE public.player_group_coaches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read group coach assignments" ON public.player_group_coaches;
CREATE POLICY "Read group coach assignments"
  ON public.player_group_coaches FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage group coach assignments" ON public.player_group_coaches;
CREATE POLICY "Admins manage group coach assignments"
  ON public.player_group_coaches FOR ALL
  USING (public.ansa_is_admin())
  WITH CHECK (public.ansa_is_admin());

-- Scope: coach can access players in groups they are assigned to (any of multiple coaches)
CREATE OR REPLACE FUNCTION public.ansa_player_in_coach_scope(p_player_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.players pl
    INNER JOIN public.player_group_coaches pgc ON pgc.group_id = pl.group_id
    WHERE pl.id = p_player_id
      AND pl.group_id IS NOT NULL
      AND pgc.coach_id = public.ansa_current_coach_id()
  );
$$;

DROP POLICY IF EXISTS "Coaches insert scoped players" ON public.players;
CREATE POLICY "Coaches insert scoped players"
  ON public.players FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND EXISTS (
      SELECT 1 FROM public.player_group_coaches pgc
      WHERE pgc.group_id = players.group_id
        AND pgc.coach_id = public.ansa_current_coach_id()
    )
  );

DROP POLICY IF EXISTS "Coaches update scoped players" ON public.players;
CREATE POLICY "Coaches update scoped players"
  ON public.players FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND EXISTS (
      SELECT 1 FROM public.player_group_coaches pgc
      WHERE pgc.group_id = players.group_id
        AND pgc.coach_id = public.ansa_current_coach_id()
    )
  );
