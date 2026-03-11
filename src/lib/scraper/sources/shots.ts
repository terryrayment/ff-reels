import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";
import { companyTerritory } from "../production-companies";

/**
 * Scrapes shots.net /work page for latest commercial credits.
 * shots.net is one of the top industry publications for commercial production.
 */
export class ShotsAdapter implements SourceAdapter {
  name = "SHOTS";

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    try {
      // shots.net work listing
      const res = await fetch("https://shots.net/work", {
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

      // shots.net uses article cards for work entries
      $("article, .work-item, .card, [class*='work']").each((_, el) => {
        const title =
          $(el).find("h2, h3, .title, [class*='title']").first().text().trim() || "";
        const brand =
          $(el).find(".brand, .client, [class*='brand'], [class*='client']").first().text().trim() || "";
        const director =
          $(el).find(".director, [class*='director']").first().text().trim() || "";
        const prodCo =
          $(el).find(".production, .company, [class*='production']").first().text().trim() || "";
        const agency =
          $(el).find(".agency, [class*='agency']").first().text().trim() || "";
        const link = $(el).find("a").first().attr("href") || "";
        const thumbnailUrl =
          $(el).find("img").first().attr("src") ||
          $(el).find("img").first().attr("data-src") ||
          undefined;

        // Need at least brand or title to be valid
        if (!brand && !title) return;

        const territory = prodCo ? companyTerritory(prodCo) : null;

        credits.push({
          brand: brand || title,
          campaignName: title || undefined,
          agency: agency || undefined,
          productionCompany: prodCo || undefined,
          directorName: director || undefined,
          territory: territory ?? undefined,
          sourceUrl: link.startsWith("http")
            ? link
            : link
              ? `https://shots.net${link}`
              : undefined,
          sourceName: "SHOTS",
          thumbnailUrl: thumbnailUrl?.startsWith("http") ? thumbnailUrl : undefined,
        });
      });
    } catch (err) {
      console.error("[SHOTS scraper] Error:", err);
    }

    return credits;
  }
}
