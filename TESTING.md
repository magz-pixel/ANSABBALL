# ANSA Dashboard – Testing Guide

## 0. Populate with full test data (2+ months of usage)

To load all pages with realistic data:

1. Ensure you have **admin**, **parent**, and **player** accounts in `public.users` (all approved).
2. Run **Supabase → SQL Editor → New Query**.
3. Paste the contents of `supabase/seed_full_test_data.sql`.
4. Run the query.

This adds:
- 16 players (3 linked to parent, 1 linked to player account)
- 3 groups, 9 announcements
- 8 weeks of attendance
- Progress logs for all 6 skills, spread over 2 months
- Journal entries and goals for the player account
- Goals for parent's children

## 1. Verify roles in Supabase

In **Supabase → Table Editor → public.users**, confirm:

- Admin account: `role` = `admin`, `approval_status` = `approved`
- Parent account: `role` = `parent`, `approval_status` = `approved`

The sidebar shows a role badge (e.g. **admin** or **parent**) so you can confirm which role you’re logged in as.

## 2. Menu differences

- **Admin**: Dashboard Home, Players, Attendance, Progress, Groups, Coaches, Announcements, Approvals, Profile
- **Parent**: Dashboard Home, My Children, Announcements, Profile

If both menus look the same, check the `role` column in `public.users` for each account.

## 3. Add seed data

1. Open **Supabase → SQL Editor → New Query**
2. Paste the contents of `supabase/seed.sql`
3. Run the query

This creates:

- 2 groups (Juniors, Seniors)
- 5 sample players (2 linked to the parent account)
- Attendance records
- Progress logs
- 3 announcements

## 4. Test flows

### Admin

1. Sign in as admin
2. **Dashboard Home**: Active Players, Pending Approvals, Recent Progress Logs
3. **Players**: List of players, Add Player
4. **Attendance**: Choose group and date, mark attendance
5. **Progress**: View/add progress logs
6. **Announcements**: View/create announcements
7. **Approvals**: Approve or reject pending users

### Parent

1. Sign in as parent
2. **Dashboard Home**: My Children cards, Announcements
3. **My Children**: Children linked to this parent (James Omondi, Grace Akinyi from seed)
4. **Announcements**: Shared announcements

### Player

1. Sign in as player (requires a player linked via `player_user_id` in `players`)
2. **My Profile**, **Journal**, **Goals**, **Announcements**

## 5. If pages are blank

- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Restart the dev server
- Sign out and sign back in
