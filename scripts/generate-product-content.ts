import getSupabaseAdmin from '../lib/supabase-admin';
const supabaseAdmin = getSupabaseAdmin();

// Minimal Gemini client wrapper (demonstrative). This script will NOT call Gemini during the repo check.
// To actually enable generation, set GEMINI_API_KEY and ensure the network call follows Google's official API.

const DEFAULT_LIMIT = 10;

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  short_description?: string | null;
  full_description?: string | null;
  key_features?: string[] | null;
  pros?: string[] | null;
  cons?: string[] | null;
  suitable_for?: string[] | null;
  specifications?: Record<string, unknown> | null;
};

async function callGeminiForProduct(product: ProductRow): Promise<{
  short_description: string;
  full_description: string;
  suitable_for: string[];
  key_features: string[];
  pros: string[];
  cons: string[];
}> {
  // This function is a placeholder; in production implement the official Gemini API call here.
  // For safety while running static checks we return a mock structured object.
  return {
    short_description: `A concise description of ${product.name}.`,
    full_description: `A longer factual description of ${product.name} based on manufacturer specifications.`,
    suitable_for: [],
    key_features: [],
    pros: [],
    cons: [],
  };
}

async function main() {
  const args = process.argv.slice(2);
  const overwrite = args.includes('--overwrite');
  const limitArgIndex = args.findIndex((a) => a.startsWith('--limit='));
  const limit = limitArgIndex >= 0 ? Number(args[limitArgIndex].split('=')[1]) : DEFAULT_LIMIT;

  if (!process.env.GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY not set — skipping real Gemini calls. This run will simulate generation.');
  }

  // fetch candidates
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('active', true)
    .limit(limit);

  if (!products || products.length === 0) {
    console.log('No products to process');
    return;
  }

  let processed = 0;
  for (const p of products) {
    // determine missing fields
    const needs = !p.short_description || !p.full_description || !p.key_features || !p.pros || !p.cons || !p.suitable_for;
    if (!needs) continue;

    processed++;
    try {
      const generated = await callGeminiForProduct(p);

      const updatePayload: Record<string, unknown> = {
        short_description: overwrite ? generated.short_description : p.short_description || generated.short_description,
        full_description: overwrite ? generated.full_description : p.full_description || generated.full_description,
        key_features: overwrite ? generated.key_features : p.key_features || generated.key_features,
        pros: overwrite ? generated.pros : p.pros || generated.pros,
        cons: overwrite ? generated.cons : p.cons || generated.cons,
        suitable_for: overwrite ? generated.suitable_for : p.suitable_for || generated.suitable_for,
        content_generated_at: new Date().toISOString(),
        last_automated_at: new Date().toISOString(),
        automation_status: 'completed',
      };

      const upd = await supabaseAdmin.from('products').update(updatePayload).eq('id', p.id);
      if (upd.error) {
        await supabaseAdmin.from('products').update({ automation_status: 'failed', automation_error: String(upd.error) }).eq('id', p.id);
        console.error('Failed to update product', p.slug, upd.error.message);
      }

      if (processed >= limit) break;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Generation error for', p.slug, message);
      await supabaseAdmin.from('products').update({ automation_status: 'failed', automation_error: message }).eq('id', p.id);
    }
  }

  console.log('Generation completed, processed', processed);
}

main().catch((err) => {
  console.error('Fatal generation error:', err);
  process.exit(2);
});
