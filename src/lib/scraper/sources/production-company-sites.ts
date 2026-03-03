import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";
import { PRODUCTION_COMPANIES } from "../production-companies";

/**
 * Scrapes individual production company websites for their latest work.
 * Iterates through the curated company list and attempts to find
 * new work entries from their /work, /projects, or /latest pages.
 */
export class ProductionCompanySitesAdapter implements SourceAdapter {
  name = "PROD CO SITES";

  // Limit concurrent requests
  private concurrency = 5;
  // Only scrape companies with known websites
  private companies = PRODUCTION_COMPANIES.filter((c) => c.website);

  async scrape(): Promise<ScrapedCredit[]> {
    const allCredits: ScrapedCredit[] = [];

    // Process in batches to avoid overwhelming
    for (let i = 0; i < this.companies.length; i += this.concurrency) {
      const batch = this.companies.slice(i, i + this.concurrency);
      const results = await Promise.allSettled(
        batch.map((co) => this.scrapeCompany(co))
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          allCredits.push(...result.value);
        }
      }
    }

    return allCredits;
  }

  private async scrapeCompany(
    company: (typeof PRODUCTION_COMPANIES)[number]
  ): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];
    if (!company.website) return credits;

    // Try common work page paths
    const workPaths = ["/work", "/projects", "/latest", "/portfolio", ""];
    const baseUrl = company.website.replace(/\/$/, "");

    for (const path of workPaths) {
      try {
        const url = `${baseUrl}${path}`;
        const res = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            Accept: "text/html",
          },
          signal: AbortSignal.timeout(10000),
          redirect: "follow",
        });

        if (!res.ok) continue;

        const html = await res.text();
        const $ = cheerio.load(html);

        // Look for work/project items with structured data
        $(
          "article, .work-item, .project-item, .project, [class*='work-'], [class*='project-'], .grid-item"
        ).each((_, el) => {
          const title =
            $(el)
              .find("h2, h3, h4, .title, [class*='title'], [class*='name']")
              .first()
              .text()
              .trim() || "";
          const brand =
            $(el)
              .find(
                ".brand, .client, [class*='brand'], [class*='client']"
              )
              .first()
              .text()
              .trim() || "";
          const director =
            $(el)
              .find(".director, [class*='director']")
              .first()
              .text()
              .trim() || "";
          const link = $(el).find("a").first().attr("href") || "";

          if (!title && !brand) return;

          credits.push({
            brand: brand || "—",
            campaignName: title || undefined,
            productionCompany: company.name,
            directorName: director || undefined,
            territory: company.territory,
            sourceUrl: link.startsWith("http")
              ? link
              : link
                ? `${baseUrl}${link.startsWith("/") ? "" : "/"}${link}`
                : url,
            sourceName: `${company.name} website`,
          });
        });

        // If we found credits on this path, don't try others
        if (credits.length > 0) break;
      } catch {
        // Silently continue to next path
        continue;
      }
    }

    // Limit to most recent entries per company
    return credits.slice(0, 10);
  }
}
