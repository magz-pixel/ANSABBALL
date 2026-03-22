# Player registration — what we collect

## 1. Account signup (`/auth/register`)

Collects:

| Field | Notes |
|-------|--------|
| **Full name** | Stored on the user profile |
| **Email** | Login; must be confirmed if email confirmation is enabled |
| **Password** | Auth only |
| **Role** | Parent / Player / Coach |

After signup, players go to the dashboard and complete **step 2** (player profile).

---

## 2. Player profile (`Complete Your Player Profile`)

After a player signs in, they fill this form **before** coach approval. Collects:

| Field | Required | Notes |
|-------|----------|--------|
| **Passport-style photo** | Recommended | Upload (JPEG/PNG/WebP, max 5MB) or optional image URL |
| **Full name** | Yes | As on roster |
| **Age** | Optional | |
| **Gender** | Optional | |
| **Height (cm)** | Optional | |
| **Weight (kg)** | Optional | |
| **Position** | Optional | Guard / Forward / Center options |
| **Enrollment** | Yes (choice) | Independent **or** school |
| **School name** | If school | |
| **Parent / guardian name** | Optional | |
| **Parent email** | Optional | If parent has an ANSA account, links profile |
| **Parent phone** | Optional | |

Photos are stored in Supabase Storage (`player-photos` bucket); `players.photo_url` holds the public URL.

---

## 3. Participation consent (`/dashboard/consent`)

After profile (and when linked as parent), users sign the **current** consent version (`lib/consent-copy.ts`). Stored in **`player_consents`**. PDF: **`GET /api/players/[id]/consent-pdf`**.

Run migration **`supabase/migrations/20260323000000_player_consents.sql`** on Supabase.

---

## For admins

Run the migration `20260322000000_player_photos_storage.sql` on the Supabase project if the bucket is missing.
