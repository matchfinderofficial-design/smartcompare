import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | SmartCompare",
  description: "Contact SmartCompare via the temporary email placeholder provided on this page.",
};

export default function ContactPage() {
  return (
    <main className="page-container section-spacing">
      <h1 className="text-3xl font-semibold">Contact</h1>

      <div className="mt-4 max-w-3xl text-slate-700 space-y-4">
        <p>
          For enquiries, please email: <strong>hello@smartcompare.uk</strong>
        </p>
        <p className="text-sm text-rose-600">Note: this is a temporary placeholder address and must be replaced before launch.</p>
      </div>
    </main>
  );
}
