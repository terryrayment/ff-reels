import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";
import { companyTerritory } from "../production-companies";

/**
 * Scrapes Ads of the World for latest commercial credits.
 * AdsOfTheWorld.com (part of The Drum) is a major ad archive.
 */
export class AdsOfTheWorldAdapter implements SourceAdapter {
  name = "ADS OF THE WORLD";

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    try {
      // AOTW has a media type filter — film = commercials
      const res = await fetch(
        "https://www.adsoftheworld.com/media/film",
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            Accept: "text/html",
          },
          signal: AbortSignal.timeout(15000),
        }
      );

      if (!res.ok) return credits;

      const html = await res.text();
      const $ = cheerio.load(html);

      // AOTW has ad cards with structured data
      $("article, .ad-card, [class*='card'], [class*='ad-item']").each(
        (_, el) => {
          const title =
            $(el).find("h2, h3, .title, [class*='title']").first().text().trim() || "";
          const brand =
            $(el).find(".brand, .advertiser, [class*='brand'], [class*='advertiser']").first().text().trim() || "";
          const agency =
            $(el).find(".agency, [class*='agency']").first().text().trim() || "";
          const prodCo =
            $(el).find(".production, [class*='production']").first().text().trim() || "";
          const director =
            $(el).find(".director, [class*='director']").first().text().trim() || "";
          const category =
            $(el).find(".category, .industry, [class*='category'], [class*='industry']").first().text().trim() || "";
          const link = $(el).find("a").first().attr("href") || "";
          const thumbnailUrl =
            $(el).find("img").first().attr("src") ||
            $(el).find("img").first().attr("data-src") ||
            undefined;

          if (!brand && !title) return;

          const territory = prodCo ? companyTerritory(prodCo) : null;

          credits.push({
            brand: brand || title,
            campaignName: title || undefined,
            agency: agency || undefined,
            productionCompany: prodCo || undefined,
            directorName: director || undefined,
            category: category || undefined,
            territory: territory ?? undefined,
            sourceUrl: link.startsWith("http")
              ? link
              : link
                ? `https://www.adsoftheworld.com${link}`
                : undefined,
            sourceName: "ADS OF THE WORLD",
            thumbnailUrl: thumbnailUrl?.startsWith("http") ? thumbnailUrl : undefined,
          });
        }
      );
    } catch (err) {
      console.error("[ADS OF THE WORLD scraper] Error:", err);
    }

    return credits;
  }
}
