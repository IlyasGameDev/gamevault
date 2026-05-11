# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (Next.js Turbopack)
npm run build    # production build + TypeScript check
npm run start    # serve production build
npm run lint     # ESLint
```

There are no tests. `npm run build` is the primary correctness check — it runs TypeScript and generates all 27 routes.

## Architecture Overview

**GameVault** is a Next.js 16 (App Router) browser gaming platform. Users browse/play/rate/favorite games; admins manage content through a dedicated dashboard. Backend is entirely Supabase (Postgres + Auth + Storage).

### Route Groups

The app uses three route groups with different layout shells:

| Group | Layout | Routes |
|---|---|---|
| `(site)` | Navbar + Footer | `/` homepage, `/profile` |
| `(public)` | Navbar + Footer | `/games`, `/games/[slug]`, `/categories`, `/search` |
| `(auth)` | Bare (no nav) | `/login`, `/register`, `/callback` |
| `admin` | Admin sidebar + topbar | `/admin/**` |

The root `src/app/layout.tsx` only provides `<html>/<body>` and the Toast provider — it renders no navigation itself.

### Supabase Client Pattern

There are **three distinct clients** — always use the right one:

- **`src/lib/supabase/client.ts`** — `createClient()` — browser-only, for `'use client'` components and hooks. Uses the anon key.
- **`src/lib/supabase/server.ts`** — `createServerSupabaseClient()` — async, for Server Components and API routes. Reads/writes cookies for session.
- **`src/lib/supabase/admin.ts`** — `supabaseAdmin` — service role key, bypasses RLS. Used in API routes for admin operations and in Server Components that need to read unpublished data. It's a lazy Proxy — the real client is only instantiated on first use (avoids URL validation errors during `next build`).

### Auth & Role System

- Auth state lives in `src/hooks/useAuth.ts` — returns `{ user, profile, loading, signOut, isAdmin }`. `isAdmin` is `profile.role === 'admin'`.
- Route protection is in `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`, export must be named `proxy`, not `middleware`). Redirects unauthenticated users away from `/admin/**` and `/profile`.
- API routes do their own auth check via `createServerSupabaseClient()`. Admin-only API routes check `profile.role === 'admin'` after confirming the user is logged in.
- To grant admin: `UPDATE profiles SET role = 'admin' WHERE username = 'xyz';` in Supabase SQL editor.

### Database Schema

Tables: `profiles`, `categories`, `games`, `game_categories` (join), `ratings`, `comments`, `favorites`, `play_history`. Full schema in `supabase/schema.sql`.

Key design points:
- `profiles` extends `auth.users` via a trigger (`handle_new_user`) that auto-creates a row on signup.
- `games.rating_avg` and `games.rating_count` are denormalized — kept in sync by the `update_game_rating` trigger on the `ratings` table.
- `games.play_count` is incremented via the `increment_play_count(game_uuid)` RPC function, called from `/api/games/play`.
- All tables have RLS enabled. `supabaseAdmin` bypasses RLS; `createServerSupabaseClient()` respects it.

### Game Types

Games are either `iframe` (external URL embedded) or `hosted` (ZIP uploaded, extracted to Supabase Storage). For hosted games, the iframe `src` is constructed as:
```
{SUPABASE_URL}/storage/v1/object/public/games/{game_file_path}/{game_entry_file}
```

The upload flow (`/api/upload`) uses `adm-zip` to extract ZIPs server-side and upload every file to the `games` bucket under `games/{slug}/`. It auto-detects `index.html` as the entry point.

### API Route Conventions

All API routes return `{ data, error, message }`. Pattern:
1. `createServerSupabaseClient()` to check auth
2. Check `profile.role` for admin routes
3. Validate body with Zod schema from `src/lib/validations.ts`
4. Run DB operation (use `supabaseAdmin` for writes needing to bypass RLS)
5. Return `NextResponse.json(...)`

Rate limiting (`src/lib/rateLimit.ts`) is in-memory sliding window — applied to comments (5/min), ratings (20/min), uploads (10/10min). It resets per serverless instance; replace with Upstash Redis for true multi-instance limiting.

User-submitted text (comment content, game title/description) passes through `sanitize()` from `src/lib/utils.ts` before being stored.

### Server vs Client Components

Server Components are the default. `'use client'` is only on:
- All hooks (`src/hooks/`)
- Interactive components: `GamePlayer`, `GameRating`, `GameComments`, `GameActions`, `FeaturedCarousel`, `CategoryFilter`, `AllGamesSection`, `Navbar`, `GameForm`, `FileUploader`, auth forms, admin pages that need `useState`.
- Page-level client components when URL params/search state is needed (browse, search pages).

Server Components that need Supabase data call `supabaseAdmin` directly (for ISR-cached pages like game pages: `export const revalidate = 3600`).

### Joined Query Pattern

Supabase doesn't return flat joined data. The `categories` join comes back as `[{ category: {...} }]`. Every place that fetches games must unwrap it:
```ts
categories: ((g.categories as { category: unknown }[]) ?? []).map((gc) => gc.category)
```
This pattern repeats throughout — always apply it when selecting `game_categories(category:categories(*))`.

### Key Files

- `src/lib/types/database.ts` — all TypeScript types; `GameWithCategories` is `Game & { categories: Category[] }`
- `src/lib/validations.ts` — Zod schemas for all API inputs
- `src/lib/constants.ts` — `GAMES_PER_PAGE` (24), `COMMENTS_PER_PAGE` (20), `MAX_UPLOAD_SIZE_MB` (50)
- `supabase/schema.sql` — full DB schema; run in Supabase SQL Editor to set up a new project

### Storage Bucket

Single bucket named `games` (public). Paths used:
- `thumbnails/{slug}/{timestamp}_{filename}` — game thumbnails
- `covers/{slug}/{timestamp}_{filename}` — banner images
- `games/{slug}/{file}` — hosted game files (extracted from ZIP)
- `avatars/{user_id}.{ext}` — profile avatars

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never exposed to client
NEXT_PUBLIC_SITE_URL=
```

### Deployment

- Hosted on Vercel. Deploy: `vercel --prod --yes` from the `gamevault/` directory.
- Live URL: https://gamevault-umber.vercel.app
- GitHub: https://github.com/IlyasGameDev/gamevault (different account from Vercel — auto-deploy is not configured; deploy manually via CLI).
- After deploying, update `NEXT_PUBLIC_SITE_URL` in Vercel env vars if the domain changes.
- Set Supabase Auth → URL Configuration → Site URL + Redirect URLs to match the Vercel domain for OAuth to work.
