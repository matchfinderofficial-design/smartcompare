"use client";

import type React from "react";
import { useMemo, useState } from "react";
import type { ProductWithBrand } from "@/lib/types";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

type Props = {
  products: ProductWithBrand[];
};

export default function ComparisonRunningCosts({ products }: Props) {
  const [rate, setRate] = useState<number>(0.25);
  const [hours, setHours] = useState<number>(8);

  const clampHours = (v: number) => Math.max(0, Math.min(24, v));

  const costs = useMemo(() => {
    return products.map((p) => {
      const power = p.specifications?.power_watts;
      if (typeof power !== "number" || !Number.isFinite(power)) return { daily: NaN, monthly: NaN, yearly: NaN };
      const daily = (Math.max(0, power) / 1000) * clampHours(hours) * rate;
      return { daily, monthly: daily * 30, yearly: daily * 365 };
    });
  }, [products, rate, hours]);

  const findMin = (key: keyof (typeof costs)[0]) => {
    const vals = costs.map((c) => c[key]);
    const finite = vals.filter(Number.isFinite);
    if (finite.length === 0) return new Set<number>();
    const min = Math.min(...finite);
    const s = new Set<number>();
    vals.forEach((v, i) => { if (Number.isFinite(v) && v === min) s.add(i); });
    return s;
  };

  const minDaily = findMin("daily");
  const minMonthly = findMin("monthly");
  const minYearly = findMin("yearly");
  const gridStyle = { '--cols': products.length } as React.CSSProperties;

  return (
    <div className="space-y-4">
      <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col text-sm">
            <span className="text-slate-700 font-medium">Electricity rate (£/kWh)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => setRate(Math.max(0, Number(e.target.value) || 0))}
              className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-slate-700 font-medium">Hours used per day</span>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={hours}
              onChange={(e) => setHours(clampHours(Number(e.target.value) || 0))}
              className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </label>

          <div className="flex items-end text-sm">
            <p className="text-slate-600">These shared inputs apply to every compared product.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white">
        <div className="min-w-[700px]">
          <div className="grid min-w-full grid-cols-[1.5fr_repeat(var(--cols,1),1fr)] gap-0 border-b border-slate-200 px-4 py-3 text-sm uppercase tracking-[0.18em] text-slate-600" style={{ '--cols': products.length } as React.CSSProperties}>
            <div className="py-2 font-semibold text-slate-950">Cost estimate</div>
            {products.map((p) => (
              <div key={p.slug} className="border-l border-slate-200 px-4 py-2">
                <p className="truncate font-semibold text-slate-950">{p.name}</p>
              </div>
            ))}
          </div>

          <div className="grid min-w-full grid-cols-[1.5fr_repeat(var(--cols,1),1fr)] gap-0 px-4 py-4 text-sm text-slate-700" style={gridStyle}>
            <div className="pr-4 font-semibold text-slate-950">Estimated daily cost</div>
            {costs.map((c, i) => (
              <div key={`daily-${i}`} className={`border-l border-slate-200 px-4 py-4 ${minDaily.has(i) ? 'bg-emerald-50' : ''}`}>
                {Number.isFinite(c.daily) ? gbp.format(c.daily) : 'N/A'}
              </div>
            ))}
          </div>

          <div className="grid min-w-full grid-cols-[1.5fr_repeat(var(--cols,1),1fr)] gap-0 px-4 py-4 text-sm text-slate-700" style={gridStyle}>
            <div className="pr-4 font-semibold text-slate-950">Estimated monthly cost</div>
            {costs.map((c, i) => (
              <div key={`month-${i}`} className={`border-l border-slate-200 px-4 py-4 ${minMonthly.has(i) ? 'bg-emerald-50' : ''}`}>
                {Number.isFinite(c.monthly) ? gbp.format(c.monthly) : 'N/A'}
              </div>
            ))}
          </div>

          <div className="grid min-w-full grid-cols-[1.5fr_repeat(var(--cols,1),1fr)] gap-0 px-4 py-4 text-sm text-slate-700" style={gridStyle}>
            <div className="pr-4 font-semibold text-slate-950">Estimated annual cost</div>
            {costs.map((c, i) => (
              <div key={`year-${i}`} className={`border-l border-slate-200 px-4 py-4 ${minYearly.has(i) ? 'bg-emerald-50' : ''}`}>
                {Number.isFinite(c.yearly) ? gbp.format(c.yearly) : 'N/A'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
