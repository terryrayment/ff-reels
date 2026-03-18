import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";

/**
 * Champion Weekly Briefing newsletter scraper.
 *
 * Champion (yourchampion.tv) publishes a weekly newsletter with production
 * credits. The newsletter archive is hosted on MailChimp and the archive
 * index is at https://www.yourchampion.tv/weekly-briefing
 *
 * STRATEGY:
 * 1. Fetch the archive index page to get recent MailChimp issue URLs
 * 2. Fetch the 3 most recent issues (to stay within time budget)
 * 3. Parse each issue for production credits
 *
 * Credit patterns in the newsletter:
 * - "FROM US" section: "[Brand] [Campaign] Directed by [ProdCo]'s [Director]"
 * - "WATCH" section: Brand/campaign spotlights, sometimes with director
 * - "PRODUCTION" section: Director signings and moves
 * - Text patterns: "directed by", "[Company]'s [Name]", linked director names
 */
export class ChampionNewsletter implements SourceAdapter {
  name = "CHAMPION";

  private archiveUrl = "https://www.yourchampion.tv/weekly-briefing";

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    try {
      // Step 1: Get recent newsletter URLs from archive page
      const issueUrls = await this.getRecentIssueUrls(4);
      if (issueUrls.length === 0) return credits;

      console.log(`[CHAMPION] Found ${issueUrls.length} recent issues`);

      // Step 2: Scrape each issue in parallel
      const results = await Promise.allSettled(
        issueUrls.map((url) => this.scrapeIssue(url)),
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          credits.push(...result.value);
        }
      }
    } catch (err) {
      console.error("[CHAMPION] Error:", err);
    }

    return credits;
  }

  private async getRecentIssueUrls(count: number): Promise<string[]> {
    const res = await fetch(this.archiveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FFReels/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const urls: string[] = [];

    $("a[href*='mailchi.mp']").each((_, el) => {
      const href = $(el).attr("href");
      if (href && urls.length < count) {
        urls.push(href);
      }
    });

    return urls;
  }

  private async scrapeIssue(url: string): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FFReels/1.0)",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) return credits;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Extract all text blocks
      const textBlocks: string[] = [];
      $("td.mcnTextContent, .mceText, .mcnTextContent, td[class*='Text']").each(
        (_, el) => {
          const text = $(el).text().trim();
          if (text.length > 20) textBlocks.push(text);
        },
      );

      const fullText = textBlocks.join("\n");

      // Pattern 1: "Directed by [Company]'s [Director]"
      // e.g., "Directed by division7's Ray Smiling"
      const directedByPattern =
        /(?:directed\s+by)\s+([A-Z][\w\s&'.]+?)'s\s+([A-Z][\w\s.-]+?)(?:\.|,|\s+for|\s+via|\s*$)/gi;
      let match;
      while ((match = directedByPattern.exec(fullText)) !== null) {
        const prodCo = match[1].trim();
        const director = match[2].trim();

        // Look backwards for brand context
        const before = fullText.slice(Math.max(0, match.index - 200), match.index);
        const brand = this.extractBrandFromContext(before);

        if (brand && director.length < 50 && prodCo.length < 50) {
          credits.push({
            brand,
            directorName: director,
            productionCompany: prodCo,
            sourceUrl: url,
            sourceName: "CHAMPION",
          });
        }
      }

      // Pattern 2: "Director [Name] at [Company]" or "[Name] directed"
      const directorAtPattern =
        /(?:director|dir\.)\s+([A-Z][\w\s.-]+?)\s+(?:at|with|via|@)\s+([A-Z][\w\s&'.]+)/gi;
      while ((match = directorAtPattern.exec(fullText)) !== null) {
        const director = match[1].trim();
        const prodCo = match[2].trim();

        if (director.length < 50 && prodCo.length < 50) {
          credits.push({
            brand: "Unknown",
            directorName: director,
            productionCompany: prodCo,
            sourceUrl: url,
            sourceName: "CHAMPION",
          });
        }
      }

      // Pattern 3: "[Brand] campaign/spot/film directed by [Director]"
      const campaignPattern =
        /([A-Z][\w\s&'.]+?)\s+(?:campaign|spot|film|commercial|ad)\s+.*?directed\s+by\s+([A-Z][\w\s.-]+?)(?:\s+at|\s+via|\s+of|\.|,|$)/gi;
      while ((match = campaignPattern.exec(fullText)) !== null) {
        const brand = match[1].trim();
        const director = match[2].trim();

        if (brand.length < 60 && director.length < 50) {
          credits.push({
            brand,
            directorName: director,
            sourceUrl: url,
            sourceName: "CHAMPION",
          });
        }
      }

      // Pattern 4: Pass full text to AI enrichment for anything else
      // If we found very few credits, submit the full text for AI extraction
      if (credits.length < 3 && fullText.length > 200) {
        credits.push({
          brand: "CHAMPION Newsletter",
          sourceName: "CHAMPION",
          sourceUrl: url,
          articleText: fullText.slice(0, 8000), // Cap for AI processing
        });
      }
    } catch (err) {
      console.error(`[CHAMPION] Error scraping ${url}:`, err);
    }

    return credits;
  }

  /**
   * Look backwards in text for a brand name (capitalized word before campaign context).
   */
  private extractBrandFromContext(text: string): string | null {
    // Look for common patterns: "Brand Name ...", "for Brand", "Brand's new..."
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const lastLine = lines[lines.length - 1] || "";

    // Try to find a brand at the start of the sentence
    const sentenceMatch = lastLine.match(
      /(?:^|\.\s+)([A-Z][\w\s&'.-]{1,40}?)(?:\s+(?:reunite|launch|debut|release|unveil|introduce|partner|team|collaborate|return|drop|premiere|celebrate|campaign|commercial|spot|film|ad\b))/i,
    );
    if (sentenceMatch) return sentenceMatch[1].trim();

    // Try "for [Brand]"
    const forMatch = lastLine.match(/\bfor\s+([A-Z][\w\s&'.-]{1,30}?)(?:\s|$|,)/);
    if (forMatch) return forMatch[1].trim();

    return null;
  }
}
