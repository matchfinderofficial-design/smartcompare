import Link from "next/link";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import ProductImage from "@/components/ProductImage";
import ComparisonRunningCosts from "@/components/ComparisonRunningCosts";
import type { ProductWithBrand } from "@/lib/types";

type CompareSearchParams = {
  products?: string;
};

function formatValue(value: number | string | null | undefined, unit?: string) {
  if (value == null || value === "") {
    return "N/A";
  }
  return unit ? `${value} ${unit}` : String(value);
}

function buildProductRows(products: ProductWithBrand[]) {
  return [
    { label: "Brand", values: products.map((product) => product.brand?.name ?? "Unknown") },
    { label: "Product name", values: products.map((product) => product.name) },
    { label: "Model", values: products.map((product) => product.model) },
    { label: "Extraction rate", values: products.map((product) => formatValue(product.specifications?.extraction_litres_per_day, "L/day")) },
    { label: "Noise level", values: products.map((product) => formatValue(product.specifications?.noise_db, "dB")) },
    { label: "Power consumption", values: products.map((product) => formatValue(product.specifications?.power_watts, "W")) },
    { label: "Tank capacity", values: products.map((product) => formatValue(product.specifications?.tank_capacity_litres, "L")) },
    { label: "Dehumidifier type", values: products.map((product) => formatValue(product.specifications?.dehumidifier_type)) },
    { label: "Laundry mode", values: products.map((product) => product.specifications?.laundry_mode ? "Yes" : "No") },
    { label: "Continuous drainage", values: products.map((product) => product.specifications?.continuous_drainage ? "Yes" : "No") },
    { label: "Humidistat", values: products.map((product) => product.specifications?.humidistat ? "Yes" : "No") },
    { label: "Air purification", values: products.map((product) => product.specifications?.air_purification ? "Yes" : "No") },
    { label: "Weight", values: products.map((product) => formatValue(product.specifications?.weight_kg, "kg")) },
    { label: "Width", values: products.map((product) => formatValue(product.specifications?.width_mm, "mm")) },
    { label: "Height", values: products.map((product) => formatValue(product.specifications?.height_mm, "mm")) },
    { label: "Depth", values: products.map((product) => formatValue(product.specifications?.depth_mm, "mm")) },
  ];
}

function highlightValues(products: ProductWithBrand[]) {
  const results = {
    extraction: new Set<number>(),
    noise: new Set<number>(),
    power: new Set<number>(),
    tank: new Set<number>(),
    weight: new Set<number>(),
  };

  const extractionValues = products.map((product) => product.specifications?.extraction_litres_per_day ?? NaN);
  const noiseValues = products.map((product) => product.specifications?.noise_db ?? NaN);
  const powerValues = products.map((product) => product.specifications?.power_watts ?? NaN);
  const tankValues = products.map((product) => product.specifications?.tank_capacity_litres ?? NaN);
  const weightValues = products.map((product) => product.specifications?.weight_kg ?? NaN);

  const maxExtraction = Math.max(...extractionValues.filter(Number.isFinite));
  const minNoise = Math.min(...noiseValues.filter(Number.isFinite));
  const minPower = Math.min(...powerValues.filter(Number.isFinite));
  const maxTank = Math.max(...tankValues.filter(Number.isFinite));
  const minWeight = Math.min(...weightValues.filter(Number.isFinite));

  extractionValues.forEach((value, index) => {
    if (Number.isFinite(value) && value === maxExtraction) results.extraction.add(index);
  });
  noiseValues.forEach((value, index) => {
    if (Number.isFinite(value) && value === minNoise) results.noise.add(index);
  });
  powerValues.forEach((value, index) => {
    if (Number.isFinite(value) && value === minPower) results.power.add(index);
  });
  tankValues.forEach((value, index) => {
    if (Number.isFinite(value) && value === maxTank) results.tank.add(index);
  });
  weightValues.forEach((value, index) => {
    if (Number.isFinite(value) && value === minWeight) results.weight.add(index);
  });

  return results;
}

