import Link from "next/link";
import GuideCalculator from "@/components/GuideCalculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dehumidifier Running Cost Calculator | SmartCompare",
  description:
    "Estimate the daily, monthly and annual electricity cost of running a dehumidifier using its wattage, usage time and your electricity tariff.",
};

export default function GuidePage() {
  return (
    <main className="bg-[#f8fafc] text-slate-950">
      <div className="page-container section-spacing">
        <nav className="mb-6 text-sm text-slate-600" aria-label="Breadcrumb">
          <Link href="/" className="font-medium text-slate-700 hover:text-slate-900">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-500">Running Cost Calculator</span>
        </nav>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-semibold text-slate-950">Dehumidifier running cost calculator</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Use the calculator to estimate how much it costs to run a dehumidifier based on its wattage, how many hours you
              run it each day, and your electricity tariff (price per kilowatt-hour).
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-950">How it works — plain English</h2>
            <p className="mt-3 text-sm text-slate-600">
              The product wattage is given in watts (W). One kilowatt (kW) is 1000 watts. Electricity is billed in kilowatt-hours
              (kWh), which is the power in kilowatts multiplied by the time in hours. To estimate cost:
            </p>
            <pre className="mt-3 rounded bg-slate-50 p-3 text-sm">cost = (power_watts / 1000) × hours_per_day × electricity_rate_gbp × number_of_days</pre>
            <p className="mt-3 text-sm text-slate-600">We use example values in the calculator; replace the electricity rate with your own tariff.</p>
          </div>

          <div>
            <GuideCalculator />
          </div>

          <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <p>
              These are estimates based on the device&apos;s rated power. Actual energy use varies with operating mode, humidity,
              and duty cycle. This page does not claim any specific tariff — the default £0.25/kWh is an example for
              demonstration only.
            </p>
            <p className="mt-3">
              <Link href="/#products" className="text-[#2563eb] font-semibold">Return to the product catalogue</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
