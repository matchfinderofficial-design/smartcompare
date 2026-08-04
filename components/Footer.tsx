import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/how-we-compare", label: "How We Compare" },
  { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-xl font-semibold text-slate-950">SmartCompare</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Clear product comparisons based on published manufacturer specifications.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-sm font-medium text-slate-700 transition hover:text-slate-950"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <p>Product information may change. Check the manufacturer or retailer before purchasing.</p>
          <p className="mt-3">© {year} SmartCompare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
