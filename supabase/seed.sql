-- ANSA Basketball Academy - Seed Data for Testing
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Make sure you have at least one admin and one parent in public.users first

DO $$
DECLARE
  v_admin_id UUID;
  v_parent_id UUID;
  v_junior_id UUID;
  v_senior_id UUID;
  v_player1 UUID;
  v_player2 UUID;
  v_player3 UUID;
  v_coach_id UUID;
BEGIN
  -- Get first admin and parent
  SELECT id INTO v_admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
  SELECT id INTO v_parent_id FROM public.users WHERE role = 'parent' LIMIT 1;

  -- 1. Create player groups (skip if already exist)
  IF NOT EXISTS (SELECT 1 FROM public.player_groups LIMIT 1) THEN
    INSERT INTO public.player_groups (name) VALUES
      ('Juniors (8-12)'),
      ('Seniors (13-17)');
  END IF;

  SELECT id INTO v_junior_id FROM public.player_groups WHERE name = 'Juniors (8-12)' LIMIT 1;
  SELECT id INTO v_senior_id FROM public.player_groups WHERE name = 'Seniors (13-17)' LIMIT 1;

  -- 2. Create coach record for admin (if admin exists)
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.coaches (user_id, bio)
    VALUES (v_admin_id, 'ANSA Academy Head Coach')
    ON CONFLICT (user_id) DO NOTHING;
    SELECT id INTO v_coach_id FROM public.coaches WHERE user_id = v_admin_id LIMIT 1;
  END IF;

  -- 3. Create sample players (link 2 to parent if parent exists)
  IF NOT EXISTS (SELECT 1 FROM public.players WHERE name = 'James Omondi' LIMIT 1) THEN
    INSERT INTO public.players (name, age, gender, school, parent_id, group_id, status, payment_status) VALUES
      ('James Omondi', 10, 'M', 'St. Mary''s Academy', v_parent_id, v_junior_id, 'active', 'paid'),
      ('Grace Akinyi', 14, 'F', 'Nairobi School', v_parent_id, v_senior_id, 'active', 'paid'),
      ('Peter Kamau', 11, 'M', 'Alliance High', NULL, v_junior_id, 'active', 'pending'),
      ('Mary Wanjiku', 15, 'F', 'State House Girls', NULL, v_senior_id, 'active', 'paid'),
      ('David Otieno', 9, 'M', 'Primary Academy', NULL, v_junior_id, 'pending', 'pending');
  END IF;

  SELECT id INTO v_player1 FROM public.players WHERE name = 'James Omondi' LIMIT 1;
  SELECT id INTO v_player2 FROM public.players WHERE name = 'Grace Akinyi' LIMIT 1;
  SELECT id INTO v_player3 FROM public.players WHERE name = 'Peter Kamau' LIMIT 1;

  -- 4. Create attendance for today (only if players exist)
  IF v_player1 IS NOT NULL AND v_player2 IS NOT NULL AND v_player3 IS NOT NULL THEN
    INSERT INTO public.attendance (session_date, player_id, present, notes) VALUES
      (CURRENT_DATE, v_player1, true, NULL),
      (CURRENT_DATE, v_player2, true, NULL),
      (CURRENT_DATE, v_player3, false, 'Sick')
    ON CONFLICT (session_date, player_id) DO UPDATE SET present = EXCLUDED.present, notes = EXCLUDED.notes;
  END IF;

  -- 5. Create progress logs
  IF NOT EXISTS (SELECT 1 FROM public.progress_logs LIMIT 1) AND v_player1 IS NOT NULL AND v_player2 IS NOT NULL AND v_player3 IS NOT NULL THEN
    INSERT INTO public.progress_logs (player_id, date, skill, value, coach_notes) VALUES
      (v_player1, CURRENT_DATE - 7, 'Shooting', 7, 'Good form, keep practicing'),
      (v_player1, CURRENT_DATE - 7, 'Dribbling', 6, NULL),
      (v_player2, CURRENT_DATE - 3, 'Defense', 8, 'Excellent footwork'),
      (v_player3, CURRENT_DATE - 5, 'Passing', 5, 'Needs more accuracy');
  END IF;

  -- 6. Create announcements
  IF NOT EXISTS (SELECT 1 FROM public.announcements LIMIT 1) THEN
    INSERT INTO public.announcements (title, content, date, author_id) VALUES
      ('Welcome to ANSA Academy 2025', 'We are excited to start the new season. All sessions begin next week. Bring your best energy!', CURRENT_DATE, v_admin_id),
      ('Tournament Registration Open', 'The Nairobi Youth Basketball Tournament is open for registration. Sign up by end of month.', CURRENT_DATE - 2, v_admin_id),
      ('Holiday Camp Dates', 'Our holiday camp runs Dec 15–20. Limited slots available.', CURRENT_DATE - 5, v_admin_id);
  END IF;

  RAISE NOTICE 'Seed data inserted successfully. Admin: %, Parent: %', v_admin_id, v_parent_id;
END $$;
