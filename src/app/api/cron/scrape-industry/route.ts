import { NextResponse } from "next/server";
import { runNightlyScrape } from "@/lib/scraper/engine";

/**
 * Nightly industry credits scrape.
 * Triggered automatically by Vercel Cron at 3 AM EST daily.
 *
 * Manual trigger:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://reels.friendsandfamily.tv/api/cron/scrape-industry
 */
export async function GET(req: Request) {
  // Verify request is from Vercel Cron or has valid secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 403 });
  }

  try {
    const result = await runNightlyScrape();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Cron] Scrape failed:", err);
    return NextResponse.json(
      { error: "Scrape failed", details: String(err) },
      { status: 500 }
    );
  }
}

// Allow long execution (Vercel Pro: 60s, Enterprise: 300s)
export const maxDuration = 60;
