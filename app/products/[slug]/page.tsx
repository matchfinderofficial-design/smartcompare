import ProductImage from "@/components/ProductImage";
import RunningCostCalculator from "@/components/RunningCostCalculator";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

import type { ProductWithBrand } from "@/lib/types";

async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,slug,name,model,image_url,manufacturer_url,specifications,brand:brands(name)"
    )
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error) {
    return { product: null, error };
  }

  if (!data) {
    return { product: null, error: null };
  }

  return { product: data as unknown as ProductWithBrand, error: null };
}

function formatValue(value: number | string | null | undefined, unit?: string) {
  if (value == null || value === "") {
    return "N/A";
  }
  return unit ? `${value} ${unit}` : String(value);
}

function buildDescription(product: ProductWithBrand) {
  const brand = product.brand?.name ?? "Unknown brand";
  const model = product.model;
  const extraction = product.specifications?.extraction_litres_per_day;
  const noise = product.specifications?.noise_db;
  const power = product.specifications?.power_watts;
  const type = product.specifications?.dehumidifier_type;

  const pieces = [brand, product.name, model];
  const specs: string[] = [];

  if (extraction != null) specs.push(`${extraction} L/day extraction`);
  if (noise != null) specs.push(`${noise} dB noise`);
  if (power != null) specs.push(`${power} W power`);
  if (type) specs.push(`${type} dehumidifier`);

  const specText = specs.length > 0 ? ` with ${specs.join(", ")}` : "";
  return `${pieces.join(" ")}${specText}.`;
}

function buildSummary(product: ProductWithBrand) {
  const specs = product.specifications;
  if (!specs) {
    return "";
  }

  const capacity = specs.extraction_litres_per_day;
  const type = specs.dehumidifier_type;
  const noise = specs.noise_db;
  const tank = specs.tank_capacity_litres;
  const parts: string[] = [];

  if (capacity != null && type) {
    parts.push(`a ${capacity} L/day ${type} dehumidifier`);
  } else if (capacity != null) {
    parts.push(`a ${capacity} L/day dehumidifier`);
  } else if (type) {
    parts.push(`a ${type} dehumidifier`);
  }

  const details: string[] = [];
  if (noise != null) {
    details.push(`a stated noise level of ${noise} dB`);
  }
  if (tank != null) {
    details.push(`${tank} litre tank`);
  }

  const detailText = details.length > 0 ? ` with ${details.join(" and ")}` : "";
  return parts.length > 0 ? `${product.name} is ${parts.join(" ")}${detailText}.` : "";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { product, error } = await getProductBySlug(slug);

  if (error) {
    throw new Error(error.message);
  }

  if (!product) {
    return {
      title: "Product not found | SmartCompare",
      description: "The requested dehumidifier product could not be found.",
      alternates: { canonical: `/products/${slug}` },
    };
  }

  return {
    title: `${product.name} Specifications & Comparison | SmartCompare`,
    description: buildDescription(product),
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { product, error } = await getProductBySlug(slug);

  if (error) {
    throw new Error(error.message);
  }

  if (!product) {
    notFound();
  }

  const specs = product.specifications;
  const features = [
    { label: "Laundry mode", enabled: specs?.laundry_mode, description: "Dedicated setting for helping dry clothes indoors." },
    { label: "Continuous drainage", enabled: specs?.continuous_drainage, description: "Can drain through a hose where supported." },
    { label: "Humidistat", enabled: specs?.humidistat, description: "Automatically manages the target humidity level." },
    { label: "Air purification", enabled: specs?.air_purification, description: "Includes an air-purification function." },
  ].filter((feature) => feature.enabled);

  const summaryText = buildSummary(product);

  return (
    <main className="bg-[#f8fafc] text-slate-950">
      <div className="page-container section-spacing">
        <nav className="mb-6 text-sm text-slate-600" aria-label="Breadcrumb">
          <Link href="/" className="font-medium text-slate-700 hover:text-slate-900">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/#products" className="font-medium text-slate-700 hover:text-slate-900">
            Dehumidifiers
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-500">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-[#2563eb]">
                {product.brand?.name ?? "Brand"}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-slate-600">
                Model {product.model}
              </p>
              {summaryText ? (
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">
                  {summaryText}
                </p>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <div className="relative h-[420px] overflow-hidden rounded-[1.75rem] bg-slate-200">
                <ProductImage
                  src={product.image_url ?? undefined}
                  alt={`${product.brand?.name ?? ""} ${product.name}`.trim()}
                  sizes="(max-width: 767px) 100vw, 600px"
                />
              </div>
            </div>
            {product.specifications?.power_watts != null ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8">
                <RunningCostCalculator powerWatts={product.specifications.power_watts} />
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
                Product summary
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Extraction capacity</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatValue(specs?.extraction_litres_per_day, "L/day")}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Noise level</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatValue(specs?.noise_db, "dB")}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Power consumption</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatValue(specs?.power_watts, "W")}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Tank capacity</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatValue(specs?.tank_capacity_litres, "L")}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Dehumidifier type</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatValue(specs?.dehumidifier_type)}
                  </p>
                </div>
              </div>
            </div>

            {features.length > 0 && (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Key features</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {features.map((feature) => (
                    <span
                      key={feature.label}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      {feature.label}
                    </span>
                  ))}
                </div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  {features.map((feature) => (
                    <p key={`${feature.label}-desc`}>
                      <span className="font-semibold text-slate-900">{feature.label}:</span> {feature.description}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {product.manufacturer_url && (
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
                <p className="text-sm text-slate-700">
                  Check the manufacturer's website for the latest product information, warranty details and availability.
                </p>
                <a
                  href={product.manufacturer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
                >
                  View on Manufacturer Website
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-950">Full specifications</h2>
            <Link href="/" className="text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8]">
              Back to all dehumidifiers
            </Link>
          </div>
          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <tbody className="divide-y divide-slate-200 bg-white">
                {[
                  ["Extraction rate", formatValue(specs?.extraction_litres_per_day, "L/day")],
                  ["Noise level", formatValue(specs?.noise_db, "dB")],
                  ["Power consumption", formatValue(specs?.power_watts, "W")],
                  ["Tank capacity", formatValue(specs?.tank_capacity_litres, "L")],
                  ["Type", formatValue(specs?.dehumidifier_type)],
                  ["Weight", formatValue(specs?.weight_kg, "kg")],
                  ["Width", formatValue(specs?.width_mm, "mm")],
                  ["Height", formatValue(specs?.height_mm, "mm")],
                  ["Depth", formatValue(specs?.depth_mm, "mm")],
                ].map(([label, value]) => (
                  <tr key={String(label)} className="border-t border-slate-200">
                    <th scope="row" className="px-4 py-4 text-left font-medium text-slate-600">
                      {label}
                    </th>
                    <td className="px-4 py-4 text-right font-semibold text-slate-950">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
          <p>Specifications are based on manufacturer information and may change.</p>
          <p className="mt-2">SmartCompare has not independently tested this product.</p>
        </div>
      </div>
    </main>
  );
}
