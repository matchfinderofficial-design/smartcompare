import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadataBase = new URL(siteUrl);

export const metadata: Metadata = {
  title: "SmartCompare | Factual UK product comparisons",
  description: "Factual UK dehumidifier comparisons based on published manufacturer specifications.",
  openGraph: {
    title: "SmartCompare | Factual UK product comparisons",
    description: "Factual UK dehumidifier comparisons based on published manufacturer specifications.",
    url: siteUrl,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SmartCompare | Factual UK product comparisons",
    description: "Factual UK dehumidifier comparisons based on published manufacturer specifications.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-950">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
