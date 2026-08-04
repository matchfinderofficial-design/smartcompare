"use client";

import { useMemo, useState } from "react";

type Props = {
  powerWatts?: number | null;
  className?: string;
};

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export default function RunningCostCalculator({ powerWatts, className = "" }: Props) {
  const [rate, setRate] = useState<number>(0.25);
  const [hours, setHours] = useState<number>(8);

  const safePower = typeof powerWatts === "number" && Number.isFinite(powerWatts) ? Math.max(0, powerWatts) : null;

  const clampHours = (v: number) => Math.max(0, Math.min(24, v));

  const daily = useMemo(() => {
    if (safePower == null) return NaN;
    return (safePower / 1000) * clampHours(hours) * rate;
  }, [safePower, hours, rate]);

  const monthly = useMemo(() => (Number.isFinite(daily) ? daily * 30 : NaN), [daily]);
  const yearly = useMemo(() => (Number.isFinite(daily) ? daily * 365 : NaN), [daily]);

  if (safePower == null) return null;

  return (
    <div className={`rounded-[1.25rem] border border-slate-200 bg-white p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-950">Estimated running cost</h3>
      <p className="mt-2 text-sm text-slate-600">Adjust the electricity rate and daily usage to estimate operating costs.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col text-sm">
          <span className="text-slate-700 font-medium">Electricity rate (£/kWh)</span>
          <input
            aria-label="Electricity rate in pounds per kilowatt hour"
            type="number"
            step="0.01"
            min="0"
            value={rate}
            onChange={(e) => setRate(Math.max(0, Number(e.target.value) || 0))}
            className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
          <span className="mt-1 text-xs text-slate-500">Default £0.25/kWh — replace with your tariff</span>
        </label>

        <label className="flex flex-col text-sm">
          <span className="text-slate-700 font-medium">Hours used per day</span>
          <input
            aria-label="Hours used per day"
            type="number"
            step="0.5"
            min="0"
            max="24"
            value={hours}
            onChange={(e) => setHours(clampHours(Number(e.target.value) || 0))}
            className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
          <span className="mt-1 text-xs text-slate-500">Between 0 and 24 hours</span>
        </label>

        <div className="flex flex-col text-sm">
          <span className="text-slate-700 font-medium">Product wattage</span>
          <div className="mt-2 text-sm text-slate-900">{safePower} W</div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-600">Estimated cost per day</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{Number.isFinite(daily) ? gbp.format(daily) : "N/A"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Estimated cost per 30-day month</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{Number.isFinite(monthly) ? gbp.format(monthly) : "N/A"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Estimated cost per year</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{Number.isFinite(yearly) ? gbp.format(yearly) : "N/A"}</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        These are estimates based on the product&apos;s rated power. Actual consumption varies with operating mode, ambient humidity and duty cycle.
      </p>
    </div>
  );
}
