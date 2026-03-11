import { prisma } from "@/lib/db";
import { ScrapedCredit, SourceAdapter } from "./types";
import { MuseByClio } from "./sources/rss-muse";
import { ProdCoNews } from "./sources/prodco-news";
import { AdweekRss } from "./sources/rss-adweek";
import { ShotsAdapter } from "./sources/shots";
import { ShootRssAdapter } from "./sources/rss-shoot";
import { AdsOfTheWorldAdapter } from "./sources/ads-of-the-world";
import { ChampionNewsletter } from "./sources/champion-newsletter";
import { LbbOnlineRss } from "./sources/rss-lbb";
import { CampaignBriefRss } from "./sources/rss-campaign-brief";
import { AdlandRss } from "./sources/rss-adland";
import { companyTerritory, agencyTerritory } from "./production-companies";
import { extractCreditsBatch } from "./ai-extract";

/**
 * Decode common HTML entities that leak through RSS parsing.
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"');
}

/**
 * All registered source adapters.
 *
 * Ten complementary streams:
 * 1. Muse by Clio RSS — Brand + Agency from <category> tags + article text for AI
 * 2. Production Company News — Director + Prod Co from WordPress APIs/RSS
 * 3. Adweek RSS — Campaign articles with full page text for AI extraction
 * 4. SHOTS — shots.net /work page scraping (brand, director, agency, prodCo)
 * 5. SHOOT Online RSS — Production industry news with location data
 * 6. Ads of the World — Film ad archive (brand, agency, prodCo, director)
 * 7. Champion Newsletter — Weekly MailChimp newsletter with production credits
 * 8. LBB Online RSS — Production-focused news (director signings, new work)
 * 9. Campaign Brief RSS — Global campaigns with full article content
 * 10. Adland RSS — High-volume ad industry feed (50 items)
 *
 * AI enrichment extracts director, prodCo, DP, editor from article text.
 */
const ADAPTERS: SourceAdapter[] = [
  new MuseByClio(),
  new ProdCoNews(),
  new AdweekRss(),
  new ShotsAdapter(),
  new ShootRssAdapter(),
  new AdsOfTheWorldAdapter(),
  new ChampionNewsletter(),
  new LbbOnlineRss(),
  new CampaignBriefRss(),
  new AdlandRss(),
];

/**
 * Deduplicate credits by brand + campaign + director combo.
 * Prefers entries with more complete data.
 */
function deduplicateCredits(credits: ScrapedCredit[]): ScrapedCredit[] {
  const seen = new Map<string, ScrapedCredit>();

  for (const credit of credits) {
    const key = [
      (credit.brand || "").toLowerCase().trim(),
      (credit.campaignName || "").toLowerCase().trim(),
      (credit.directorName || "").toLowerCase().trim(),
    ].join("|");

    if (!key || key === "||") continue;

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, credit);
    } else {
      // Merge: prefer entry with more fields filled
      const existingFields = Object.values(existing).filter(Boolean).length;
      const newFields = Object.values(credit).filter(Boolean).length;
      if (newFields > existingFields) {
        seen.set(key, { ...existing, ...credit });
      } else {
        // Fill in any missing fields from new entry
        seen.set(key, { ...credit, ...existing });
      }
    }
  }

  return Array.from(seen.values());
}

/**
 * Validate and sanitize a thumbnail URL.
 * Returns the URL if valid, undefined otherwise.
 */
function validateThumbnailUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  // Must be HTTPS (or HTTP which we accept)
  if (!url.startsWith("https://") && !url.startsWith("http://")) return undefined;

  // Reject data URIs, javascript URIs, or URLs with suspicious patterns
  if (url.includes("data:") || url.includes("javascript:")) return undefined;

  // Reject tracking pixels and tiny images (common patterns)
  if (url.includes("1x1") || url.includes("pixel") || url.includes("spacer")) return undefined;

  // Reject absurdly long URLs (likely garbage)
  if (url.length > 2000) return undefined;

  // Basic URL structure validation
  try {
    new URL(url);
  } catch {
    return undefined;
  }

  return url;
}

/**
 * Check if a credit already exists in the database (last 7 days).
 */
