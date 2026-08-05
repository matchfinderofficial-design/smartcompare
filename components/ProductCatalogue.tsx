"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CompareBar from "@/components/CompareBar";
import ProductImage from "@/components/ProductImage";
import type { ProductWithBrand } from "@/lib/types";

type FilterKey = "bedrooms" | "laundry" | "quiet" | "energy" | "large" | "budget";

type SortKey =
  | "recommended"
  | "quietest"
  | "lowest-power"
  | "highest-extraction"
  | "largest-tank"
  | "a-z";

type FilterDefinition = {
  key: FilterKey;
  label: string;
  description: string;
  disabled?: boolean;
};

const filters: FilterDefinition[] = [
  { key: "bedrooms", label: "Best for Bedrooms", description: "Noise 38 dB or lower" },
  { key: "laundry", label: "Best for Laundry", description: "Laundry mode enabled" },
  { key: "quiet", label: "Quiet Models", description: "Noise 36 dB or lower" },
  { key: "energy", label: "Low Energy", description: "Power 200 W or lower" },
  { key: "large", label: "Large Homes", description: "Extraction 20 L/day or higher" },
  { key: "budget", label: "Budget Picks", description: "Coming soon", disabled: true },
];

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "quietest", label: "Quietest" },
  { key: "lowest-power", label: "Lowest power" },
  { key: "highest-extraction", label: "Highest extraction" },
  { key: "largest-tank", label: "Largest tank" },
  { key: "a-z", label: "A–Z" },
];

type ProductCatalogueProps = {
  products: ProductWithBrand[];
  error?: string | null;
};

const filterDescriptions: Record<FilterKey, (product: ProductWithBrand) => boolean> = {
  bedrooms: (product) => (product.specifications?.noise_db ?? Infinity) <= 38,
  laundry: (product) => product.specifications?.laundry_mode === true,
  quiet: (product) => (product.specifications?.noise_db ?? Infinity) <= 36,
  energy: (product) => (product.specifications?.power_watts ?? Infinity) <= 200,
  large: (product) => (product.specifications?.extraction_litres_per_day ?? -Infinity) >= 20,
  budget: () => true,
};

