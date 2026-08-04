import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container section-spacing">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-4 text-slate-700">The page you requested couldn't be found.</p>
      <p className="mt-6">
        <Link href="/" className="text-[#2563eb] font-medium">Return to homepage</Link>
      </p>
    </main>
  );
}