async function creditExists(credit: ScrapedCredit): Promise<boolean> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const existing = await prisma.industryCredit.findFirst({
    where: {
      brand: credit.brand,
      campaignName: credit.campaignName || undefined,
      directorName: credit.directorName || undefined,
      createdAt: { gte: sevenDaysAgo },
    },
  });

  return !!existing;
}

export interface ScrapeResult {
  totalScraped: number;
  newCredits: number;
  duplicatesSkipped: number;
  aiEnriched: number;
  thumbnailsDiscovered: number;
  thumbnailsIngested: number;
  safetyFiltered: number;
  errors: string[];
  sourceBreakdown: Record<string, number>;
}

/**
 * AI enrichment pass: extract director, prodCo, etc. from article text.
 * Only processes credits that have articleText and are missing key fields.
 */
async function aiEnrichCredits(credits: ScrapedCredit[]): Promise<{ enriched: number }> {
  // Find credits that have article text but are missing key fields
  const needsEnrichment = credits.filter(
    (c) => c.articleText && (!c.directorName || !c.productionCompany),
  );

  if (needsEnrichment.length === 0) {
    console.log("[Scraper] AI: No credits need enrichment");
    return { enriched: 0 };
  }

  // Cap at 25 to stay within time budget
  const toProcess = needsEnrichment.slice(0, 25);
  console.log(`[Scraper] AI: Enriching ${toProcess.length} credits (${needsEnrichment.length} eligible)`);

  const articles = toProcess.map((c) => ({
    articleHtml: c.articleText!,
    hints: { brand: c.brand, agency: c.agency },
  }));

  const results = await extractCreditsBatch(articles, 5);

  let enriched = 0;
  for (let i = 0; i < results.length; i++) {
    const extracted = results[i];
    if (!extracted) continue;

    const credit = toProcess[i];

    // Merge AI-extracted fields into the credit (don't overwrite existing)
    if (extracted.director && !credit.directorName) {
      credit.directorName = extracted.director;
    }
    if (extracted.productionCompany && !credit.productionCompany) {
      credit.productionCompany = extracted.productionCompany;
    }
    if (extracted.agency && !credit.agency) {
      credit.agency = extracted.agency;
    }
    if (extracted.brand && credit.brand === "Unknown") {
      credit.brand = extracted.brand;
    }

    // Store deep credits as custom properties for DB insert
    (credit as ScrapedCreditWithDeep)._dp = extracted.dp;
    (credit as ScrapedCreditWithDeep)._editor = extracted.editor;
    (credit as ScrapedCreditWithDeep)._musicCompany = extracted.musicCompany;
    (credit as ScrapedCreditWithDeep)._executiveProducer = extracted.executiveProducer;
    (credit as ScrapedCreditWithDeep)._isAiExtracted = true;

    enriched++;
  }

  console.log(`[Scraper] AI: Enriched ${enriched}/${toProcess.length} credits`);
  return { enriched };
}

/** Extended type for passing deep credits through the pipeline */
interface ScrapedCreditWithDeep extends ScrapedCredit {
  _dp?: string;
  _editor?: string;
  _musicCompany?: string;
  _executiveProducer?: string;
  _isAiExtracted?: boolean;
}

/**
 * Run the full nightly scrape across all sources.
 * Deduplicates results, runs AI enrichment, and inserts new credits.
 */
