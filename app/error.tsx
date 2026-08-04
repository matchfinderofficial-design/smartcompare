"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log to console for developers; do not expose details to users
    // Consider integrating a server-side error tracker in production
    console.error(error);
  }, [error]);

  return (
    <main className="page-container section-spacing">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-4 text-slate-700">An unexpected error occurred. Please try again later.</p>
      <div className="mt-6">
        <button
          onClick={() => reset()}
          className="inline-flex items-center rounded bg-[#2563eb] px-4 py-2 text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
