import getSupabaseAdmin from "@/lib/supabase-admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap() {
  const base = SITE_URL.replace(/\/$/, "");
  const staticPaths = [
    "",
    "compare",
    "guides",
    "guides/dehumidifier-running-cost",
    "about",
    "how-we-compare",
    "affiliate-disclosure",
    "privacy",
    "contact",
  ];

  const urls: Array<{ url: string; lastModified: string }> = staticPaths.map((p) => ({ url: `${base}/${p}`, lastModified: new Date().toISOString() }));

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return urls;
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: products } = await supabaseAdmin.from('products').select('slug').eq('active', true).limit(1000);
    if (Array.isArray(products)) {
      for (const p of products) {
        if (p.slug) urls.push({ url: `${base}/products/${p.slug}`, lastModified: new Date().toISOString() });
      }
    }
  } catch (err) {
    console.warn('Sitemap: could not fetch products from Supabase, falling back to static routes', err);
  }

  return urls;
}
