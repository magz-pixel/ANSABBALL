-- Coach profile photo, self-service coach row insert, and group-scoped coach access (RLS).
-- Admins retain full access; coaches only manage players/attendance/progress/evaluations for their assigned groups.

-- 1) Coach photo (shown on staff list / profile)
ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2) Helpers (SECURITY DEFINER so RLS policies can use them safely)
CREATE OR REPLACE FUNCTION public.ansa_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.ansa_current_coach_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id
  FROM public.coaches c
  WHERE c.user_id = auth.uid()
  LIMIT 1;
$$;

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
    INNER JOIN public.player_groups g ON g.id = pl.group_id
    WHERE pl.id = p_player_id
      AND g.coach_id IS NOT NULL
      AND g.coach_id = public.ansa_current_coach_id()
  );
$$;

-- 3) Coaches: allow a coach user to create their own row once (signup / onboarding)
DROP POLICY IF EXISTS "Coaches insert own profile" ON public.coaches;
CREATE POLICY "Coaches insert own profile"
  ON public.coaches FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
  );

DROP POLICY IF EXISTS "Coaches update own profile" ON public.coaches;
CREATE POLICY "Coaches update own profile"
  ON public.coaches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4) Groups: only admins create / delete / assign coaches; everyone can still read groups
DROP POLICY IF EXISTS "Admin/coach manage groups" ON public.player_groups;
CREATE POLICY "Admins manage groups"
  ON public.player_groups FOR ALL
  USING (public.ansa_is_admin())
  WITH CHECK (public.ansa_is_admin());

-- 5) Players: replace blanket admin/coach policy with admin full + coach scoped
DROP POLICY IF EXISTS "Admin/coach full players" ON public.players;

CREATE POLICY "Admins full access players"
  ON public.players FOR ALL
  USING (public.ansa_is_admin())
  WITH CHECK (public.ansa_is_admin());

CREATE POLICY "Coaches select scoped players"
  ON public.players FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(id)
  );

CREATE POLICY "Coaches insert scoped players"
  ON public.players FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND EXISTS (
      SELECT 1 FROM public.player_groups g
      WHERE g.id = players.group_id
        AND g.coach_id = public.ansa_current_coach_id()
    )
  );

CREATE POLICY "Coaches update scoped players"
  ON public.players FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND EXISTS (
      SELECT 1 FROM public.player_groups g
      WHERE g.id = players.group_id
        AND g.coach_id = public.ansa_current_coach_id()
    )
  );

CREATE POLICY "Coaches delete scoped players"
  ON public.players FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(id)
  );

-- 6) Attendance
DROP POLICY IF EXISTS "Admin/coach manage attendance" ON public.attendance;

CREATE POLICY "Admins full access attendance"
  ON public.attendance FOR ALL
  USING (public.ansa_is_admin())
  WITH CHECK (public.ansa_is_admin());

CREATE POLICY "Coaches manage scoped attendance"
  ON public.attendance FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(player_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(player_id)
  );

-- 7) Progress logs
DROP POLICY IF EXISTS "Admin/coach manage progress" ON public.progress_logs;

CREATE POLICY "Admins full access progress_logs"
  ON public.progress_logs FOR ALL
  USING (public.ansa_is_admin())
  WITH CHECK (public.ansa_is_admin());

CREATE POLICY "Coaches manage scoped progress_logs"
  ON public.progress_logs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(player_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(player_id)
  );

-- 8) Goals
DROP POLICY IF EXISTS "Admin/coach manage goals" ON public.goals;

CREATE POLICY "Admins full access goals"
  ON public.goals FOR ALL
  USING (public.ansa_is_admin())
  WITH CHECK (public.ansa_is_admin());

CREATE POLICY "Coaches manage scoped goals"
  ON public.goals FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(player_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(player_id)
  );

-- 9) Journal: coaches only read journals for players in their groups
DROP POLICY IF EXISTS "Admin/coach read journal" ON public.journal_entries;

CREATE POLICY "Admins read all journal"
  ON public.journal_entries FOR SELECT
  USING (public.ansa_is_admin());

CREATE POLICY "Coaches read scoped journal"
  ON public.journal_entries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(player_id)
  );

-- 10) Player evaluations
DROP POLICY IF EXISTS "Admin coach manage player_evaluations" ON public.player_evaluations;

CREATE POLICY "Admins full access player_evaluations"
  ON public.player_evaluations FOR ALL
  USING (public.ansa_is_admin())
  WITH CHECK (public.ansa_is_admin());

CREATE POLICY "Coaches manage scoped player_evaluations"
  ON public.player_evaluations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(player_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND public.ansa_player_in_coach_scope(player_id)
    AND coach_user_id = auth.uid()
  );

-- 11) Evaluation scores
DROP POLICY IF EXISTS "Admin coach manage evaluation_scores" ON public.player_evaluation_scores;

CREATE POLICY "Admins full access evaluation_scores"
  ON public.player_evaluation_scores FOR ALL
  USING (public.ansa_is_admin())
  WITH CHECK (public.ansa_is_admin());

CREATE POLICY "Coaches manage scoped evaluation_scores"
  ON public.player_evaluation_scores FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND EXISTS (
      SELECT 1 FROM public.player_evaluations pe
      WHERE pe.id = evaluation_id
        AND public.ansa_player_in_coach_scope(pe.player_id)
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
    AND EXISTS (
      SELECT 1 FROM public.player_evaluations pe
      WHERE pe.id = evaluation_id
        AND public.ansa_player_in_coach_scope(pe.player_id)
    )
  );
