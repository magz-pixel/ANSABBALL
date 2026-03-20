-- Full ANSA Dashboard Schema (run this if user_role doesn't exist yet)
-- Creates everything from scratch: user_role, users, approval flow, and all dashboard tables

-- 1. Create user_role enum (includes coach from the start)
CREATE TYPE user_role AS ENUM ('admin', 'parent', 'player', 'coach');

-- 2. Create users table (extends auth.users with role)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'player',
  full_name TEXT,
  avatar_url TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. Coaches table
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

-- 4. Player groups
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

-- 5. Players
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INT,
  gender TEXT,
  school TEXT,
  photo_url TEXT,
  parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  player_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

CREATE POLICY "Player reads own profile"
  ON public.players FOR SELECT
  USING (player_user_id = auth.uid());

-- 6. Attendance
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

-- 7. Progress logs
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

-- 8. Journal entries
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

-- 9. Goals
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

-- 10. Announcements
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
