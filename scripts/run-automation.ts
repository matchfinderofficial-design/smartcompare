import { spawnSync } from "child_process";
import getSupabaseAdmin from "../lib/supabase-admin";

const supabaseAdmin = getSupabaseAdmin();

function runNpmScript(script: string, extraArgs: string[] = []) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

  const result = spawnSync(
    npmCommand,
    ["run", script, ...(extraArgs.length ? ["--", ...extraArgs] : [])],
    {
      stdio: "inherit",
      env: process.env,
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `${script} failed with exit code ${result.status ?? "unknown"}`
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  const importFile = args.find((arg) => !arg.startsWith("--")) ?? null;

  const { data: run, error: runError } = await supabaseAdmin
    .from("automation_runs")
    .insert({
      run_type: "orchestrator",
      status: "running",
    })
    .select("id, started_at")
    .single();

  if (runError || !run) {
    throw new Error(
      `Could not create automation run: ${
        runError?.message ?? "No run record returned"
      }`
    );
  }

  const runId = run.id;
  const runStartedAt = run.started_at;

  try {
    if (importFile) {
      console.log(`Running product import: ${importFile}`);
      runNpmScript("import-products", [importFile]);
    }

    console.log("Generating missing product content");
    runNpmScript("generate-content");

    const { data: changed, error: changedError } = await supabaseAdmin
      .from("products")
      .select("id")
      .gte("last_automated_at", runStartedAt)
      .limit(1000);

    if (changedError) {
      throw new Error(
        `Could not check changed products: ${changedError.message}`
      );
    }

    const changedCount = changed?.length ?? 0;

    if (changedCount > 0 && process.env.VERCEL_DEPLOY_HOOK_URL) {
      try {
        console.log(`Triggering Vercel deployment for ${changedCount} changes`);

        const response = await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, {
          method: "POST",
        });

        if (!response.ok) {
          console.error(
            `Vercel deploy hook returned HTTP ${response.status}`
          );
        } else {
          console.log("Vercel deployment triggered");
        }
      } catch (error) {
        console.error("Vercel deploy hook failed:", error);
      }
    } else {
      console.log("No changed products detected");
    }

    const { error: completionError } = await supabaseAdmin
      .from("automation_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    if (completionError) {
      throw new Error(
        `Could not complete automation run: ${completionError.message}`
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error("Automation failed:", message);

    await supabaseAdmin
      .from("automation_runs")
      .update({
        status: "failed",
        error_summary: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    "Fatal automation error:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
