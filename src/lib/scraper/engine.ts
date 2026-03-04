import { prisma } from "@/lib/db";
import { ScrapedCredit, SourceAdapter } from "./types";
import { MuseByClio } from "./sources/rss-muse";
import { companyTerritory } from "./production-companies";

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
 * APPROACH: RSS feeds from real industry publications.
 * - Muse by Clio: Best structured data — brand + agency in <category> tags,
 *   real publish dates, and US-only filtering.
 *
 * SHOOT Online RSS tested but produces mostly industry news (personnel moves,
 * reviews, tech) — not structured commercial credits. Disabled for now.
 */
const ADAPTERS: SourceAdapter[] = [
  new MuseByClio(),
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
  errors: string[];
  sourceBreakdown: Record<string, number>;
}

/**
 * Run the full nightly scrape across all sources.
 * Deduplicates results and inserts new credits into the database.
 */
export async function runNightlyScrape(): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    totalScraped: 0,
    newCredits: 0,
    duplicatesSkipped: 0,
    errors: [],
    sourceBreakdown: {},
  };

  console.log(`[Scraper] Starting nightly scrape at ${new Date().toISOString()}`);
  console.log(`[Scraper] Running ${ADAPTERS.length} source adapters...`);

  // Run all adapters
  const allCredits: ScrapedCredit[] = [];

  for (const adapter of ADAPTERS) {
    try {
      console.log(`[Scraper] Running ${adapter.name}...`);
      const credits = await adapter.scrape();
      console.log(`[Scraper] ${adapter.name}: found ${credits.length} credits`);

      result.sourceBreakdown[adapter.name] = credits.length;
      allCredits.push(...credits);
    } catch (err) {
      const msg = `${adapter.name} failed: ${err}`;
      console.error(`[Scraper] ${msg}`);
      result.errors.push(msg);
    }
  }

  result.totalScraped = allCredits.length;
  console.log(`[Scraper] Total raw credits: ${allCredits.length}`);

  // Deduplicate
  const unique = deduplicateCredits(allCredits);
  console.log(`[Scraper] After dedup: ${unique.length} unique credits`);

  // Insert new credits (skip existing)
  for (const credit of unique) {
    try {
      // Skip entries that are just dashes or empty
      if (!credit.brand || credit.brand === "—") continue;

      // Data quality: reject entries with HTML fragments, tracking pixels, or absurd lengths
      if (credit.brand.includes("<") || credit.brand.includes("src=") || credit.brand.length > 100) continue;
      if (credit.campaignName && (credit.campaignName.includes("<") || credit.campaignName.length > 150)) continue;
      if (credit.directorName && (credit.directorName.includes("<") || credit.directorName.length > 80)) continue;
      if (credit.agency && (credit.agency.includes("<") || credit.agency.length > 100)) continue;
      // Skip generic/useless entries
      if (["recent work", "latest work", "our work", "work", "projects"].includes(credit.brand.toLowerCase())) continue;

      const exists = await creditExists(credit);
      if (exists) {
        result.duplicatesSkipped++;
        continue;
      }

      // Resolve territory from production company if not already set
      let territory = credit.territory;
      if (!territory && credit.productionCompany) {
        territory = companyTerritory(credit.productionCompany) ?? undefined;
      }

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
          thumbnailUrl: credit.thumbnailUrl,
          publishedAt: credit.publishedAt,
        },
      });

      result.newCredits++;
    } catch (err) {
      result.errors.push(`Insert failed for ${credit.brand}: ${err}`);
    }
  }

  console.log(
    `[Scraper] Complete: ${result.newCredits} new, ${result.duplicatesSkipped} dupes, ${result.errors.length} errors`
  );

  return result;
}