export async function runNightlyScrape(): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    totalScraped: 0,
    newCredits: 0,
    duplicatesSkipped: 0,
    aiEnriched: 0,
    thumbnailsDiscovered: 0,
    thumbnailsIngested: 0,
    safetyFiltered: 0,
    errors: [],
    sourceBreakdown: {},
  };

  console.log(`[Scraper] Starting nightly scrape at ${new Date().toISOString()}`);
  console.log(`[Scraper] Running ${ADAPTERS.length} source adapters in parallel...`);

  // Run all adapters in parallel
  const adapterResults = await Promise.allSettled(
    ADAPTERS.map(async (adapter) => {
      console.log(`[Scraper] Running ${adapter.name}...`);
      const credits = await adapter.scrape();
      console.log(`[Scraper] ${adapter.name}: found ${credits.length} credits`);
      return { name: adapter.name, credits };
    }),
  );

  const allCredits: ScrapedCredit[] = [];

  for (const res of adapterResults) {
    if (res.status === "fulfilled") {
      result.sourceBreakdown[res.value.name] = res.value.credits.length;
      allCredits.push(...res.value.credits);
    } else {
      const msg = `Adapter failed: ${res.reason}`;
      console.error(`[Scraper] ${msg}`);
      result.errors.push(msg);
    }
  }

  result.totalScraped = allCredits.length;
  console.log(`[Scraper] Total raw credits: ${allCredits.length}`);

  // Deduplicate
  const unique = deduplicateCredits(allCredits);
  console.log(`[Scraper] After dedup: ${unique.length} unique credits`);

  // AI enrichment pass
  try {
    const aiResult = await aiEnrichCredits(unique);
    result.aiEnriched = aiResult.enriched;
  } catch (err) {
    console.error("[Scraper] AI enrichment failed:", err);
    result.errors.push(`AI enrichment failed: ${err}`);
  }

  // Count thumbnail discovery across all unique credits
  for (const credit of unique) {
    if (credit.thumbnailUrl) result.thumbnailsDiscovered++;
  }
  console.log(`[Scraper] Thumbnails discovered: ${result.thumbnailsDiscovered}/${unique.length}`);

  // Insert new credits (skip existing)
  for (const credit of unique) {
    try {
      // Skip entries that are just dashes or empty
      if (!credit.brand || credit.brand === "—") {
        result.safetyFiltered++;
        continue;
      }

      // Data quality: reject entries with HTML fragments, tracking pixels, or absurd lengths
      if (credit.brand.includes("<") || credit.brand.includes("src=") || credit.brand.length > 100) {
        result.safetyFiltered++;
        continue;
      }
      if (credit.campaignName && (credit.campaignName.includes("<") || credit.campaignName.length > 150)) {
        result.safetyFiltered++;
        continue;
      }
      if (credit.directorName && (credit.directorName.includes("<") || credit.directorName.length > 80)) {
        result.safetyFiltered++;
        continue;
      }
      if (credit.agency && (credit.agency.includes("<") || credit.agency.length > 100)) {
        result.safetyFiltered++;
        continue;
      }
      // Skip generic/useless entries
      if (["recent work", "latest work", "our work", "work", "projects"].includes(credit.brand.toLowerCase())) {
        result.safetyFiltered++;
        continue;
      }

      const exists = await creditExists(credit);
      if (exists) {
        result.duplicatesSkipped++;
        continue;
      }

      // Resolve territory: production company → agency → fallback
      let territory = credit.territory;
      if (!territory && credit.productionCompany) {
        territory = companyTerritory(credit.productionCompany) ?? undefined;
      }
      if (!territory && credit.agency) {
        territory = agencyTerritory(credit.agency) ?? undefined;
      }

      // Validate and sanitize thumbnail URL
      const validatedThumbnail = validateThumbnailUrl(credit.thumbnailUrl);

      const deep = credit as ScrapedCreditWithDeep;

      await prisma.industryCredit.create({
        data: {
          brand: decodeEntities(credit.brand),
          campaignName: credit.campaignName ? decodeEntities(credit.campaignName) : undefined,
          agency: credit.agency ? decodeEntities(credit.agency) : undefined,
          productionCompany: credit.productionCompany,
          directorName: credit.directorName,
          category: credit.category,
          territory: territory,
          sourceUrl: credit.sourceUrl,
          sourceName: credit.sourceName,
          thumbnailUrl: validatedThumbnail,
          publishedAt: credit.publishedAt,
          // Deep credits (AI-extracted)
          dp: deep._dp,
          editor: deep._editor,
          musicCompany: deep._musicCompany,
          executiveProducer: deep._executiveProducer,
          isAiExtracted: deep._isAiExtracted || false,
        },
      });

      if (validatedThumbnail) result.thumbnailsIngested++;
      result.newCredits++;
    } catch (err) {
      result.errors.push(`Insert failed for ${credit.brand}: ${err}`);
    }
  }

  console.log(
    `[Scraper] Complete: ${result.newCredits} new, ${result.aiEnriched} AI-enriched, ` +
    `${result.duplicatesSkipped} dupes, ${result.thumbnailsIngested} thumbnails, ` +
    `${result.safetyFiltered} filtered, ${result.errors.length} errors`,
  );

  return result;
}
