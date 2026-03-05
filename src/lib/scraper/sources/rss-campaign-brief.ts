import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";

/**
 * Campaign Brief RSS feed adapter.
 *
 * campaignbrief.com publishes a WordPress RSS feed with 20 items,
 * including full content:encoded HTML. Categories include "Campaigns"
 * and "People Moves."
 *
 * While Campaign Brief is Australian-focused, it covers major
 * international campaigns and US work. We filter for US-relevant
 * content using agency/brand markers.
 *
 * Rich structured data: full article HTML in content:encoded,
 * categories, author, media:content thumbnails.
 */
export class CampaignBriefRss implements SourceAdapter {
  name = "CAMPAIGN BRIEF";

  private feedUrl = "https://campaignbrief.com/feed/";

  // Non-US markers to filter out purely local content
  private static NON_US_ONLY = [
    "australian", "australia only", "nz only", "new zealand only",
    "melbourne only", "sydney only", "auckland",
  ];

  // Known US brands that appear in Campaign Brief
  private static US_BRAND_SIGNALS = [
    /\b(?:nike|adidas|apple|google|coca-cola|pepsi|mcdonald|ford|chevrolet|toyota)\b/i,
    /\b(?:amazon|meta|microsoft|samsung|budweiser|bud light|miller)\b/i,
    /\b(?:uber|lyft|doordash|airbnb|spotify|netflix|hulu|disney)\b/i,
    /\b(?:walmart|target|costco|home depot|lowe's|cvs|walgreens)\b/i,
    /\b(?:visa|mastercard|american express|chase|capital one)\b/i,
    /\b(?:super bowl|big game|march madness|nfl|nba|mlb)\b/i,
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
        console.error(`[CAMPAIGN BRIEF] RSS feed: HTTP ${res.status}`);
        return credits;
      }

      const xml = await res.text();
      const $ = cheerio.load(xml, { xml: true });

      $("item").each((_, el) => {
        const title = $(el).find("title").text().trim();
        const link = $(el).find("link").text().trim();
        const pubDate = $(el).find("pubDate").text().trim();
        const contentEncoded = $(el).find("content\\:encoded").text().trim();
        const description = $(el).find("description").text().trim();

        if (!title) return;

        // Collect categories
        const categories: string[] = [];
        $(el).find("category").each((_, cat) => {
          const text = $(cat).text().trim();
          if (text) categories.push(text);
        });

        // Get the full text for analysis
        const fullText = contentEncoded || description || "";
        const combinedText = `${title}. ${fullText}`;

        // Skip purely non-US local content
        const titleLower = title.toLowerCase();
        if (CampaignBriefRss.NON_US_ONLY.some((m) => titleLower.includes(m)))
          return;

        // Check if article has US relevance (brand, agency, or campaign category)
        const hasUsBrand = CampaignBriefRss.US_BRAND_SIGNALS.some((p) =>
          p.test(combinedText),
        );
        const isCampaignCategory = categories.some(
          (c) =>
            c.toLowerCase().includes("campaign") ||
            c.toLowerCase().includes("work") ||
            c.toLowerCase().includes("creative"),
        );

        // Parse HTML content for credits
        const contentText = contentEncoded
          ? cheerio.load(contentEncoded).text().trim()
          : description;

        // Extract credits from the article
        const brand = this.extractBrand(combinedText);
        const director = this.extractDirector(contentText);
        const prodCo = this.extractProdCo(contentText);
        const agency = this.extractAgency(contentText);

        // Need at least a brand or it should be campaign-related with US signals
        if (!brand && !hasUsBrand && !isCampaignCategory) return;

        credits.push({
          brand: brand || "Unknown",
          campaignName: title.length <= 120 ? title : undefined,
          agency: agency || undefined,
          productionCompany: prodCo || undefined,
          directorName: director || undefined,
          sourceUrl: link || undefined,
          sourceName: "CAMPAIGN BRIEF",
          publishedAt: pubDate ? new Date(pubDate) : undefined,
          // Pass article text for AI enrichment if we're missing key fields
          articleText:
            !director && !prodCo && contentText.length > 200
              ? contentText.slice(0, 8000)
              : undefined,
        });
      });

      console.log(`[CAMPAIGN BRIEF] ${credits.length} credits extracted`);
    } catch (err) {
      console.error("[CAMPAIGN BRIEF] Error:", err);
    }

    return credits;
  }

  private extractBrand(text: string): string | undefined {
    const patterns = [
      /(?:for|from)\s+([A-Z][a-zA-Z\s&'.]+?)(?:'s?\s+(?:new|latest|first|spot|campaign|ad|commercial|film))/,
      /([A-Z][a-zA-Z\s&'.]+?)\s+(?:launches|unveils|debuts|releases|drops|rolls out)\s/,
      /(?:brand|client|advertiser)\s*:?\s*([A-Z][a-zA-Z\s&'.]+?)(?:\.|,|\s+(?:and|with|via))/i,
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
      /Director\s*:\s*([A-Z][a-zA-Z\s\-']+?)(?:\n|\.|,|$)/,
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
      /Production\s*(?:Company|House)\s*:\s*([A-Z][a-zA-Z\s\-'&]+?)(?:\n|\.|,|$)/i,
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
      /(?:agency)\s*:?\s*([A-Z][a-zA-Z\s\-'&/\\+]+?)(?:\.|,|\s+(?:and|from|for))/i,
      /Agency\s*:\s*([A-Z][a-zA-Z\s\-'&/\\+]+?)(?:\n|\.|,|$)/,
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
