import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | SmartCompare",
  description: "Simple UK-focused privacy notice for SmartCompare.",
};

export default function PrivacyPage() {
  return (
    <main className="page-container section-spacing">
      <h1 className="text-3xl font-semibold">Privacy</h1>

      <div className="mt-4 max-w-3xl text-slate-700 space-y-4">
        <p>
          SmartCompare is a small informational site. We may use basic analytics to understand site usage. We do not
          require user accounts to use the site and do not sell personal data.
        </p>

        <h2 className="text-xl font-semibold">Data we may collect</h2>
        <p>
          Non-identifying usage data such as page visits, device and browser type, and referrers may be collected via
          standard analytics tools. No sensitive information is collected by default.
        </p>

        <h2 className="text-xl font-semibold">Cookies</h2>
        <p>
          We may set non-essential cookies for analytics. Users may opt out using browser controls where supported.
        </p>
      </div>
    </main>
  );
}
