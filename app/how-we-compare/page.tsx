import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Compare | SmartCompare",
  description: "Our comparisons use published manufacturer specifications and objective calculations. We do not claim product testing.",
};

export default function HowWeCompare() {
  return (
    <main className="page-container section-spacing">
      <h1 className="text-3xl font-semibold">How We Compare</h1>

      <section className="mt-4 max-w-3xl text-slate-700">
        <p>
          SmartCompare aggregates published manufacturer specifications and displays them side-by-side. Where possible we
          surface numeric and categorical specifications exactly as published by manufacturers and use transparent,
          objective calculations (for example, the running-cost calculator) so you can compare factual attributes.
        </p>

        <h2 className="mt-6 text-xl font-semibold">No product testing implied</h2>
        <p className="mt-2 text-slate-700">
          Unless explicitly stated, products shown on SmartCompare have not been independently tested by our team. We
          only present manufacturer-published specifications and derived, reproducible calculations.
        </p>
      </section>
    </main>
  );
}
