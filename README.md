This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

GameVault's Vercel **Preview** environment uses the separate **GameVault Preview** Supabase project. Set the following variables for Preview, with no branch filter:

| Variable | Value from the preview project |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable API key |
| `SUPABASE_SECRET_KEY` | Server API key; store it as a Vercel Secret |

Keep Vercel's system environment variables enabled so previews can use their own deployment origin. After changing an environment variable, build a new preview. Check `/api/games?limit=1` for the preview catalog and `/robots.txt` for `Disallow: /`. Production keeps its own Supabase settings; the legacy anon and service-role variable names remain supported.

For an existing database, apply [the admin stats migration](supabase/migrations/202611110001_admin_dashboard_stats.sql) to the corresponding Supabase project before deploying the dashboard update. New databases created from `supabase/schema.sql` already include it.

The admin dashboard and `GET /api/admin/stats` use the same totals. `total_game_loads` sums recorded iframe loads across the current catalog; `signed_in_loads` counts signed-in history entries. The legacy API field `total_plays` now aliases `total_game_loads`. These metrics do not measure gameplay duration or publisher credit.
