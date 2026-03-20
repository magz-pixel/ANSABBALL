# ANSA Basketball Academy

A Next.js 14+ web application for ANSA Basketball Academy, built with TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Button, etc.)
- **Backend:** Supabase (Auth, Database, Storage)

## Project Structure

```
ansa-basketball-academy/
├── app/
│   ├── auth/           # Auth pages (login, register, callback)
│   ├── about/          # About page
│   ├── programs/       # Programs page
│   ├── scholarships/   # Scholarships page
│   ├── merchandise/    # Store (shoes, kits, gear) + cart + M-Pesa checkout
│   ├── dashboard/      # Protected dashboard
│   ├── layout.tsx      # Root layout with Navbar
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles + Tailwind theme
├── components/
│   ├── ui/             # shadcn/ui components
│   └── navbar.tsx     # Responsive navigation
├── lib/
│   ├── supabase/       # Supabase client (browser, server, middleware)
│   ├── supabase.ts     # Re-exports
│   └── utils.ts        # cn() utility for Tailwind
├── types/
│   └── index.ts        # User, UserRole, Database types
├── supabase/
│   └── migrations/     # SQL migrations for users table
└── middleware.ts       # Auth session refresh
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local`
3. Add your Supabase URL and anon key from **Settings > API**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run database migrations

In the Supabase SQL Editor, run migrations in order — including `20260321000000_player_evaluations.sql` for formal **player evaluations** (1–5 rubric + scores).

### 4. Enable Google OAuth (optional)

In Supabase Dashboard: **Authentication > Providers > Google** — enable and add your Google OAuth credentials.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Auth:** Email/password + Google OAuth via Supabase Auth
- **Password:** Change password on **Dashboard → Profile**; **Forgot password?** on login sends a Supabase reset email
- **Roles:** `admin`, `coach`, `parent`, `player` (stored in `public.users`)
- **Player evaluations:** Full 1–5 rubric (shooting, dribbling, passing, defense, rebounding, athletic, game play, coachability) — matches the ANSA paper-style form; category radar + PDF
- **Player PDF reports:** Staff and linked parents — evaluation layout + attendance (`GET /api/players/[id]/report`)
- **Merchandise:** Store, cart, M-Pesa checkout instructions
- **Design:** Dark navy (#001F3F) primary, accent blue (#0066CC), white background
- **Responsive:** Mobile-first Navbar with hamburger menu

## Deploy to Vercel

See **[docs/VERCEL.md](./docs/VERCEL.md)** for env vars, Supabase redirect URLs, and Git push steps.

## Mobile & browsers

See **[docs/MOBILE_AND_BROWSER.md](./docs/MOBILE_AND_BROWSER.md)** — responsive dashboard drawer, touch targets, overflow fixes.

## Photos & store images

**Homepage & programs:** academy photos in **`public/`** (hero, gallery, banners). **Store:** product photos are defined in **`lib/merchandise.ts`** (stock images by default; swap for your own shots under `public/`). See **[docs/SITE_IMAGES.md](./docs/SITE_IMAGES.md)**.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/about` | About ANSA |
| `/programs` | Programs |
| `/scholarships` | Scholarships |
| `/merchandise` | Store (basketball shoes, kits, gear) |
| `/merchandise/cart` | Shopping cart |
| `/merchandise/checkout` | M-Pesa instructions + order form |
| `/auth/login` | Login |
| `/auth/register` | Sign up |
| `/dashboard` | Protected dashboard (requires auth) |
