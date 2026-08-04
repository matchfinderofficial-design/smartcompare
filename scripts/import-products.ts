import fs from 'fs';
import path from 'path';
import getSupabaseAdmin from '../lib/supabase-admin';
import { isValidUrl, buildSourceHash } from './validators';
const supabaseAdmin = getSupabaseAdmin();

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: npm run import-products -- <file.json> [--overwrite]');
    process.exit(2);
  }

  const filePath = path.resolve(args[0]);
  const overwrite = args.includes('--overwrite');

  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(2);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  type ProductImportRecord = {
    category_slug: string;
    brand_slug: string;
    name: string;
    model: string;
    slug: string;
    manufacturer_url?: string | null;
    image_url?: string | null;
    specifications?: Record<string, unknown> | null;
    source_name: string;
    source_url: string;
    short_description?: string | null;
    full_description?: string | null;
    pros?: string[] | null;
    cons?: string[] | null;
  };

  const requiredFields: Array<keyof ProductImportRecord> = [
    'category_slug',
    'brand_slug',
    'name',
    'model',
    'slug',
    'source_name',
    'source_url',
  ];

  let records: ProductImportRecord[];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Import file must be an array of products');
    records = parsed;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('Invalid JSON file:', message);
    process.exit(2);
  }

  // basic validation
  const slugsSeen = new Set<string>();

  const runInsert = await supabaseAdmin.from('automation_runs').insert({ run_type: 'import', status: 'running' }).select('id').single();
  const runId = runInsert.data?.id;

  const stats = { checked: 0, created: 0, updated: 0, skipped: 0, failed: 0 };

  for (const rec of records) {
    stats.checked++;
    try {
      // required fields
      for (const r of requiredFields) {
        if (!rec[r]) throw new Error(`Missing required field: ${r}`);
      }
      if (!isValidUrl(rec.source_url)) throw new Error('Invalid source_url');
      if (rec.manufacturer_url && !isValidUrl(rec.manufacturer_url)) throw new Error('Invalid manufacturer_url');
      if (rec.image_url && !isValidUrl(rec.image_url)) rec.image_url = null; // clear invalid image

      // duplicate slug within file
      if (slugsSeen.has(rec.slug)) throw new Error(`Duplicate slug in file: ${rec.slug}`);
      slugsSeen.add(rec.slug);

      // resolve category and brand by slug
      const catRes = await supabaseAdmin.from('categories').select('id').eq('slug', rec.category_slug).maybeSingle();
      if (!catRes.data) {
        console.warn(`Skipping ${rec.slug}: category not found ${rec.category_slug}`);
        stats.skipped++;
        continue;
      }
      const brandRes = await supabaseAdmin.from('brands').select('id').eq('slug', rec.brand_slug).maybeSingle();
      if (!brandRes.data) {
        console.warn(`Skipping ${rec.slug}: brand not found ${rec.brand_slug}`);
        stats.skipped++;
        continue;
      }

      const category_id = catRes.data.id;
      const brand_id = brandRes.data.id;

      const source_hash = buildSourceHash(rec);

      // check existing product
      const existing = await supabaseAdmin.from('products').select('*').eq('slug', rec.slug).maybeSingle();
      if (existing.data) {
        const existingProduct = existing.data as { [key: string]: unknown };
        if (existingProduct.source_hash === source_hash) {
          // unchanged
          stats.skipped++;
          continue;
        }

        // prepare update, respect editorial fields unless overwrite
        const updatePayload: Record<string, unknown> = {
          name: rec.name,
          model: rec.model,
          category_id,
          brand_id,
          manufacturer_url: rec.manufacturer_url ?? existingProduct.manufacturer_url,
          image_url: rec.image_url ?? existingProduct.image_url,
          specifications: rec.specifications ?? existingProduct.specifications,
          source_name: rec.source_name,
          source_url: rec.source_url,
          source_hash,
          automation_status: 'completed',
          last_automated_at: new Date().toISOString(),
        };

        // preserve editorial fields unless overwrite
        if (!overwrite) {
          updatePayload.short_description = existingProduct.short_description || null;
          updatePayload.full_description = existingProduct.full_description || null;
          updatePayload.pros = existingProduct.pros || null;
          updatePayload.cons = existingProduct.cons || null;
        } else {
          updatePayload.short_description = rec.short_description ?? existingProduct.short_description ?? null;
          updatePayload.full_description = rec.full_description ?? existingProduct.full_description ?? null;
        }

        const upd = await supabaseAdmin.from('products').update(updatePayload).eq('id', existingProduct.id);
        if (upd.error) {
          await supabaseAdmin.from('products').update({ automation_status: 'failed', automation_error: String(upd.error) }).eq('id', existingProduct.id);
          stats.failed++;
        } else {
          stats.updated++;
        }
      } else {
        // create product
        const payload: Record<string, unknown> = {
          slug: rec.slug,
          name: rec.name,
          model: rec.model,
          category_id,
          brand_id,
          manufacturer_url: rec.manufacturer_url ?? null,
          image_url: rec.image_url ?? null,
          specifications: rec.specifications ?? null,
          source_name: rec.source_name,
          source_url: rec.source_url,
          source_hash,
          automation_status: 'completed',
          last_automated_at: new Date().toISOString(),
          active: true,
        };
        const ins = await supabaseAdmin.from('products').insert(payload);
        if (ins.error) {
          console.error('Failed to insert', rec.slug, ins.error.message);
          stats.failed++;
        } else {
          stats.created++;
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Error processing record', message);
      stats.failed++;
    }
  }

  // update automation_runs
  await supabaseAdmin.from('automation_runs').update({
    status: 'completed',
    products_checked: stats.checked,
    products_created: stats.created,
    products_updated: stats.updated,
    products_skipped: stats.skipped,
    products_failed: stats.failed,
    completed_at: new Date().toISOString(),
  }).eq('id', runId);

  console.log('Import summary:', stats);
  process.exit(stats.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error during import:', err);
  process.exit(2);
});
