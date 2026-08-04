# SmartCompare

SmartCompare organises published manufacturer specifications so users can compare products side-by-side using
objective, reproducible calculations.

Local development

1. Copy `.env.example` to `.env.local` and provide credentials for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (optional — default: `http://localhost:3000`)

Install and run:

```bash
pnpm install
pnpm dev
```

Build for production:

```bash
pnpm exec tsc --noEmit
pnpm exec next build
```

Product data

Products are stored in Supabase under a `products` table. Server-side code queries Supabase using the
publishable key for read-only access. Images are loaded via `next/image` and `components/ProductImage.tsx` which
validates remote hosts and falls back to a placeholder when `image_url` is absent.

Adding images safely

- Store image URLs in the `products.image_url` column.
- Ensure external hosts are permitted via `next.config.ts` `remotePatterns` or use a proxied CDN.

Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Automation required secrets

- `SUPABASE_SERVICE_ROLE_KEY` (server-side admin key; never expose to browser)
- `GEMINI_API_KEY` (for AI content generation)
- `VERCEL_DEPLOY_HOOK_URL` (optional; used to trigger a deploy when content changes)

Automation overview

- `npm run import-products -- <file.json>` imports structured product records.
- `npm run generate-content` generates missing editorial content for active products.
- `npm run automate-products` runs import (when passed a file), content generation and triggers a Vercel deploy hook if content changes.

Migration and manual commands

- Apply the SQL migration in `supabase/migrations/0001_add_automation_fields_and_runs.sql` via Supabase SQL editor or CLI.
- Run imports with `npm run import-products -- data/product-import.example.json`.
- Generate AI content with `npm run generate-content -- --limit=10`.
- Trigger automation manually with `npm run automate-products`.

GitHub Action

- The workflow file is `.github/workflows/product-automation.yml`.
- It runs manually and every Monday at 05:00 UTC.
- Required CI secrets are listed below.

Required GitHub secrets

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `VERCEL_DEPLOY_HOOK_URL`

Security notes

- Do not commit `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, or `VERCEL_DEPLOY_HOOK_URL`.
- Ensure `.env.local` remains ignored by `.gitignore`.
- Factual specifications must come from authorised or verified sources.
- Product images and affiliate links should come from authorised sources.
