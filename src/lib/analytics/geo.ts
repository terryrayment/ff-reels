/**
 * Extract geolocation from request headers.
 * Uses Vercel's automatic geo headers in production.
 * Returns nulls in local dev (no external API calls).
 */

import { NextRequest } from "next/server";

export interface GeoInfo {
  ip: string | null;
  city: string | null;
  country: string | null;
}

export function extractGeo(req: NextRequest): GeoInfo {
  // Vercel populates these automatically on serverless/edge
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;

  const city = req.headers.get("x-vercel-ip-city") ?? null;
  const country = req.headers.get("x-vercel-ip-country") ?? null;

  return {
    ip: ip === "::1" || ip === "127.0.0.1" ? null : ip,
    city: city ? decodeURIComponent(city) : null,
    country,
  };
}
