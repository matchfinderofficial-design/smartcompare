const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap() {
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

  return staticPaths.map((p) => ({ url: `${base}/${p}`, lastModified: new Date().toISOString() }));
}
