-- ANSA Basketball Academy — Production handover cleanup
-- Run in Supabase SQL Editor (recommended: in STAGING first).
--
-- Goal:
-- - Remove demo/test operational data (players, attendance, progress, etc.)
-- - Keep foundational config like player_groups (Juniors/Seniors)
-- - Optionally remove test profiles/users (commented; see docs/HANDOVER.md)
--
-- IMPORTANT
-- - This is destructive and cannot be undone without a backup.
-- - Take a database backup first.
-- - If you need to delete Auth users too, do that from Supabase Auth UI (or via admin API).

begin;

-- 1) Clear child tables first (FK-safe)
delete from public.attendance;
delete from public.progress_logs;
delete from public.journal_entries;
delete from public.goals;
delete from public.announcements;

-- Evaluations / consent (if present)
delete from public.player_evaluations;
delete from public.player_consents;

-- 2) Clear core entities (leaves player_groups intact)
delete from public.players;
delete from public.coaches;

-- 3) Optional: remove demo profiles from public.users (keeps Auth accounts)
-- Use this only if you created fake emails like "@example.com" in production.
-- delete from public.users where email ilike '%@example.com';

commit;

-- Notes:
-- - If you also want to wipe player groups, run:
--   delete from public.player_groups;
-- - If you deleted public.users rows but left auth.users, the signup trigger may recreate rows on next login.

