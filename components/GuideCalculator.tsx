"use client";

import { useMemo, useState } from "react";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export default function GuideCalculator() {
  const [power, setPower] = useState<number | "">(200);
  const [rate, setRate] = useState<number>(0.25);
  const [hours, setHours] = useState<number>(8);

  const clampHours = (v: number) => Math.max(0, Math.min(24, v));

  const daily = useMemo(() => {
    const p = typeof power === "number" && Number.isFinite(power) ? Math.max(0, power) : NaN;
    if (!Number.isFinite(p)) return NaN;
    return (p / 1000) * clampHours(hours) * Math.max(0, rate);
  }, [power, hours, rate]);

  const monthly = useMemo(() => (Number.isFinite(daily) ? daily * 30 : NaN), [daily]);
  const yearly = useMemo(() => (Number.isFinite(daily) ? daily * 365 : NaN), [daily]);

  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-950">Running cost calculator</h2>
      <p className="mt-2 text-sm text-slate-600">Enter wattage, hours per day and your electricity rate to estimate costs.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col text-sm">
          <span className="font-medium text-slate-700">Product wattage (W)</span>
          <input
            type="number"
            min="0"
            step="1"
            value={power}
            onChange={(e) => setPower(e.target.value === "" ? "" : Number(e.target.value))}
            className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]"
            aria-label="Product wattage in watts"
          />
        </label>

        <label className="flex flex-col text-sm">
          <span className="font-medium text-slate-700">Hours used per day</span>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(Math.max(0, Math.min(24, Number(e.target.value) || 0)))}
            className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]"
            aria-label="Hours used per day"
          />
        </label>

        <label className="flex flex-col text-sm">
          <span className="font-medium text-slate-700">Electricity rate (£/kWh)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(Math.max(0, Number(e.target.value) || 0))}
            className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563eb]"
            aria-label="Electricity rate in pounds per kilowatt hour"
          />
          <span className="mt-1 text-xs text-slate-500">Default £0.25/kWh — example only</span>
        </label>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-600">Estimated cost per day</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{Number.isFinite(daily) ? gbp.format(daily) : 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Estimated cost per 30-day month</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{Number.isFinite(monthly) ? gbp.format(monthly) : 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Estimated cost per year</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{Number.isFinite(yearly) ? gbp.format(yearly) : 'N/A'}</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">These are estimates. Actual consumption varies with operating mode, ambient humidity and duty cycle.</p>
    </div>
  );
}
