import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | SmartCompare",
  description: "SmartCompare may earn a commission from qualifying retailer links at no extra cost to users.",
};

export default function AffiliateDisclosure() {
  return (
    <main className="page-container section-spacing">
      <h1 className="text-3xl font-semibold">Affiliate Disclosure</h1>
      <p className="mt-4 text-slate-700 max-w-3xl">
        SmartCompare may earn commission from qualifying purchases made through links to retailers displayed on the
        site. This does not increase the price you pay. We do not claim existing affiliate partnerships unless explicitly
        stated on a page.
      </p>
    </main>
  );
}
