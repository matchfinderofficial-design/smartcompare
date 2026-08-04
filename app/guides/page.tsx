import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides | SmartCompare",
  description: "Buying guides and calculators for dehumidifiers and related products.",
};

export default function GuidesIndex() {
  return (
    <main className="page-container section-spacing">
      <h1 className="text-3xl font-semibold">Buying Guides</h1>
      <p className="mt-3 text-slate-700 max-w-3xl">Helpful guides and calculators to help you choose and compare products.</p>

      <ul className="mt-6 space-y-4">
        <li>
          <Link href="/guides/dehumidifier-running-cost" className="text-[#2563eb] font-medium">Dehumidifier running cost calculator</Link>
        </li>
        <li>
          <span className="text-slate-700">Best Dehumidifiers for Drying Laundry — coming soon</span>
        </li>
        <li>
          <span className="text-slate-700">Compressor vs Desiccant Dehumidifiers — coming soon</span>
        </li>
        <li>
          <span className="text-slate-700">What Size Dehumidifier Do I Need? — coming soon</span>
        </li>
      </ul>
    </main>
  );
}
