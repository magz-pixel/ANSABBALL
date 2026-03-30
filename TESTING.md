# ANSA Dashboard – Testing Guide

## Production / client handover

- **`supabase/seed.sql`** only ensures default **player groups** (Juniors / Seniors) when the table is empty. It does **not** insert players, coaches, attendance, progress, announcements, or journal data.
- The former full test seed script has been **removed** from the repo. Use real accounts and the dashboard to build your dataset.

## 1. Verify roles in Supabase

In **Supabase → Table Editor → public.users**, confirm:

- Admin account: `role` = `admin`, `approval_status` = `approved`
- Parent account: `role` = `parent`, `approval_status` = `approved`

The sidebar shows a role badge (e.g. **admin** or **parent**) so you can confirm which role you’re logged in as.

## 2. Optional: default groups only

If `player_groups` is empty, run **`supabase/seed.sql`** in the SQL Editor once. This creates Juniors and Seniors groups only.

## 3. Menu differences

- **Admin**: Dashboard Home, Players, Attendance, Progress, Groups, Coaches, Announcements, Approvals, Profile
- **Parent**: Dashboard Home, My Children, Announcements, Profile

If both menus look the same, check the `role` column in `public.users` for each account.

## 4. Test flows (with real data)

### Admin

1. Sign in as admin
2. **Players**: Add players and assign groups
3. **Coaches**: Link coach profiles to approved users as needed
4. **Attendance** / **Progress** / **Announcements**: Exercise each flow with real or test accounts you create

### Parent

1. Sign in as parent
2. **Dashboard Home** / **My Children**: Children appear after they are linked to your account in **Players**

### Player

1. Sign in as player (requires a row in `players` with `player_user_id` set to that user’s id)
2. **My Profile**, **Journal**, **Goals**, **Announcements**

## 5. If pages are blank

- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local` (where required)
- Restart the dev server
- Sign out and sign back in
