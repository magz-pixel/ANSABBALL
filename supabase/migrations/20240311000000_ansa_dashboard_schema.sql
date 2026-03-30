-- ANSA Basketball Academy Dashboard Schema
-- Adds coach role, approval flow, and full dashboard tables

-- Add 'coach' to user_role enum
ALTER TYPE user_role ADD VALUE 'coach';

-- Add approval_status to users (admin approves before full access)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Coaches table
CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches read own"
  ON public.coaches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins/coaches read all coaches"
  ON public.coaches FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Admins manage coaches"
  ON public.coaches FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Player groups
CREATE TABLE IF NOT EXISTS public.player_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.player_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/coach manage groups"
  ON public.player_groups FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Parents/players read groups"
  ON public.player_groups FOR SELECT
  USING (true);

-- Players (payment_status: pending until M-Pesa/coach approval)
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INT,
  gender TEXT,
  school TEXT,
  photo_url TEXT,
  parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  group_id UUID REFERENCES public.player_groups(id) ON DELETE SET NULL,
  join_date DATE DEFAULT CURRENT_DATE,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/coach full players"
  ON public.players FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Parents read own children"
  ON public.players FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Players read own"
  ON public.players FOR SELECT
  USING (id IN (SELECT id FROM public.players WHERE parent_id = auth.uid()) OR false);

-- Fix: players read own - player role means they ARE a player. Need player_user_id.
-- Add player_user_id for when a player has their own login
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS player_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE POLICY "Player reads own profile"
  ON public.players FOR SELECT
  USING (player_user_id = auth.uid());

-- Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date DATE NOT NULL,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  present BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_date, player_id)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/coach manage attendance"
  ON public.attendance FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Parents read own children attendance"
  ON public.attendance FOR SELECT
  USING (
    player_id IN (SELECT id FROM public.players WHERE parent_id = auth.uid())
  );

CREATE POLICY "Players read own attendance"
  ON public.attendance FOR SELECT
  USING (
    player_id IN (SELECT id FROM public.players WHERE player_user_id = auth.uid())
  );

-- Progress logs
CREATE TABLE IF NOT EXISTS public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  skill TEXT NOT NULL,
  value NUMERIC NOT NULL CHECK (value >= 0 AND value <= 10),
  coach_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/coach manage progress"
  ON public.progress_logs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Parents read own children progress"
  ON public.progress_logs FOR SELECT
  USING (
    player_id IN (SELECT id FROM public.players WHERE parent_id = auth.uid())
  );

CREATE POLICY "Players read own progress"
  ON public.progress_logs FOR SELECT
  USING (
    player_id IN (SELECT id FROM public.players WHERE player_user_id = auth.uid())
  );

-- Journal entries (player home practice logs)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/coach read journal"
  ON public.journal_entries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Players insert own journal"
  ON public.journal_entries FOR INSERT
  WITH CHECK (
    player_id IN (SELECT id FROM public.players WHERE player_user_id = auth.uid())
  );

CREATE POLICY "Players read own journal"
  ON public.journal_entries FOR SELECT
  USING (
    player_id IN (SELECT id FROM public.players WHERE player_user_id = auth.uid())
  );

CREATE POLICY "Parents read own children journal"
  ON public.journal_entries FOR SELECT
  USING (
    player_id IN (SELECT id FROM public.players WHERE parent_id = auth.uid())
  );

-- Goals
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target NUMERIC NOT NULL,
  current NUMERIC NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/coach manage goals"
  ON public.goals FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Players manage own goals"
  ON public.goals FOR ALL
  USING (
    player_id IN (SELECT id FROM public.players WHERE player_user_id = auth.uid())
  );

CREATE POLICY "Parents read own children goals"
  ON public.goals FOR SELECT
  USING (
    player_id IN (SELECT id FROM public.players WHERE parent_id = auth.uid())
  );

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/coach manage announcements"
  ON public.announcements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Everyone read announcements"
  ON public.announcements FOR SELECT
  USING (true);

-- Storage bucket for player photos (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('player-photos', 'player-photos', true) ON CONFLICT DO NOTHING;
