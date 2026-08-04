import Link from "next/link";

const navLinks = [
  { href: "/", label: "Dehumidifiers" },
  { href: "/guides", label: "Buying Guides" },
  { href: "/how-we-compare", label: "How We Compare" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563eb] text-base font-bold uppercase tracking-[0.2em] text-white">
            SC
          </span>
          <span>
            <p className="text-base font-semibold text-slate-950">SmartCompare</p>
            <p className="text-xs text-slate-500">Factual UK product comparisons</p>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="order-3 w-full text-sm sm:order-none sm:w-auto">
          <ul className="flex flex-wrap items-center gap-3 text-sm text-slate-700 md:gap-5">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/#products"
          className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
        >
          Find a Product
        </Link>
      </div>
    </header>
  );
}
