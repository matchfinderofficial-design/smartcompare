import type { Metadata } from "next";
import ProductCatalogue from "@/components/ProductCatalogue";
import Link from "next/link";
import type { ProductWithBrand } from "@/lib/types";
import { supabase } from "@/lib/supabase";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "SmartCompare | Find the right dehumidifier",
  description: "Compare UK dehumidifiers using published manufacturer specs for extraction, noise, power, tank capacity and features.",
  openGraph: {
    title: "SmartCompare | Find the right dehumidifier",
    description: "Compare UK dehumidifiers using published manufacturer specs for extraction, noise, power, tank capacity and features.",
    url: siteUrl,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SmartCompare | Find the right dehumidifier",
    description: "Compare UK dehumidifiers using published manufacturer specs for extraction, noise, power, tank capacity and features.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

async function getActiveProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id,slug,name,model,image_url,manufacturer_url,specifications,brand:brands(name)")
    .eq("active", true);

  const products = (data as ProductWithBrand[] | null) || [];

  products.sort((a, b) => {
    const brandA = a.brand?.name ?? "";
    const brandB = b.brand?.name ?? "";
    const brandCompare = brandA.localeCompare(brandB, "en", {
      sensitivity: "base",
    });
    if (brandCompare !== 0) return brandCompare;
    return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  });

  return { data: products, error };
}

const trustCards = [
  {
    title: "Manufacturer specification data",
    description: "Comparisons use published technical details from product documentation.",
    icon: "data",
  },
  {
    title: "Clear side-by-side comparisons",
    description: "The layout highlights core specs you can compare at a glance.",
    icon: "compare",
  },
  {
    title: "No fake ratings or reviews",
    description: "Only factual product information appears in every comparison.",
    icon: "shield",
  },
];

const guideCards = [
  "Best Dehumidifiers for Drying Laundry",
  "Compressor vs Desiccant Dehumidifiers",
  "What Size Dehumidifier Do I Need?",
  "How Much Does a Dehumidifier Cost to Run?",
];

function renderIcon(icon: string) {
  if (icon === "compare") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#2563eb]" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M6 7h12M6 12h12M6 17h12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "shield") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#2563eb]" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 12.5 11 14l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#2563eb]" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function Home() {
  const { data: products, error } = await getActiveProducts();

  return (
    <main className="bg-[#f8fafc] text-slate-950">
      <section className="page-container section-spacing">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl space-y-6">
            <p className="eyebrow">Smarter product comparisons</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Find the right dehumidifier without the guesswork
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Compare extraction rates, noise levels, power usage, tank capacity and key features across UK models.
            </p>
          </div>

          <div className="card-panel bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563eb]">Comparison preview</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  A simple illustration of the specification categories included in every comparison.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                Example layout
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3 border-b border-slate-200 bg-white px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-600">
                <span>Specification</span>
                <span className="text-right">Option A</span>
                <span className="text-right">Option B</span>
              </div>
              <div className="divide-y divide-slate-200 px-4 py-4 text-sm text-slate-700">
                <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3 py-3">
                  <span className="font-semibold text-slate-950">Extraction rate</span>
                  <span className="text-right">22 L/day</span>
                  <span className="text-right">18 L/day</span>
                </div>
                <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3 py-3">
                  <span className="font-semibold text-slate-950">Noise level</span>
                  <span className="text-right">39 dB</span>
                  <span className="text-right">34 dB</span>
                </div>
                <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3 py-3">
                  <span className="font-semibold text-slate-950">Power usage</span>
                  <span className="text-right">205 W</span>
                  <span className="text-right">175 W</span>
                </div>
                <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3 py-3">
                  <span className="font-semibold text-slate-950">Tank capacity</span>
                  <span className="text-right">4.5 L</span>
                  <span className="text-right">3.8 L</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Example values for layout only, not a product endorsement.
            </p>
          </div>
        </div>
      </section>

      <ProductCatalogue products={products} error={error?.message} />

      <section id="compare" className="page-container section-spacing bg-slate-50">
        <div className="space-y-6">
          <p className="eyebrow">Why SmartCompare</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {trustCards.map((card) => (
              <div key={card.title} className="card-panel p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb]">
                  {renderIcon(card.icon)}
                </div>
                <p className="text-base font-semibold text-slate-950">{card.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="guides" className="page-container section-spacing">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Buying guides</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Expert guides for every shopper
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Learn what matters when choosing a dehumidifier, from laundry use to running costs.
          </p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {guideCards.map((guide) => {
            const href = guide === "How Much Does a Dehumidifier Cost to Run?" ? "/guides/dehumidifier-running-cost" : "#";
            return (
              <Link
                key={guide}
                href={href}
                className="card-panel p-6 text-sm text-slate-900 transition hover:border-slate-300 hover:shadow-sm"
              >
                <p className="font-semibold tracking-tight text-slate-950">{guide}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Read our concise guide to make a confident purchase decision.
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
