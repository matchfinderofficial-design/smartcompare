import { NextResponse } from "next/server";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const sitemapUrl = `${site.replace(/\/$/, "")}/sitemap.xml`;
  const body = `User-agent: *\nDisallow:\nSitemap: ${sitemapUrl}\n`;
  return new NextResponse(body, { headers: { "Content-Type": "text/plain" } });
}

export default GET;
