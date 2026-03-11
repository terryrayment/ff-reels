import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";

/**
 * Adweek RSS adapter.
 *
 * Adweek's main feed provides titles + links but NO content:encoded.
 * Strategy:
 * 1. Fetch RSS feed items
 * 2. Filter to campaign/creative articles only (skip industry news, tech, upfronts)
 * 3. Fetch full article page for each candidate
 * 4. Extract article text → pass as articleText for AI extraction
 *
 * We only fetch articles that look like campaign coverage based on title keywords.
 */

const FEED_URL = "https://www.adweek.com/feed/";

// ── Title patterns that indicate campaign/creative coverage ──
const CAMPAIGN_KEYWORDS = [
  /\b(?:campaign|spot|commercial|ad\b|ads\b|film)\b/i,
  /\b(?:directs?|directed|launches?|debuts?|unveils?|drops?|releases?)\b/i,
  /\b(?:super bowl|big game)\b/i,
  /\b(?:brand film|branded content|anthem)\b/i,
  /\b(?:creative work|first work|new work|latest work)\b/i,
];

// ── Title patterns to skip — not about specific campaigns ──
const SKIP_PATTERNS = [
  /\b(?:upfront|newfront|programmatic|ad tech|data|CTV|streaming)\b/i,
  /\b(?:agency of the year|marketer of the year|rebrand)\b/i,
  /\b(?:hired|appointed|promoted|departs|exits|layoffs|cuts)\b/i,
  /\b(?:earnings|revenue|stock|IPO|acquisition|merger)\b/i,
  /\b(?:podcast|newsletter|webinar|event|summit|guide)\b/i,
  /\b(?:freelancer|career|salary|job)\b/i,
];

export class AdweekRss implements SourceAdapter {
  name = "ADWEEK";

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    try {
      // Fetch RSS feed
      const res = await fetch(FEED_URL, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FFReels/1.0)",
          Accept: "application/rss+xml, application/xml, text/xml",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.error(`[ADWEEK] RSS feed: HTTP ${res.status}`);
        return credits;
      }

      const xml = await res.text();
      const $ = cheerio.load(xml, { xml: true });

      // Collect candidate articles
      const candidates: Array<{ title: string; link: string; pubDate: string; categories: string[] }> = [];

      $("item").each((_, el) => {
        const title = $(el).find("title").text().trim();
        const link = $(el).find("link").text().trim();
        const pubDate = $(el).find("pubDate").text().trim();

        if (!title || !link) return;

        // Skip non-campaign articles
        if (SKIP_PATTERNS.some((p) => p.test(title))) return;

        // Only process articles that look like campaign coverage
        if (!CAMPAIGN_KEYWORDS.some((p) => p.test(title))) return;

        const categories: string[] = [];
        $(el).find("category").each((_, cat) => {
          const text = $(cat).text().trim();
          if (text) categories.push(text);
        });

        candidates.push({ title, link, pubDate, categories });
      });

      console.log(`[ADWEEK] ${candidates.length} campaign articles found in RSS`);

      // Fetch full article pages (max 10 to stay within time budget)
      const toFetch = candidates.slice(0, 10);

      const articlePromises = toFetch.map(async (candidate) => {
        try {
          const pageRes = await fetch(candidate.link, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept: "text/html",
            },
            signal: AbortSignal.timeout(8000),
          });

          if (!pageRes.ok) return null;

          const html = await pageRes.text();
          const page$ = cheerio.load(html);

          // Extract article body — Adweek uses article.post-content or div.entry-content
          let articleText = page$("article .post-content").text().trim();
          if (!articleText) articleText = page$(".entry-content").text().trim();
          if (!articleText) articleText = page$("article").text().trim();

          if (articleText.length < 100) return null;

          // Extract og:image for thumbnail
          const thumbnailUrl =
            page$("meta[property='og:image']").attr("content") ||
            page$("meta[name='twitter:image']").attr("content") ||
            undefined;

          // Extract brand from title or categories
          const brand = extractBrandFromTitle(candidate.title) || candidate.categories[0] || "Unknown";

          return {
            brand,
            campaignName: candidate.title.length <= 120 ? candidate.title : undefined,
            sourceUrl: candidate.link,
            sourceName: "ADWEEK",
            thumbnailUrl,
            publishedAt: candidate.pubDate ? new Date(candidate.pubDate) : undefined,
            articleText,
          } as ScrapedCredit;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(articlePromises);

      for (const result of results) {
        if (result) credits.push(result);
      }

      console.log(`[ADWEEK] ${credits.length} articles with content fetched`);
    } catch (err) {
      console.error("[ADWEEK] Error:", err);
    }

    return credits;
  }
}

/**
 * Try to extract a brand name from the article title.
 * Adweek titles often follow patterns like:
 * - "Brand Does Something..."
 * - "How Brand Is..."
 * - "Brand's New Campaign..."
 */
function extractBrandFromTitle(title: string): string | null {
  // "Brand Launches/Debuts/Unveils/Drops..."
  let m = title.match(/^(.+?)\s+(?:launches?|debuts?|unveils?|drops?|releases?|introduces?)\b/i);
  if (m && m[1].split(/\s+/).length <= 4) return m[1].trim();

  // "How Brand Is..."
  m = title.match(/^How\s+(.+?)\s+(?:Is|Are|Was|Were)\b/i);
  if (m && m[1].split(/\s+/).length <= 4) return m[1].trim();

  // "Brand's New/Latest/First..."
  m = title.match(/^(.+?)'s?\s+(?:new|latest|first|biggest|most)\b/i);
  if (m && m[1].split(/\s+/).length <= 3) return m[1].trim();

  return null;
}
