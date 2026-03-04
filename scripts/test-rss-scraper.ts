/**
 * Test script for the RSS-based industry scraper adapters.
 * Run: npx tsx scripts/test-rss-scraper.ts
 */
import * as cheerio from "cheerio";

const EDITORIAL_TAGS = new Set([
  "advertising", "sports", "music", "art", "design", "film and tv",
  "gaming", "musings", "2 minutes with", "worldviews", "books",
  "photography", "social good", "technology", "experiential",
  "health", "food and drink", "fashion and beauty", "automotive",
  "retail", "travel", "real estate", "education", "finance",
  "innovation", "media", "data and analytics", "podcast",
  "events", "the work", "agencies", "brands", "people",
  "super bowl", "awards", "clio awards", "holiday",
]);

async function testMuse() {
  console.log("\n═══ MUSE BY CLIO RSS ═══\n");
  const res = await fetch("https://musebyclios.com/feed/", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FFReels/1.0)" },
    signal: AbortSignal.timeout(15000),
  });
  const xml = await res.text();
  const $ = cheerio.load(xml, { xml: true });

  let count = 0;
  $("item").each((_, el) => {
    const title = $(el).find("title").text().trim();
    const pubDate = $(el).find("pubDate").text().trim();
    const categories: string[] = [];
    $(el).find("category").each((_, cat) => {
      categories.push($(cat).text().trim());
    });

    const entities = categories.filter(
      (c) => !EDITORIAL_TAGS.has(c.toLowerCase())
    );

    if (entities.length > 0) {
      count++;
      const dateStr = new Date(pubDate).toISOString().slice(0, 10);
      console.log(`${dateStr} | ${entities.join(" / ")} | ${title.slice(0, 70)}`);
    }
  });
  console.log(`\n→ ${count} items with extractable entities`);
}

async function testShoot() {
  console.log("\n═══ SHOOT ONLINE RSS ═══\n");
  const feeds = [
    "https://www.shootonline.com/edition-newsletter-rss",
    "https://www.shootonline.com/screenwork-rss-feed",
  ];

  for (const feedUrl of feeds) {
    try {
      const res = await fetch(feedUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FFReels/1.0)" },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        console.log(`${feedUrl} → HTTP ${res.status}`);
        continue;
      }
      const xml = await res.text();
      const $ = cheerio.load(xml, { xml: true });

      let count = 0;
      $("item").each((_, el) => {
        const title = $(el).find("title").text().trim();
        const pubDate = $(el).find("pubDate").text().trim();
        const location = $(el).find("location").text().trim();
        const description = $(el).find("description").text().trim();

        count++;
        const dateStr = pubDate
          ? new Date(pubDate).toISOString().slice(0, 10)
          : "no-date";
        console.log(
          `${dateStr} | ${location || "—"} | ${title.slice(0, 80)}`
        );
      });
      console.log(`→ ${count} items from ${feedUrl.split("/").pop()}\n`);
    } catch (err) {
      console.log(`Error: ${feedUrl} → ${err}`);
    }
  }
}

async function main() {
  await testMuse();
  await testShoot();
}

main().catch(console.error);
