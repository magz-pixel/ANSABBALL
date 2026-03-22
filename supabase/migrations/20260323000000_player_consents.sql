-- Signed participation consent per player (versioned)

CREATE TABLE IF NOT EXISTS public.player_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signer_printed_name TEXT NOT NULL,
  signer_relationship TEXT NOT NULL CHECK (signer_relationship IN ('self', 'parent_guardian', 'other')),
  signer_relationship_other TEXT,
  accepted_terms BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT player_consents_unique_version UNIQUE (player_id, consent_version)
);

CREATE INDEX IF NOT EXISTS idx_player_consents_player ON public.player_consents(player_id);
CREATE INDEX IF NOT EXISTS idx_player_consents_signed ON public.player_consents(signed_at DESC);

ALTER TABLE public.player_consents ENABLE ROW LEVEL SECURITY;

-- Read: staff, linked parent, or the player linked to this row
CREATE POLICY "player_consents_select_staff"
  ON public.player_consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "player_consents_select_parent"
  ON public.player_consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = player_consents.player_id AND p.parent_id = auth.uid()
    )
  );

CREATE POLICY "player_consents_select_self_player"
  ON public.player_consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = player_consents.player_id AND p.player_user_id = auth.uid()
    )
  );

CREATE POLICY "player_consents_select_signer"
  ON public.player_consents FOR SELECT
  USING (signer_user_id = auth.uid());

-- Insert: player (own row) or parent (linked child)
CREATE POLICY "player_consents_insert_player"
  ON public.player_consents FOR INSERT
  WITH CHECK (
    signer_user_id = auth.uid()
    AND accepted_terms = TRUE
    AND EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = player_id
        AND (
          p.player_user_id = auth.uid()
          OR p.parent_id = auth.uid()
        )
    )
  );

-- No update/delete from clients (immutable record); service role can manage if needed
