import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | SmartCompare",
  description: "SmartCompare organises published manufacturer specifications to help users compare products objectively.",
};

export default function AboutPage() {
  return (
    <main className="page-container section-spacing">
      <h1 className="text-3xl font-semibold">About SmartCompare</h1>
      <p className="mt-4 text-lg text-slate-700 max-w-3xl">
        SmartCompare organises published manufacturer specifications so you can compare products side-by-side.
        Our goal is to present factual data and simple objective calculations to help you decide which product best
        matches your needs.
      </p>

      <p className="mt-6 text-sm text-slate-600">See our <Link href="/how-we-compare" className="text-[#2563eb]">How We Compare</Link> page for details on our methodology.</p>
    </main>
  );
}
