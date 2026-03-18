import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";

/**
 * Adland.tv RSS feed adapter.
 *
 * Adland publishes a high-volume RSS feed (50 items) at /rss.xml.
 * Each item includes: title, link, description (CDATA with HTML),
 * pubDate, guid, author, media:content, enclosure.
 *
 * NO category tags — so we must extract all credit data from
 * title + description text.
 *
 * Adland covers advertising globally but with strong US focus.
 * We apply US-only filtering to keep results relevant.
 */
export class AdlandRss implements SourceAdapter {
  name = "ADLAND";

  private feedUrl = "https://adland.tv/rss.xml";

  // Campaign-related title patterns
  private static CREDIT_KEYWORDS = [
    /\b(?:campaign|spot|commercial|ad\b|film|video)\b/i,
    /\b(?:directs?|directed|directing)\b/i,
    /\b(?:launches?|debuts?|unveils?|releases?|drops?)\b/i,
    /\b(?:super bowl|big game)\b/i,
    /\b(?:brand film|branded content|anthem)\b/i,
  ];

  // Skip non-campaign articles
  private static SKIP_PATTERNS = [
    /\b(?:podcast|webinar|event|summit)\b/i,
    /\b(?:opinion|editorial|rant|column)\b/i,
    /\b(?:hired|appointed|promoted|departs|exits)\b/i,
    /\b(?:earnings|revenue|stock|ipo)\b/i,
    /\b(?:review|recap|roundup|predictions|trends)\b/i,
  ];

  // Non-US markers
  private static NON_US_MARKERS = [
    " uk ", " u.k.", " london", " paris", " berlin", " amsterdam",
    " tokyo", " shanghai", " mumbai", " sydney", " melbourne",
    " toronto", " são paulo", " buenos aires",
    "australian", "british", "european",
  ];

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    try {
      const res = await fetch(this.feedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FFReels/1.0)",
          Accept: "application/rss+xml, application/xml, text/xml",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.error(`[ADLAND] RSS feed: HTTP ${res.status}`);
        return credits;
      }

      const xml = await res.text();
      const $ = cheerio.load(xml, { xml: true });

      $("item").each((_, el) => {
        const title = $(el).find("title").text().trim();
        const link = $(el).find("link").text().trim();
        const pubDate = $(el).find("pubDate").text().trim();
        const description = $(el).find("description").text().trim();

        if (!title) return;

        const titleLower = ` ${title.toLowerCase()} `;

        // Skip non-campaign articles
        if (AdlandRss.SKIP_PATTERNS.some((p) => p.test(title))) return;

        // Skip obviously non-US content
        if (AdlandRss.NON_US_MARKERS.some((m) => titleLower.includes(m)))
          return;

        // Parse description HTML to text
        const descText = description
          ? cheerio.load(description).text().trim()
          : "";
        const fullText = `${title}. ${descText}`;

        // Only process articles that look like campaign/credit coverage
        if (!AdlandRss.CREDIT_KEYWORDS.some((p) => p.test(fullText))) return;

        // Also check description for non-US markers
        const descLower = ` ${descText.toLowerCase()} `;
        if (AdlandRss.NON_US_MARKERS.some((m) => descLower.includes(m)))
          return;

        // Extract credit data
        const brand = this.extractBrand(fullText);
        const director = this.extractDirector(fullText);
        const prodCo = this.extractProdCo(fullText);
        const agency = this.extractAgency(fullText);

        // Need at least a brand to be useful
        if (!brand && !director && !prodCo) return;

        credits.push({
          brand: brand || "Unknown",
          campaignName: title.length <= 120 ? title : undefined,
          agency: agency || undefined,
          productionCompany: prodCo || undefined,
          directorName: director || undefined,
          sourceUrl: link || undefined,
          sourceName: "ADLAND",
          publishedAt: pubDate ? new Date(pubDate) : undefined,
          // Pass to AI if we found a brand but no director/prodCo
          articleText:
            brand && !director && !prodCo && descText.length > 200
              ? descText.slice(0, 8000)
              : undefined,
        });
      });

      console.log(`[ADLAND] ${credits.length} credits extracted`);
    } catch (err) {
      console.error("[ADLAND] Error:", err);
    }

    return credits;
  }

  private extractBrand(text: string): string | undefined {
    const patterns = [
      // "Brand launches/debuts/unveils..."
      /([A-Z][a-zA-Z\s&'.]+?)\s+(?:launches|unveils|debuts|releases|drops|rolls out|introduces)\s/,
      // "for Brand's new..."
      /(?:for|from)\s+([A-Z][a-zA-Z\s&'.]+?)(?:'s?\s+(?:new|latest|first|spot|campaign|ad|commercial|film))/,
      // "Brand - Campaign Title" (common in ad trade)
      /^([A-Z][a-zA-Z\s&'.]+?)\s+[-–—]\s+/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const name = match[1].trim();
        if (name.length > 1 && name.length < 50 && !name.includes("<"))
          return name;
      }
    }
    return undefined;
  }

  private extractDirector(text: string): string | undefined {
    const patterns = [
      /(?:directed by|director)\s+([A-Z][a-zA-Z\s\-']+?)(?:\.|,|\s+(?:and|from|at|via|of|for|who|has))/i,
      /(?:helmed by)\s+([A-Z][a-zA-Z\s\-']+?)(?:\.|,|\s+(?:and|from|at))/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const name = match[1].trim();
        if (name.length > 2 && name.length < 50 && !name.includes("<"))
          return name;
      }
    }
    return undefined;
  }

  private extractProdCo(text: string): string | undefined {
    const patterns = [
      /(?:through|via|produced by|production company)\s+([A-Z][a-zA-Z\s\-'&]+?)(?:\.|,|\s+(?:and|from|for))/i,
      /([A-Z][a-zA-Z\s\-'&]+?)'s\s+([A-Z][a-zA-Z\s\-']+?)\s+(?:directs?|directed)/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const name = match[1].trim();
        if (name.length > 1 && name.length < 60 && !name.includes("<"))
          return name;
      }
    }
    return undefined;
  }

  private extractAgency(text: string): string | undefined {
    const patterns = [
      /(?:agency|from agency|via)\s+([A-Z][a-zA-Z\s\-'&/\\+]+?)(?:\.|,|\s+(?:and|from|for))/i,
      /([A-Z][a-zA-Z\s\-'&/\\+]+?)\s+(?:created|conceived|developed|crafted)\s+(?:the|a|an)\s/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const name = match[1].trim();
        if (name.length > 2 && name.length < 60 && !name.includes("<"))
          return name;
      }
    }
    return undefined;
  }
}
