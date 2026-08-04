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
