-- ANSA Basketball Academy - Full Test Data (2+ months of usage)
-- Run in Supabase SQL Editor. Requires: 1 admin, 1 parent, 1 player in public.users

DO $$
DECLARE
  v_admin_id UUID;
  v_parent_id UUID;
  v_player_user_id UUID;
  v_junior_id UUID;
  v_senior_id UUID;
  v_u14_id UUID;
  v_player_ids UUID[] := '{}';
  v_p UUID;
  v_d DATE;
  v_skills TEXT[] := ARRAY['dribbling','shooting','defense','free_throws','vertical','passing'];
  v_s TEXT;
  v_i INT;
BEGIN
  SELECT id INTO v_admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
  SELECT id INTO v_parent_id FROM public.users WHERE role = 'parent' AND approval_status = 'approved' LIMIT 1;
  SELECT id INTO v_player_user_id FROM public.users WHERE role = 'player' AND approval_status = 'approved' LIMIT 1;

  -- 1. Groups
  IF NOT EXISTS (SELECT 1 FROM public.player_groups WHERE name = 'Under-14 Elite') THEN
    INSERT INTO public.player_groups (name) VALUES ('Under-14 Elite');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.player_groups WHERE name = 'Juniors (8-12)') THEN
    INSERT INTO public.player_groups (name) VALUES ('Juniors (8-12)');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.player_groups WHERE name = 'Seniors (13-17)') THEN
    INSERT INTO public.player_groups (name) VALUES ('Seniors (13-17)');
  END IF;
  SELECT id INTO v_junior_id FROM public.player_groups WHERE name = 'Juniors (8-12)' LIMIT 1;
  SELECT id INTO v_senior_id FROM public.player_groups WHERE name = 'Seniors (13-17)' LIMIT 1;
  SELECT id INTO v_u14_id FROM public.player_groups WHERE name = 'Under-14 Elite' LIMIT 1;

  -- 2. Coach for admin
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.coaches (user_id, bio)
    VALUES (v_admin_id, 'ANSA Academy Head Coach • 10+ years experience')
    ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio;
  END IF;

  -- 3. Players (18 total) - link some to parent, one to player user (skip if already populated)
  IF (SELECT count(*) FROM public.players) < 15 THEN
  INSERT INTO public.players (name, age, gender, school, position, parent_id, player_user_id, group_id, status, payment_status, join_date) VALUES
    ('James Omondi', 10, 'M', 'St. Mary''s Academy', 'Point Guard', v_parent_id, NULL, v_junior_id, 'active', 'paid', CURRENT_DATE - 75),
    ('Grace Akinyi', 14, 'F', 'Nairobi School', 'Shooting Guard', v_parent_id, NULL, v_senior_id, 'active', 'paid', CURRENT_DATE - 68),
    ('Peter Kamau', 11, 'M', 'Alliance High', 'Small Forward', v_parent_id, NULL, v_junior_id, 'active', 'paid', CURRENT_DATE - 60),
    ('Mary Wanjiku', 15, 'F', 'State House Girls', 'Power Forward', NULL, NULL, v_senior_id, 'active', 'paid', CURRENT_DATE - 55),
    ('David Otieno', 9, 'M', 'Primary Academy', 'Center', NULL, NULL, v_junior_id, 'active', 'paid', CURRENT_DATE - 50),
    ('Sarah Muthoni', 13, 'F', 'Precious Blood', 'Point Guard', NULL, NULL, v_u14_id, 'active', 'paid', CURRENT_DATE - 45),
    ('Kevin Ochieng', 12, 'M', 'Starehe Boys', 'Shooting Guard', NULL, NULL, v_junior_id, 'active', 'pending', CURRENT_DATE - 40),
    ('Lucy Njeri', 16, 'F', 'Kenya High', 'Small Forward', NULL, NULL, v_senior_id, 'active', 'paid', CURRENT_DATE - 35),
    ('Brian Kipchoge', 10, 'M', 'Brookhouse', 'Point Guard', NULL, NULL, v_junior_id, 'active', 'paid', CURRENT_DATE - 30),
    ('Emma Wambui', 14, 'F', 'Moi Girls', 'Center', NULL, NULL, v_senior_id, 'active', 'paid', CURRENT_DATE - 25),
    ('Daniel Mutua', 11, 'M', 'Alliance High', 'Power Forward', NULL, NULL, v_junior_id, 'active', 'paid', CURRENT_DATE - 20),
    ('Joy Achieng', 15, 'F', 'Nairobi School', 'Shooting Guard', NULL, NULL, v_senior_id, 'active', 'paid', CURRENT_DATE - 18),
    ('Michael Odhiambo', 13, 'M', 'St. Mary''s', 'Small Forward', NULL, NULL, v_u14_id, 'active', 'paid', CURRENT_DATE - 15),
    ('Faith Chebet', 12, 'F', 'State House', 'Point Guard', NULL, NULL, v_junior_id, 'active', 'paid', CURRENT_DATE - 12),
    ('Victor Omondi', 14, 'M', 'Strathmore', 'Center', NULL, NULL, v_senior_id, 'active', 'paid', CURRENT_DATE - 10),
    ('Hannah Wanjiru', 11, 'F', 'Precious Blood', 'Shooting Guard', NULL, NULL, v_junior_id, 'active', 'paid', CURRENT_DATE - 8)
  ;
  -- Link player user to a player if they don't have one (use unlinked player, not parent's child)
  IF v_player_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.players WHERE player_user_id = v_player_user_id) THEN
    UPDATE public.players SET player_user_id = v_player_user_id
    WHERE id = (SELECT id FROM public.players WHERE player_user_id IS NULL AND parent_id IS NULL ORDER BY created_at LIMIT 1);
  END IF;
  END IF;

  -- Get player IDs for attendance and progress
  SELECT COALESCE(ARRAY_AGG(id), '{}') INTO v_player_ids FROM (SELECT id FROM public.players WHERE status = 'active' LIMIT 12) s;

  -- 4. Attendance - sessions over ~10 weeks (Mon/Wed/Fri pattern)
  IF array_length(v_player_ids, 1) > 0 THEN
  FOR v_i IN 1..30 LOOP
    v_d := CURRENT_DATE - (v_i * 2);
    IF EXTRACT(DOW FROM v_d) IN (1,3,5) THEN
      FOR v_p IN SELECT unnest(v_player_ids)
      LOOP
        INSERT INTO public.attendance (session_date, player_id, present, notes)
        VALUES (v_d, v_p, random() > 0.1, CASE WHEN random() > 0.9 THEN 'Great energy' ELSE NULL END)
        ON CONFLICT (session_date, player_id) DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;
  END IF;

  -- 5. Progress logs - 2-3 months of data, all 6 skills (skip if already have many)
  IF (SELECT count(*) FROM public.progress_logs) < 100 AND array_length(v_player_ids, 1) > 0 THEN
  FOR v_p IN SELECT unnest(v_player_ids)
  LOOP
    FOR v_i IN 1..8 LOOP
      v_d := CURRENT_DATE - (v_i * 7);
      FOREACH v_s IN ARRAY v_skills
      LOOP
        INSERT INTO public.progress_logs (player_id, date, skill, value, coach_notes)
        VALUES (
          v_p,
          v_d,
          v_s,
          LEAST(10, GREATEST(3, 4 + (v_i % 3) + floor(random() * 2)::int)),
          CASE WHEN random() > 0.6 THEN 'Good progress' WHEN random() > 0.85 THEN 'Focus on form' ELSE NULL END
        );
      END LOOP;
    END LOOP;
  END LOOP;
  END IF;

  -- 6. Journal entries (for player with player_user_id)
  IF v_player_user_id IS NOT NULL THEN
    v_p := (SELECT id FROM public.players WHERE player_user_id = v_player_user_id LIMIT 1);
    IF v_p IS NOT NULL AND (SELECT count(*) FROM public.journal_entries WHERE player_id = v_p) < 3 THEN
      INSERT INTO public.journal_entries (player_id, date, entry) VALUES
        (v_p, CURRENT_DATE - 2, 'Practiced free throws for 30 mins. Hit 15/20. Need to work on consistency.'),
        (v_p, CURRENT_DATE - 5, 'Drills with dad in the backyard. Working on left-hand dribbling.'),
        (v_p, CURRENT_DATE - 9, 'Watched NBA highlights. Studying Curry''s shooting form.'),
        (v_p, CURRENT_DATE - 14, 'Ran 2km to build stamina. Felt good.'),
        (v_p, CURRENT_DATE - 18, 'Home workout - core and legs. Coach said to strengthen lower body.'),
        (v_p, CURRENT_DATE - 23, 'Practiced 3-pointers. Making progress!'),
        (v_p, CURRENT_DATE - 30, 'First journal entry. Excited for the season!');
    END IF;
  END IF;

  -- 7. Goals (for player with player_user_id)
  IF v_player_user_id IS NOT NULL THEN
    v_p := (SELECT id FROM public.players WHERE player_user_id = v_player_user_id LIMIT 1);
    IF v_p IS NOT NULL AND (SELECT count(*) FROM public.goals WHERE player_id = v_p) < 3 THEN
      INSERT INTO public.goals (player_id, title, target, current, completed) VALUES
        (v_p, 'Make 50 free throws in a row', 50, 32, false),
        (v_p, 'Improve vertical jump by 5cm', 5, 3, false),
        (v_p, 'Run 5km under 25 mins', 1, 1, true),
        (v_p, '100 left-hand dribbles daily', 7, 5, false),
        (v_p, 'Attend 20 sessions', 20, 18, false);
    END IF;
  END IF;

  -- 8. Goals for parent's children too
  v_p := (SELECT id FROM public.players WHERE parent_id = v_parent_id AND name = 'James Omondi' LIMIT 1);
  IF v_p IS NOT NULL AND (SELECT count(*) FROM public.goals WHERE player_id = v_p) < 2 THEN
    INSERT INTO public.goals (player_id, title, target, current, completed) VALUES
      (v_p, 'Master crossover dribble', 10, 6, false),
      (v_p, 'Score 10 points in a game', 1, 1, true);
  END IF;

  -- 9. Announcements (spread over 2 months) - skip if already have many
  IF (SELECT count(*) FROM public.announcements) < 5 THEN
  INSERT INTO public.announcements (title, content, date, author_id) VALUES
    ('Welcome to ANSA Academy 2025', 'We are excited to start the new season! All sessions begin next week. Bring your best energy and a water bottle. See you on the court!', CURRENT_DATE - 60, v_admin_id),
    ('Tournament Registration Open', 'The Nairobi Youth Basketball Tournament is open for registration. Sign up by end of month. Limited slots!', CURRENT_DATE - 55, v_admin_id),
    ('Holiday Camp Dates', 'Our holiday camp runs Dec 15–20. Focus on fundamentals and game strategy. Limited slots available.', CURRENT_DATE - 45, v_admin_id),
    ('New Coach Joining', 'We welcome Coach Sarah to the team. She will be leading the Seniors group starting next week.', CURRENT_DATE - 35, v_admin_id),
    ('M-Pesa Payment Details', 'Fees can now be paid via M-Pesa. Paybill: 123456, Account: ANSA. Include player name as reference.', CURRENT_DATE - 28, v_admin_id),
    ('Session Time Change', 'Wednesday sessions will now run 4–6pm instead of 3–5pm. Effective next week.', CURRENT_DATE - 21, v_admin_id),
    ('Tournament Draw', 'Tournament brackets are out! Check the notice board. First games this Saturday.', CURRENT_DATE - 14, v_admin_id),
    ('Scholarship Applications', 'ANSA scholarship applications for next term are open. Deadline: end of month. See Coach Brian.', CURRENT_DATE - 7, v_admin_id),
    ('End of Term Celebration', 'Join us this Friday for our end-of-term celebration. Trophies, certificates, and refreshments!', CURRENT_DATE - 2, v_admin_id);

  END IF;

  RAISE NOTICE 'Full test data seeded. Admin: %, Parent: %, Player: %', v_admin_id, v_parent_id, v_player_user_id;
END $$;