const ProductCatalogue = ({ products, error }: ProductCatalogueProps) => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("recommended");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = normalizedQuery
        ? [product.name, product.model, product.brand?.name, product.specifications?.dehumidifier_type]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalizedQuery))
        : true;

      const matchesFilter = activeFilter
        ? filterDescriptions[activeFilter](product)
        : true;

      return matchesSearch && matchesFilter;
    });
  }, [products, normalizedQuery, activeFilter]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortKey) {
      case "quietest":
        sorted.sort((a, b) => {
          const aValue = a.specifications?.noise_db ?? Infinity;
          const bValue = b.specifications?.noise_db ?? Infinity;
          return aValue - bValue;
        });
        break;
      case "lowest-power":
        sorted.sort((a, b) => {
          const aValue = a.specifications?.power_watts ?? Infinity;
          const bValue = b.specifications?.power_watts ?? Infinity;
          return aValue - bValue;
        });
        break;
      case "highest-extraction":
        sorted.sort((a, b) => {
          const aValue = a.specifications?.extraction_litres_per_day ?? -Infinity;
          const bValue = b.specifications?.extraction_litres_per_day ?? -Infinity;
          return bValue - aValue;
        });
        break;
      case "largest-tank":
        sorted.sort((a, b) => {
          const aValue = a.specifications?.tank_capacity_litres ?? -Infinity;
          const bValue = b.specifications?.tank_capacity_litres ?? -Infinity;
          return bValue - aValue;
        });
        break;
      case "a-z":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
        break;
      case "recommended":
      default:
        sorted.sort((a, b) => {
          const brandA = a.brand?.name ?? "";
          const brandB = b.brand?.name ?? "";
          const brandCompare = brandA.localeCompare(brandB, "en", { sensitivity: "base" });
          if (brandCompare !== 0) return brandCompare;
          return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
        });
        break;
    }

    return sorted;
  }, [filteredProducts, sortKey]);

  const selectProduct = (slug: string) => {
    setSelected((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }
      if (current.length >= 4) {
        setMessage("You can compare up to 4 products.");
        return current;
      }
      return [...current, slug];
    });
  };

  const clearSelection = () => setSelected([]);

  const clearAll = () => {
    setQuery("");
    setActiveFilter(null);
  };

  const selectedProducts = selected
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is ProductWithBrand => Boolean(product));

  return (
    <section id="products" className={`page-container section-spacing ${selected.length > 0 ? "pb-28" : ""}`}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563eb]">
            Compare Dehumidifiers
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Compare Dehumidifiers
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          Active products are sourced from our database and shown with real technical specifications.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <label htmlFor="product-search" className="text-sm font-semibold text-slate-900">
                Search products
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  id="product-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by brand, model, type..."
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none outline-offset-2 transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  disabled={!query}
                  className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {filteredProducts.length} products found
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2563eb]">Quick filters</p>
            {(query || activeFilter) && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filters.map((filter) => {
              const active = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => {
                    if (filter.disabled) return;
                    setActiveFilter(active ? null : filter.key);
                  }}
                  aria-pressed={active}
                  disabled={filter.disabled}
                  className={`rounded-full border px-5 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 ${
                    active
                      ? "border-[#2563eb] bg-[#eff6ff] text-slate-950"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  } ${filter.disabled ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  <span className="block">{filter.label}</span>
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    {filter.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2563eb]">Sort products</p>
              <p className="mt-2 text-sm text-slate-600">Sort while keeping search and filters applied.</p>
            </div>
            <div>
              <label htmlFor="product-sort" className="sr-only">Sort products</label>
              <select
                id="product-sort"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="w-full min-w-[220px] rounded-full border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 outline-none outline-offset-2 transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 sm:w-auto"
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-[1.75rem] border border-red-200 bg-red-50 p-8 text-center text-sm text-red-900 shadow-sm">
          <p className="font-semibold">Unable to load products.</p>
          <p className="mt-2 text-sm text-red-700">Please refresh the page or try again later.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-700 shadow-sm">
          <p className="font-semibold">No products match your search or filter.</p>
          <p className="mt-2">Try a broader search or clear the filter.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {sortedProducts.map((product) => {
            const isSelected = selected.includes(product.slug);
            return (
              <article
                key={product.id}
                className={`group flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  isSelected ? "border-[#2563eb] ring-2 ring-[#2563eb]/10" : "border-slate-200"
                }`}
              >
                <div className="relative h-56 overflow-hidden rounded-[1.75rem] bg-slate-100 p-4">
                  <div className="relative h-full w-full">
                    <ProductImage
                      src={product.image_url ?? undefined}
                      alt={`${product.brand?.name ?? ""} ${product.name}`.trim()}
                      sizes="(max-width: 768px) 100vw, (max-width: 1279px) 50vw, 33vw"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2563eb]">
                      {product.brand?.name ?? "Brand"}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-950">{product.name}</h3>
                    <p className="text-sm text-slate-600">Model {product.model}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-950">Extraction</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {product.specifications?.extraction_litres_per_day != null
                          ? `${product.specifications.extraction_litres_per_day} L/day`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-950">Noise</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {product.specifications?.noise_db != null
                          ? `${product.specifications.noise_db} dB`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-950">Power</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {product.specifications?.power_watts != null
                          ? `${product.specifications.power_watts} W`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-950">Type</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {product.specifications?.dehumidifier_type ?? "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.specifications?.laundry_mode && (
                      <span className="badge-pill">Laundry mode</span>
                    )}
                    {product.specifications?.continuous_drainage && (
                      <span className="badge-pill">Continuous drainage</span>
                    )}
                    {product.specifications?.air_purification && (
                      <span className="badge-pill">Air purification</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => selectProduct(product.slug)}
                      aria-pressed={selected.includes(product.slug)}
                      className={`inline-flex h-12 w-full items-center justify-center rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 ${
                        selected.includes(product.slug)
                          ? "border-[#2563eb] bg-[#eff6ff] text-slate-950"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {selected.includes(product.slug) ? "Added to compare" : "Add to compare"}
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#2563eb] bg-[#2563eb] px-4 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <CompareBar
          selected={selected}
          products={selectedProducts}
          onRemove={selectProduct}
          onClear={clearSelection}
        />
      )}
    </section>
  );
};

export default ProductCatalogue;
