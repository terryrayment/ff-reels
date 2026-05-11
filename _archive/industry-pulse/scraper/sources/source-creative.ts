import { ScrapedCredit, SourceAdapter } from "../types";
import { agencyTerritory, companyTerritory } from "../production-companies";

function decodePayload(html: string): string {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\\\//g, "/");
}

function clean(value?: string): string | undefined {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned : undefined;
}

/**
 * SourceCreative embeds structured credit payloads in the HTML. Parsing the
 * payload is more stable than trying to infer credits from card markup.
 */
export class SourceCreativeAdapter implements SourceAdapter {
  name = "SOURCE CREATIVE";

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];
    const seen = new Set<string>();

    try {
      const res = await fetch("https://sourcecreative.com/work", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) return credits;

      const decoded = decodePayload(await res.text());

      const re =
        /"BrandName":"([^"]*)".{0,1200}?"DirectorFirstName":"([^"]*)".{0,120}?"DirectorLastName":"([^"]*)".{0,1200}?"AgencyName":"([^"]*)".{0,1200}?"ProductionCompanyName":"([^"]*)"/g;

      for (const match of Array.from(decoded.matchAll(re))) {
        const brand = clean(match[1]);
        const directorFirst = clean(match[2]);
        const directorLast = clean(match[3]);
        const agency = clean(match[4]);
        const productionCompany = clean(match[5]);

        if (!brand || !agency || !productionCompany) continue;

        const directorName = clean([directorFirst, directorLast].filter(Boolean).join(" "));
        const territory =
          companyTerritory(productionCompany) ?? agencyTerritory(agency) ?? undefined;

        // Keep this source US-focused for the alert feed.
        if (!territory) continue;

        const key = [brand, directorName, agency, productionCompany].join("|").toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        credits.push({
          brand,
          agency,
          productionCompany,
          directorName,
          territory,
          sourceName: "SOURCE CREATIVE",
        });
      }
    } catch (err) {
      console.error("[SOURCE CREATIVE scraper] Error:", err);
    }

    return credits;
  }
}
