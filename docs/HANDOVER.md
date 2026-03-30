# Client handover (production ready)

This checklist helps you hand over the ANSA app to a client with a clean database and the correct admin account.

## 1) Backup first (do this before any deletes)

- Supabase Dashboard → **Project Settings** → **Database** → take a backup (or use your usual backup flow).

## 2) Remove dummy / test data (public tables)

If you have demo players, parents, coaches, attendance, progress logs, etc. in the production database:

1. Supabase Dashboard → **SQL Editor**
2. Run `supabase/cleanup_handover.sql`

What it does:
- Deletes operational rows (players, coaches, attendance, progress, journal, goals, announcements, evaluations, consent)
- Keeps `player_groups` (so Juniors/Seniors remain)

## 3) Transfer admin access to the client

### Create the client user in Auth

Supabase Dashboard → **Authentication** → **Users**

- Create/invite the client with their email.
- Let the client set their own password via email invite / reset.

### Promote to admin in `public.users`

After the Auth user exists, open **Table Editor** → `public.users` and set:

- `role` = `admin`
- `approval_status` = `approved`
- `full_name` = client name (optional)

If you prefer SQL:

```sql
update public.users
set role = 'admin', approval_status = 'approved'
where email = 'Brianwabwire114@gmail.com';
```

## 4) Remove your own admin (recommended)

Once the client can sign in and see the Admin dashboard:

- Supabase Dashboard → **Authentication** → **Users** → delete/disable your old admin Auth user
- Table Editor → `public.users` → remove the matching row (if not cascade-deleted)

## 5) Rotate secrets (recommended)

If you shared any keys during development, rotate them:

- Supabase **service role key** (if used)
- Any external API keys
- Vercel environment variables (update values and redeploy)

## 6) Final smoke checks

- Client can log in and sees **Admin** dashboard
- Parent signups show **Pending approval** correctly
- Creating a player works and uploads a passport photo
- Store loads and checkout flow works

