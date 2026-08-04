# Automation guide

This document explains the product automation system.

Overview

- Import structured product JSON files using `scripts/import-products.ts`.
- Generate editorial content using the Gemini API via `scripts/generate-product-content.ts`.
- Orchestrate runs via `scripts/run-automation.ts` or the GitHub Action.

Common issues & troubleshooting

- Invalid product file: Check JSON validity and required fields: `category_slug`, `brand_slug`, `name`, `model`, `slug`, `source_name`, `source_url`.
- Duplicate slug: Ensure the import file contains unique slugs.
- Missing category/brand: Add matching `categories` and `brands` entries in Supabase before importing.
- Gemini API limit: Use smaller `--limit` values or stagger runs.
- Supabase permissions: Provide `SUPABASE_SERVICE_ROLE_KEY` to server-side scripts; do not expose to clients.
- Failed Vercel hook: Check the `VERCEL_DEPLOY_HOOK_URL` and logs; orchestrator will not fail the whole run for hook errors.

Manual steps

- Apply migration: Use Supabase SQL editor or CLI to run `supabase/migrations/0001_add_automation_fields_and_runs.sql`.
- Create a Vercel Deploy Hook: In Vercel dashboard, create a deploy hook and store the URL in `VERCEL_DEPLOY_HOOK_URL`.

Security

- Do not commit `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, or `VERCEL_DEPLOY_HOOK_URL`.
- Ensure `.env.local` is in `.gitignore`.
