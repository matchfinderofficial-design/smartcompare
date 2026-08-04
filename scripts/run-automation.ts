import { spawnSync } from 'child_process';
import getSupabaseAdmin from '../lib/supabase-admin';
const supabaseAdmin = getSupabaseAdmin();

async function main() {
  const args = process.argv.slice(2);
  const importFileArgIndex = args.findIndex((a) => !a.startsWith('--'));
  const importFile = importFileArgIndex >= 0 ? args[importFileArgIndex] : null;

  // create an automation_runs record
  const run = await supabaseAdmin.from('automation_runs').insert({ run_type: 'orchestrator', status: 'running' }).select('id, started_at').single();
  const runId = run.data?.id;
  const runStartedAt = run.data?.started_at;

  try {
    if (importFile) {
      console.log('Running import for', importFile);
      // call import script
      const res = spawnSync('pnpm', ['run', 'import-products', '--', importFile], { stdio: 'inherit' });
      if (res.status !== 0) {
        console.warn('Import step completed with non-zero exit code', res.status);
      }
    }

    // generate content
    console.log('Generating content (default limit 10)');
    const gen = spawnSync('pnpm', ['run', 'generate-content'], { stdio: 'inherit' });
    if (gen.status !== 0) {
      console.warn('Generation step completed with non-zero exit code', gen.status);
    }

    // determine if products changed since run started
    let changedCount = 0;
    try {
      const { data: changed } = await supabaseAdmin
        .from('products')
        .select('id')
        .gte('last_automated_at', runStartedAt)
        .limit(1000);
      if (Array.isArray(changed)) changedCount = changed.length;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Could not determine changed products:', message);
    }

    if (changedCount > 0 && process.env.VERCEL_DEPLOY_HOOK_URL) {
      try {
        console.log('Triggering Vercel deploy hook');
        const resp = await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' });
        if (!resp.ok) {
          console.error('Vercel hook responded with', resp.status);
        } else {
          console.log('Vercel deploy triggered');
        }
      } catch (err) {
        console.error('Failed to call Vercel hook', err);
      }
    } else {
      console.log('No content changes detected or no Vercel deploy hook configured');
    }

    await supabaseAdmin.from('automation_runs').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', runId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Orchestrator error', message);
    await supabaseAdmin.from('automation_runs').update({ status: 'failed', error_summary: message }).eq('id', runId);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('Fatal orchestrator error', err);
  process.exit(2);
});
