import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";

/**
 * LBB (Little Black Book) RSS feed adapter.
 *
 * LBB's main site is behind Cloudflare, but their RSS feed at
 * /news/feed is publicly accessible and returns valid RSS 2.0.
 *
 * Feed structure: title, link, description (summary), guid,
 * content:encoded (image only), media:thumbnail.
 *
 * Since the feed items are sparse (no full content), we:
 * 1. Parse titles for brand/director/prodCo patterns
 * 2. Fetch article pages for the best candidates
 * 3. Pass article text for AI enrichment
 *
 * LBB is production-focused — most articles cover director signings,
 * new work announcements, and production company news.
 */
export class LbbOnlineRss implements SourceAdapter {
  name = "LBB ONLINE";

  private feedUrl = "https://www.lbbonline.com/news/feed";

  // Title patterns that indicate production credit content
  private static CREDIT_KEYWORDS = [
    /\b(?:directs?|directed|directing)\b/i,
    /\b(?:campaign|spot|commercial|ad\b|film)\b/i,
    /\b(?:launches?|debuts?|unveils?|releases?|drops?|premieres?)\b/i,
    /\b(?:signs|joins|roster|representation)\b/i,
    /\b(?:production|produced|produces)\b/i,
    /\b(?:new work|latest work|first work)\b/i,
  ];

  // Skip non-credit articles
  private static SKIP_PATTERNS = [
    /\b(?:podcast|webinar|event|summit|awards ceremony)\b/i,
    /\b(?:opinion|editorial|column|q&a|interview|profile)\b/i,
    /\b(?:year in review|roundup|predictions|trends)\b/i,
    /\b(?:hired|appointed|promoted|ceo|coo|cfo)\b/i,
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
        console.error(`[LBB] RSS feed: HTTP ${res.status}`);
        return credits;
      }

      const xml = await res.text();
      const $ = cheerio.load(xml, { xml: true });

      const candidates: Array<{
        title: string;
        link: string;
        description: string;
      }> = [];

      $("item").each((_, el) => {
        const title = $(el).find("title").text().trim();
        const link = $(el).find("link").text().trim();
        const description = $(el).find("description").text().trim();

        if (!title || !link) return;

        // Skip non-credit articles
        if (LbbOnlineRss.SKIP_PATTERNS.some((p) => p.test(title))) return;

        candidates.push({ title, link, description });
      });

      console.log(`[LBB] ${candidates.length} articles from RSS`);

      // Process candidates — try to extract from title + description first
      for (const candidate of candidates) {
        const fullText = `${candidate.title}. ${candidate.description}`;
        const isCreditArticle = LbbOnlineRss.CREDIT_KEYWORDS.some((p) =>
          p.test(fullText),
        );

        // Extract what we can from title/description
        const brand = this.extractBrand(fullText);
        const director = this.extractDirector(fullText);
        const prodCo = this.extractProdCo(fullText);
        const agency = this.extractAgency(fullText);

        if (brand || director || prodCo) {
          credits.push({
            brand: brand || "Unknown",
            campaignName:
              candidate.title.length <= 120 ? candidate.title : undefined,
            agency: agency || undefined,
            productionCompany: prodCo || undefined,
            directorName: director || undefined,
            sourceUrl: candidate.link,
            sourceName: "LBB ONLINE",
          });
        } else if (isCreditArticle) {
          // Article looks like it has credits but we couldn't parse them —
          // pass to AI enrichment via articleText
          credits.push({
            brand: "Unknown",
            campaignName:
              candidate.title.length <= 120 ? candidate.title : undefined,
            sourceUrl: candidate.link,
            sourceName: "LBB ONLINE",
            articleText: fullText.slice(0, 4000),
          });
        }
      }

      console.log(`[LBB] ${credits.length} credits extracted`);
    } catch (err) {
      console.error("[LBB] Error:", err);
    }

    return credits;
  }

  private extractBrand(text: string): string | undefined {
    const patterns = [
      /(?:for|from)\s+([A-Z][a-zA-Z\s&'.]+?)(?:'s?\s+(?:new|latest|first|spot|campaign|ad|commercial|film))/,
      /([A-Z][a-zA-Z\s&'.]+?)\s+(?:launches|unveils|debuts|releases|drops|rolls out)\s/,
      /(?:brand|client)\s*:?\s*([A-Z][a-zA-Z\s&'.]+?)(?:\.|,|\s+(?:and|with|via))/i,
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
      /(?:helmed by|lensed by)\s+([A-Z][a-zA-Z\s\-']+?)(?:\.|,|\s+(?:and|from|at|via))/i,
      /([A-Z][a-zA-Z\s\-']+?)\s+(?:directs?|directed)\s+(?:new|a|the|for)/i,
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
      /(?:through|via|produced by|production company)\s+([A-Z][a-zA-Z\s\-'&]+?)(?:\.|,|\s+(?:and|from|for|with))/i,
      /([A-Z][a-zA-Z\s\-'&]+?)'s\s+([A-Z][a-zA-Z\s\-']+?)\s+(?:directs?|directed)/,
      /(?:signs with|joins|repped by)\s+([A-Z][a-zA-Z\s\-'&]+?)(?:\.|,|\s)/i,
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
      /(?:agency|via agency|from agency)\s+([A-Z][a-zA-Z\s\-'&/\\+]+?)(?:\.|,|\s+(?:and|from|for))/i,
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
