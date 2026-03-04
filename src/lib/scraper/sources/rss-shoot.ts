import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";
import { companyTerritory, cityToTerritory } from "../production-companies";

/**
 * SHOOT Online RSS feed adapter.
 *
 * SHOOT publishes 4 RSS feeds:
 * - edition-newsletter-rss (main news)
 * - screenwork-rss-feed (screenwork features)
 * - brandnews-rss (SPW brand news — thin)
 * - spw-video-newsletter (SPW video — thin)
 *
 * Articles cover production industry news. Not all are commercial credits —
 * many are reviews, industry moves, tech news, etc.
 *
 * We filter for articles that contain credit-like data (brand + director,
 * or production company mentions) and extract what we can.
 *
 * Unique SHOOT feature: <location> tag gives us city/territory data.
 */
export class ShootRssAdapter implements SourceAdapter {
  name = "SHOOT";

  private feeds = [
    "https://www.shootonline.com/edition-newsletter-rss",
    "https://www.shootonline.com/screenwork-rss-feed",
  ];

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    for (const feedUrl of this.feeds) {
      try {
        const res = await fetch(feedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; FFReels/1.0)",
            Accept: "application/rss+xml, application/xml, text/xml",
          },
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) continue;

        const xml = await res.text();
        const $ = cheerio.load(xml, { xml: true });

        $("item").each((_, el) => {
          const title = $(el).find("title").text().trim();
          const link = $(el).find("link").text().trim();
          const pubDate = $(el).find("pubDate").text().trim();
          const description = $(el).find("description").text().trim();
          const location = $(el).find("location").text().trim();

          if (!title) return;

          // Skip non-commercial articles (reviews, tech news, opinion)
          const titleLower = title.toLowerCase();
          if (this.isNonCommercial(titleLower, description.toLowerCase())) return;

          // Try to extract structured credit data from title + description
          const fullText = `${title}. ${description}`;
          const brand = this.extractBrand(fullText);
          const director = this.extractDirector(fullText);
          const prodCo = this.extractProductionCompany(fullText);
          const agency = this.extractAgency(fullText);

          // Need at least a brand or production company to be useful
          if (!brand && !prodCo) return;

          // Resolve territory from location tag or production company
          let territory: "EAST" | "MIDWEST" | "WEST" | undefined;
          if (location) {
            const city = location.replace(/\s*\(AP\)\s*/g, "").trim();
            territory = cityToTerritory(city) ?? undefined;
          }
          if (!territory && prodCo) {
            territory = companyTerritory(prodCo) ?? undefined;
          }

          credits.push({
            brand: brand || prodCo || title.slice(0, 80),
            campaignName: brand ? title.slice(0, 120) : undefined,
            agency: agency || undefined,
            productionCompany: prodCo || undefined,
            directorName: director || undefined,
            territory,
            sourceUrl: link || undefined,
            sourceName: "SHOOT",
            publishedAt: pubDate ? new Date(pubDate) : undefined,
          });
        });
      } catch (err) {
        console.error(`[SHOOT RSS] Error fetching ${feedUrl}:`, err);
      }
    }

    return credits;
  }

  private isNonCommercial(title: string, desc: string): boolean {
    const skipPatterns = [
      "oscar", "academy award", "emmy", "golden globe", "bafta",
      "review:", "reviews ", "box office", "trial against",
      "acquires ", "acquisition", "ipo", "stock",
      "election", "political", "congress", "senate",
      "obituary", "passes away", "dies at",
      "festival recap", "box office report",
    ];
    return skipPatterns.some(
      (p) => title.includes(p) || desc.slice(0, 200).includes(p)
    );
  }

  private extractBrand(text: string): string | undefined {
    // Common patterns: "for Nike", "Brand X's new spot", "X launches"
    const patterns = [
      /(?:for|from|by)\s+([A-Z][a-zA-Z\s&'.]+?)(?:'s?\s+(?:new|latest|first|spot|campaign|ad|commercial|film))/,
      /([A-Z][a-zA-Z\s&'.]+?)\s+(?:launches|unveils|debuts|releases|drops|rolls out|introduces)\s/,
      /(?:brand|client|advertiser)\s*:?\s*([A-Z][a-zA-Z\s&'.]+?)(?:\.|,|\s+(?:and|with|through|via))/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const name = match[1].trim();
        if (name.length > 1 && name.length < 50 && !name.includes("<")) return name;
      }
    }
    return undefined;
  }

  private extractDirector(text: string): string | undefined {
    const patterns = [
      /(?:directed by|director[s]?\s+)\s*([A-Z][a-zA-Z\s\-']+?)(?:\.|,|\s+(?:and|from|through|at|via|of|for|who|has|with))/i,
      /(?:helmed by|lensed by)\s+([A-Z][a-zA-Z\s\-']+?)(?:\.|,|\s+(?:and|from|through|at|via))/i,
      /director\s+([A-Z][a-zA-Z\s\-']+?)(?:\s+(?:and|has|at|of|via|from|directed))/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const name = match[1].trim();
        if (name.length > 2 && name.length < 50 && !name.includes("<")) return name;
      }
    }
    return undefined;
  }

  private extractProductionCompany(text: string): string | undefined {
    const patterns = [
      /(?:through|via|produced by|production (?:company|house))\s+([A-Z][a-zA-Z\s\-'&]+?)(?:\.|,|\s+(?:and|from|for|with|in|has|directed))/i,
      /(?:joins|signs with|has signed with|repped by)\s+([A-Z][a-zA-Z\s\-'&]+?)(?:\.|,|\s+(?:and|from|for))/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const name = match[1].trim();
        if (name.length > 1 && name.length < 60 && !name.includes("<")) return name;
      }
    }
    return undefined;
  }

  private extractAgency(text: string): string | undefined {
    const patterns = [
      /(?:agency|via agency|from)\s+([A-Z][a-zA-Z\s\-'&/\\+]+?)(?:\.|,|\s+(?:and|from|for|with|in|has))/i,
      /([A-Z][a-zA-Z\s\-'&/\\+]+?)\s+(?:created|conceived|developed|crafted)\s+(?:the|a|an)\s/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const name = match[1].trim();
        if (name.length > 2 && name.length < 60 && !name.includes("<")) return name;
      }
    }
    return undefined;
  }
}
