# Deploy ANSA to Vercel

## 1. Push code to GitHub

```bash
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

## 2. Import project on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import the repo.
2. **Framework Preset:** Next.js (auto-detected).
3. **Root directory:** repo root (where `package.json` lives).

## 3. Environment variables

In **Project → Settings → Environment Variables**, add (for **Production**, **Preview**, and **Development** as needed):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase → Settings → API → `anon` `public` key |

Optional (only if your app uses server-side admin operations):

| Name | Value |
|------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase → Settings → API → `service_role` (keep secret; never expose to the browser) |

Redeploy after changing env vars.

## 4. Supabase: URLs for production

In **Supabase → Authentication → URL Configuration**:

- **Site URL:** `https://YOUR-PROJECT.vercel.app` (or your custom domain).
- **Redirect URLs:** add:
  - `https://YOUR-PROJECT.vercel.app/auth/callback`
  - `https://YOUR-PROJECT.vercel.app/**` (or list specific auth routes)

Required for **Google OAuth**, **email magic links**, and **password reset** emails.

## 5. Google OAuth (if used)

**Google Cloud Console** → OAuth client → **Authorized redirect URIs** must include:

`https://<your-supabase-ref>.supabase.co/auth/v1/callback`

(That’s Supabase’s callback, not Vercel — usually already set.)

## 6. Deploy

Merge to `main` or click **Deploy** in Vercel. Your demo URL will be `https://<project>.vercel.app`.

## Troubleshooting

- **Auth redirect errors:** Site URL and redirect allowlist in Supabase must match the Vercel URL exactly (`https`, no trailing slash mismatch).
- **PDF reports fail on build:** If needed, add `serverExternalPackages` for `@react-pdf/*` packages in `next.config.ts` (see README or earlier notes).