async function getProductsBySlugs(slugs: string[]) {
  const { data, error } = await supabase
    .from("products")
    .select("id,slug,name,model,image_url,manufacturer_url,specifications,brand:brands(name)")
    .eq("active", true)
    .in("slug", slugs);

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as ProductWithBrand[] | null) ?? [];
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<CompareSearchParams> }): Promise<Metadata> {
  const { products } = await searchParams;
  const slugs = products?.split(",").map((slug) => slug.trim()).filter(Boolean) ?? [];
  if (slugs.length < 2) {
    return {
      title: "Compare Dehumidifiers Side by Side | SmartCompare",
      description: "Compare factual dehumidifier specifications including extraction rate, noise, power consumption, tank capacity and features.",
      robots: { index: false, follow: true },
    };
  }

  const productsData = await getProductsBySlugs(slugs);
  const slugOrder = new Map(slugs.map((slug, index) => [slug, index]));
  const orderedProducts = productsData
    .filter((product, index) => product.slug && slugOrder.has(product.slug))
    .sort((a, b) => (slugOrder.get(a.slug) ?? 0) - (slugOrder.get(b.slug) ?? 0));

  if (orderedProducts.length < 2) {
    return {
      title: "Compare Dehumidifiers Side by Side | SmartCompare",
      description: "Compare factual dehumidifier specifications including extraction rate, noise, power consumption, tank capacity and features.",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: "Compare Dehumidifiers Side by Side | SmartCompare",
    description: "Compare factual dehumidifier specifications including extraction rate, noise, power consumption, tank capacity and features.",
  };
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<CompareSearchParams> }) {
  const { products } = await searchParams;
  const slugs = products?.split(",").map((slug) => slug.trim()).filter(Boolean) ?? [];
  const uniqueSlugs = Array.from(new Set(slugs));

  if (uniqueSlugs.length < 2) {
    return (
      <main className="bg-[#f8fafc] text-slate-950">
        <div className="page-container section-spacing">
          <nav className="mb-6 text-sm text-slate-600" aria-label="Breadcrumb">
            <Link href="/" className="font-medium text-slate-700 hover:text-slate-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-500">Compare Products</span>
          </nav>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-semibold text-slate-950">Compare Dehumidifiers</h1>
            <p className="mt-4 text-slate-600">Select at least two products to compare their published specifications side by side.</p>
            <Link href="/" className="mt-8 inline-flex rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]">
              Return to products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const productsData = await getProductsBySlugs(uniqueSlugs);
  const slugOrder = new Map(uniqueSlugs.map((slug, index) => [slug, index]));
  const orderedProducts = productsData
    .filter((product) => slugOrder.has(product.slug))
    .sort((a, b) => (slugOrder.get(a.slug) ?? 0) - (slugOrder.get(b.slug) ?? 0));

  if (orderedProducts.length < 2) {
    return (
      <main className="bg-[#f8fafc] text-slate-950">
        <div className="page-container section-spacing">
          <nav className="mb-6 text-sm text-slate-600" aria-label="Breadcrumb">
            <Link href="/" className="font-medium text-slate-700 hover:text-slate-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-500">Compare Products</span>
          </nav>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-semibold text-slate-950">Compare Dehumidifiers</h1>
            <p className="mt-4 text-slate-600">We could not find enough valid products to compare. Check the URL or select products from the homepage.</p>
            <Link href="/" className="mt-8 inline-flex rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]">
              Return to products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const highlights = highlightValues(orderedProducts);
  const rows = buildProductRows(orderedProducts);

  return (
    <main className="bg-[#f8fafc] text-slate-950">
      <div className="page-container section-spacing">
        <nav className="mb-6 text-sm text-slate-600" aria-label="Breadcrumb">
          <Link href="/" className="font-medium text-slate-700 hover:text-slate-900">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-500">Compare Products</span>
        </nav>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563eb]">Compare Dehumidifiers</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Compare Dehumidifiers</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Compare published manufacturer specifications side by side.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-600">Estimate running costs for compared products</p>
            </div>
            <div>
              {/* Client component will render shared inputs and per-product cost rows */}
              <div id="comparison-costs-root" className="mb-4" />
            </div>
          </div>

          <div className="mb-6">
            <ComparisonRunningCosts products={orderedProducts} />
          </div>
          <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="min-w-[900px]">
              <div className="grid min-w-full grid-cols-[1.5fr_repeat(4,1fr)] gap-0 border-b border-slate-200 bg-slate-50 px-4 py-4 text-sm uppercase tracking-[0.18em] text-slate-600 sm:grid-cols-[1.7fr_repeat(4,1fr)]">
                <div className="py-2 font-semibold text-slate-950">Specification</div>
                {orderedProducts.map((product) => (
                  <div key={product.slug} className="border-l border-slate-200 px-4 py-2">
                    <p className="truncate font-semibold text-slate-950">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{product.brand?.name ?? "Brand"}</p>
                  </div>
                ))}
              </div>

              <div className="grid min-w-full grid-cols-[1.5fr_repeat(4,1fr)] gap-0 px-4 py-4 text-sm text-slate-700 sm:grid-cols-[1.7fr_repeat(4,1fr)]">
                <div className="border-b border-slate-200 py-4 pr-4 font-semibold text-slate-950">Product image</div>
                {orderedProducts.map((product) => (
                  <div key={`${product.slug}-image`} className="border-l border-b border-slate-200 px-4 py-4">
                    <div className="mx-auto h-40 w-full max-w-[12rem] overflow-hidden rounded-[1.5rem] bg-slate-100">
                      <ProductImage src={product.image_url ?? undefined} alt={product.name} sizes="200px" />
                    </div>
                  </div>
                ))}
              </div>

              {rows.map((row) => {
                const rowKey = row.label.toLowerCase().replace(/\s+/g, "-");
                return (
                  <div key={rowKey} className="grid min-w-full grid-cols-[1.5fr_repeat(4,1fr)] gap-0 border-t border-slate-200 px-4 py-4 text-sm sm:grid-cols-[1.7fr_repeat(4,1fr)]">
                    <div className="pr-4 font-semibold text-slate-950">{row.label}</div>
                    {row.values.map((value, index) => {
                      const highlightClass =
                        (row.label === "Extraction rate" && highlights.extraction.has(index)) ||
                        (row.label === "Noise level" && highlights.noise.has(index)) ||
                        (row.label === "Power consumption" && highlights.power.has(index)) ||
                        (row.label === "Tank capacity" && highlights.tank.has(index)) ||
                        (row.label === "Weight" && highlights.weight.has(index))
                          ? "bg-emerald-50 text-slate-900"
                          : "";

                      const badge =
                        row.label === "Extraction rate" && highlights.extraction.has(index)
                          ? "Highest"
                          : row.label === "Noise level" && highlights.noise.has(index)
                          ? "Lowest"
                          : row.label === "Power consumption" && highlights.power.has(index)
                          ? "Lowest"
                          : row.label === "Tank capacity" && highlights.tank.has(index)
                          ? "Highest"
                          : row.label === "Weight" && highlights.weight.has(index)
                          ? "Lowest"
                          : "";

                      return (
                        <div key={`${rowKey}-${index}`} className={`border-l border-slate-200 px-4 py-4 ${highlightClass}`}>
                          <div className="flex items-start gap-2">
                            <span>{value}</span>
                            {badge ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                                {badge}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <div className="grid min-w-full grid-cols-[1.5fr_repeat(4,1fr)] gap-0 border-t border-slate-200 px-4 py-4 text-sm sm:grid-cols-[1.7fr_repeat(4,1fr)]">
                <div className="pr-4 font-semibold text-slate-950">Manufacturer link</div>
                {orderedProducts.map((product) => (
                  <div key={`${product.slug}-link`} className="border-l border-slate-200 px-4 py-4">
                    {product.manufacturer_url ? (
                      <a
                        href={product.manufacturer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
                      >
                        Manufacturer site
                      </a>
                    ) : (
                      <span className="text-slate-500">No link</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
            Specifications are based on manufacturer information and may change. SmartCompare has not independently tested these products.
          </div>
        </div>
      </div>
    </main>
  );
}
