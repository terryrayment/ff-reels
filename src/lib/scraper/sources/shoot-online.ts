import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";
import { companyTerritory } from "../production-companies";

/**
 * Scrapes SHOOTonline.com for new commercial production credits.
 * SHOOT is a leading US trade publication for commercial/entertainment production.
 */
export class ShootOnlineAdapter implements SourceAdapter {
  name = "SHOOT";

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    try {
      const res = await fetch("https://www.shootonline.com/spw", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) return credits;

      const html = await res.text();
      const $ = cheerio.load(html);

      // SHOOT's Spot of the Week section has article items
      $("article, .node, .views-row, [class*='spot']").each((_, el) => {
        const title =
          $(el).find("h2, h3, .field-title, [class*='title']").first().text().trim() || "";
        const body =
          $(el).find(".field-body, .body, p").first().text().trim() || "";
        const link = $(el).find("a").first().attr("href") || "";

        if (!title) return;

        // Parse credits from body text — SHOOT often has "Brand: X, Director: Y" format
        const brandMatch = body.match(/(?:brand|client|for)\s*:?\s*([^,.\n]+)/i);
        const directorMatch = body.match(/(?:director|directed by)\s*:?\s*([^,.\n]+)/i);
        const prodCoMatch = body.match(/(?:production company|prod\.?\s*co\.?|produced by)\s*:?\s*([^,.\n]+)/i);
        const agencyMatch = body.match(/(?:agency)\s*:?\s*([^,.\n]+)/i);

        const brand = brandMatch?.[1]?.trim() || title;
        const prodCo = prodCoMatch?.[1]?.trim();
        const territory = prodCo ? companyTerritory(prodCo) : null;

        credits.push({
          brand,
          campaignName: title || undefined,
          agency: agencyMatch?.[1]?.trim() || undefined,
          productionCompany: prodCo || undefined,
          directorName: directorMatch?.[1]?.trim() || undefined,
          territory: territory ?? undefined,
          sourceUrl: link.startsWith("http")
            ? link
            : link
              ? `https://www.shootonline.com${link}`
              : undefined,
          sourceName: "SHOOT",
        });
      });
    } catch (err) {
      console.error("[SHOOT scraper] Error:", err);
    }

    return credits;
  }
}
