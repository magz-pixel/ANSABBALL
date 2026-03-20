-- ANSA player_evaluations and player_evaluation_scores (1-5 rubric)

CREATE TABLE IF NOT EXISTS public.player_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  evaluated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  coach_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  experience_summary TEXT,
  comments_recommendations TEXT,
  jersey_number TEXT,
  grade TEXT,
  height_cm INT,
  weight_kg INT,
  date_of_birth DATE,
  overall_strengths TEXT[] NOT NULL DEFAULT '{}',
  schema_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.player_evaluation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES public.player_evaluations(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  value SMALLINT NOT NULL CHECK (value >= 1 AND value <= 5),
  UNIQUE (evaluation_id, metric_key)
);

CREATE INDEX IF NOT EXISTS idx_player_evaluations_player_evaluated
  ON public.player_evaluations (player_id, evaluated_at DESC);

ALTER TABLE public.player_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_evaluation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin coach manage player_evaluations"
  ON public.player_evaluations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Parents read child evaluations"
  ON public.player_evaluations FOR SELECT
  USING (
    player_id IN (SELECT id FROM public.players WHERE parent_id = auth.uid())
  );

CREATE POLICY "Players read own evaluations"
  ON public.player_evaluations FOR SELECT
  USING (
    player_id IN (SELECT id FROM public.players WHERE player_user_id = auth.uid())
  );

CREATE POLICY "Admin coach manage evaluation_scores"
  ON public.player_evaluation_scores FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Parents read child evaluation_scores"
  ON public.player_evaluation_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.player_evaluations pe
      WHERE pe.id = evaluation_id
      AND pe.player_id IN (SELECT id FROM public.players WHERE parent_id = auth.uid())
    )
  );

CREATE POLICY "Players read own evaluation_scores"
  ON public.player_evaluation_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.player_evaluations pe
      WHERE pe.id = evaluation_id
      AND pe.player_id IN (SELECT id FROM public.players WHERE player_user_id = auth.uid())
    )
  );
