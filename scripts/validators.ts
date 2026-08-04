// Lightweight validation helpers used by import scripts. Avoid adding zod to keep dependencies minimal.

export function isValidUrl(v: unknown) {
  if (v == null || v === "") return false;
  try {
    const u = new URL(String(v));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildSourceHash(record: Record<string, unknown>) {
  // Deterministic hash of factual fields: JSON stringify of ordered keys
  const keys = ["category_slug", "brand_slug", "name", "model", "slug", "manufacturer_url", "image_url", "specifications"];
  const obj: Record<string, unknown> = {};
  for (const k of keys) {
    obj[k] = record[k] ?? null;
  }
  // Simple stable stringify
  return Buffer.from(JSON.stringify(obj)).toString("base64");
}
