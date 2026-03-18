import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";
import { companyTerritory } from "../production-companies";

/**
 * Scrapes SourceCreative.com for new commercial work credits.
 */
export class SourceCreativeAdapter implements SourceAdapter {
  name = "SOURCE CREATIVE";

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    try {
      const res = await fetch("https://sourcecreative.com/work", {
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

      // Source Creative has work cards with structured credits
      $("article, .work-card, .project-card, [class*='work'], [class*='project']").each(
        (_, el) => {
          const title =
            $(el).find("h2, h3, .title, [class*='title']").first().text().trim() || "";
          const brand =
            $(el).find(".brand, .client, [class*='brand'], [class*='client']").first().text().trim() || "";
          const director =
            $(el).find(".director, [class*='director']").first().text().trim() || "";
          const prodCo =
            $(el).find(".production-company, .company, [class*='company']").first().text().trim() || "";
          const agency =
            $(el).find(".agency, [class*='agency']").first().text().trim() || "";
          const link = $(el).find("a").first().attr("href") || "";

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
                ? `https://sourcecreative.com${link}`
                : undefined,
            sourceName: "SOURCE CREATIVE",
          });
        }
      );
    } catch (err) {
      console.error("[SOURCE CREATIVE scraper] Error:", err);
    }

    return credits;
  }
}
