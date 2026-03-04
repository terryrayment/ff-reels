import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";
import { companyTerritory } from "../production-companies";

/**
 * Scrapes SHOOTonline.com for new commercial production credits.
 * SHOOT is a leading US trade publication for commercial/entertainment production.
 *
 * Targets their "Spot of the Week" (SPW) section and news articles.
 * Many pages are server-rendered so Cheerio works here.
 */
export class ShootOnlineAdapter implements SourceAdapter {
  name = "SHOOT";

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    try {
      // Try multiple SHOOT pages for best coverage
      const urls = [
        "https://www.shootonline.com/spw",
        "https://www.shootonline.com/news",
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
              Accept: "text/html",
            },
            signal: AbortSignal.timeout(15000),
          });

          if (!res.ok) continue;

          const html = await res.text();
          const $ = cheerio.load(html);

          // SHOOT's Spot of the Week section has article items
          $("article, .node, .views-row").each((_, el) => {
            const title =
              $(el).find("h2, h3, .field-title").first().text().trim() || "";
            const body =
              $(el).find(".field-body, .body, .teaser").first().text().trim() || "";
            const link = $(el).find("a").first().attr("href") || "";

            if (!title) return;

            // Reject if title looks like HTML/tracking garbage
            if (title.includes("<") || title.includes("google-analytics") || title.length > 200) return;

            // Parse credits from body text — SHOOT often has "Brand: X, Director: Y" format
            const brandMatch = body.match(/(?:brand|client|for)\s*:?\s*([^,.\n]+)/i);
            const directorMatch = body.match(/(?:director|directed by)\s*:?\s*([^,.\n]+)/i);
            const prodCoMatch = body.match(/(?:production company|prod\.?\s*co\.?|produced by)\s*:?\s*([^,.\n]+)/i);
            const agencyMatch = body.match(/(?:agency)\s*:?\s*([^,.\n]+)/i);

            const brand = brandMatch?.[1]?.trim() || title;
            const prodCo = prodCoMatch?.[1]?.trim();
            const directorName = directorMatch?.[1]?.trim();

            // Reject if the extracted brand/director contain HTML
            if (brand.includes("<") || brand.includes("img")) return;
            if (directorName && (directorName.includes("<") || directorName.length > 80)) return;

            const territory = prodCo ? companyTerritory(prodCo) : null;

            credits.push({
              brand,
              campaignName: title.length <= 100 ? title : undefined,
              agency: agencyMatch?.[1]?.trim() || undefined,
              productionCompany: prodCo || undefined,
              directorName: directorName || undefined,
              territory: territory ?? undefined,
              sourceUrl: link.startsWith("http")
                ? link
                : link
                  ? `https://www.shootonline.com${link}`
                  : undefined,
              sourceName: "SHOOT",
            });
          });
        } catch {
          // Continue to next URL
        }
      }
    } catch (err) {
      console.error("[SHOOT scraper] Error:", err);
    }

    return credits;
  }
}
