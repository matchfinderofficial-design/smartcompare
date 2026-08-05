import * as cheerio from "cheerio";
import getSupabaseAdmin from "../lib/supabase-admin";

const supabaseAdmin = getSupabaseAdmin();
const REQUEST_DELAY_MS = 5000;

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  manufacturer_url?: string | null;
  image_url?: string | null;
};

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function buildAbsoluteUrl(rawUrl: string, baseUrl: string): string {
  try {
    return new URL(rawUrl, baseUrl).toString();
  } catch (error) {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }
}

function findPrimaryImage(html: string, baseUrl: string): string | null {
  const $ = cheerio.load(html);

  const metaCandidates = [
    $("meta[property='og:image']").attr("content"),
    $("meta[property='og:image:secure_url']").attr("content"),
    $("meta[name='twitter:image']").attr("content"),
    $("meta[name='twitter:image:src']").attr("content"),
  ];

  for (const candidate of metaCandidates) {
    if (candidate && candidate.trim()) {
      return buildAbsoluteUrl(candidate.trim(), baseUrl);
    }
  }

  const selectors = ["picture img", "figure img", "img"];

  for (const selector of selectors) {
    const element = $(selector)
      .toArray()
      .find((node: any) => {
        const attrib = $(node).attr("src") ?? $(node).attr("data-src") ?? $(node).attr("data-lazy-src");
        return Boolean(attrib?.trim());
      });

    if (!element) {
      continue;
    }

    const src = $(element).attr("src") ?? $(element).attr("data-src") ?? $(element).attr("data-lazy-src");
    if (src && src.trim()) {
      return buildAbsoluteUrl(src.trim(), baseUrl);
    }
  }

  return null;
}

async function fetchManufacturerPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; SmartCompare/1.0; +https://smartcompare.com)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Manufacturer page returned HTTP ${response.status}`);
  }

  return await response.text();
}

async function updateProductStatus(
  id: number,
  status: "processing" | "completed" | "failed",
  errorMessage: string | null = null
) {
  const payload: Record<string, unknown> = {
    automation_status: status,
    automation_error: status === "failed" ? errorMessage?.slice(0, 1000) : null,
    last_automated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("products").update(payload).eq("id", id);

  if (error) {
    throw new Error(`Could not update product status: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const overwrite = args.includes("--overwrite");

  const { data: products, error: productError } = await supabaseAdmin
    .from("products")
    .select("id,slug,name,manufacturer_url,image_url")
    .eq("active", true)
    .order("id")
    .limit(1000);

  if (productError) {
    throw new Error(`Could not load products: ${productError.message}`);
  }

  if (!products?.length) {
    console.log("No active products found.");
    return;
  }

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  for (let index = 0; index < products.length; index++) {
    const product = products[index] as ProductRow;
    const { id, slug, name, manufacturer_url, image_url } = product;

    if (!overwrite && image_url) {
      skipped++;
      continue;
    }

    if (!manufacturer_url) {
      console.error(`Skipping ${slug}: missing manufacturer_url`);
      await updateProductStatus(id, "failed", "Missing manufacturer_url");
      failed++;
      continue;
    }

    try {
      console.log(`Processing image for ${slug}`);
      await updateProductStatus(id, "processing", null);

      const html = await fetchManufacturerPage(manufacturer_url);
      const foundImage = findPrimaryImage(html, manufacturer_url);

      if (!foundImage) {
        throw new Error("No primary image found on manufacturer page");
      }

      const { error: updateError } = await supabaseAdmin
        .from("products")
        .update({
          image_url: foundImage,
          automation_status: "completed",
          automation_error: null,
          last_automated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      console.log(`Saved image URL for ${slug}: ${foundImage}`);
      completed++;
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Image import failed for ${slug}: ${message}`);
      await updateProductStatus(id, "failed", message);
    }

    if (index < products.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  console.log(
    `Image import finished: ${completed} completed, ${skipped} skipped, ${failed} failed.`
  );

  if (failed > 0 && completed === 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    "Fatal image import error:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
