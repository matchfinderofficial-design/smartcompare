"use client";

import Link from "next/link";

type CompareBarProps = {
  selected: string[];
  products: { slug: string; name: string }[];
  onRemove: (slug: string) => void;
  onClear: () => void;
};

export default function CompareBar({ selected, products, onRemove, onClear }: CompareBarProps) {
  const count = selected.length;
  const compareUrl = `/compare?products=${selected.map(encodeURIComponent).join(",")}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
            Compare products
          </div>
          <div className="text-sm text-slate-700">{count} of 4 selected</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {products.map((product) => (
            <button
              key={product.slug}
              type="button"
              onClick={() => onRemove(product.slug)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
            >
              <span className="max-w-[10rem] truncate">{product.name}</span>
              <span className="text-slate-400">×</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
          >
            Clear all
          </button>
          {count >= 2 ? (
            <Link
              href={compareUrl}
              className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              Compare now
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-slate-300 px-4 py-3 text-sm font-semibold text-slate-500"
            >
              Compare now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
