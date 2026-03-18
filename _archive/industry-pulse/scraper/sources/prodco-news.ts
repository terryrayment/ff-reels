import { ScrapedCredit, SourceAdapter } from "../types";

/**
 * Production Company News adapter.
 *
 * Monitors WordPress REST APIs and RSS feeds of US production companies
 * for new work announcements. This adapter provides PRODUCTION COMPANY
 * and DIRECTOR fields — the data Muse by Clio can't reliably extract.
 *
 * Strategy:
 * 1. Fetch recent posts from each company's WordPress API
 * 2. Apply company-specific or generic title parsers
 * 3. Only emit credits where we have high-confidence director + brand
 * 4. Skip company news (signings, awards, interviews, personnel)
 */

interface ProdCoFeed {
  name: string;
  territory: "EAST" | "MIDWEST" | "WEST";
  apiUrl: string;
  /** Custom parser — return null to skip the post */
  parsePost?: (title: string, excerpt: string) => ParsedCredit | null;
}

interface ParsedCredit {
  director?: string;
  brand?: string;
  agency?: string;
}

interface WpPost {
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
}

// ── Feed definitions ────────────────────────────────────────────
const FEEDS: ProdCoFeed[] = [
  // Station Film: structured "Director > Source > Brand" titles
  {
    name: "Station Film",
    territory: "WEST",
    apiUrl: "https://stationfilm.com/wp-json/wp/v2/posts?per_page=20",
    parsePost: (title: string) => {
      const parts = title.split(">").map((s) => s.trim());
      if (parts.length < 3) return null;
      const director = parts[0];
      const brand = parts[2];
      // Skip non-campaign entries
      const skipBrands = [
        "interview", "new signing", "new series", "east coast reps",
        "west coast reps", "signing", "reel", "profile", "shots",
        "addy awards", "40 over 40",
      ];
      if (skipBrands.some((s) => brand.toLowerCase().includes(s))) return null;
      if (director.toLowerCase() === "station film") return null;
      // Validate director looks like a person name (not "CBS News Sunday Morning")
      // Person names are typically 2-3 words, no more than 4
      const dirWords = director.split(/\s+/);
      if (dirWords.length > 4) return null;
      // Skip if director contains obvious non-name words
      if (/\b(?:news|cbs|nbc|abc|fox|sunday|morning|magazine)\b/i.test(director)) return null;
      return { director, brand };
    },
  },

  // Superprime: "Director Directs/Teams Up for Brand" pattern
  {
    name: "Superprime",
    territory: "WEST",
    apiUrl: "https://superprimefilms.com/wp-json/wp/v2/posts?per_page=20",
    parsePost: (title: string, excerpt: string) => {
      return parseDirectsBrandTitle(title, excerpt);
    },
  },

  // Serial Pictures: good structured titles
  {
    name: "Serial Pictures",
    territory: "WEST",
    apiUrl: "https://serialpictures.com/wp-json/wp/v2/posts?per_page=20",
    parsePost: (title: string, excerpt: string) => {
      return parseDirectsBrandTitle(title, excerpt);
    },
  },

  // Moxie Pictures
  {
    name: "Moxie Pictures",
    territory: "WEST",
    apiUrl: "https://moxiepictures.com/wp-json/wp/v2/posts?per_page=20",
    parsePost: (title: string, excerpt: string) => {
      return parseDirectsBrandTitle(title, excerpt);
    },
  },

  // Saville Productions — branded content
  {
    name: "Saville Productions",
    territory: "WEST",
    apiUrl: "https://savilleproductions.com/wp-json/wp/v2/posts?per_page=20",
    parsePost: (title: string, excerpt: string) => {
      return parseDirectsBrandTitle(title, excerpt);
    },
  },

  // Add more companies here as they start posting work credits
  // Confirmed empty feeds (checked 2026-03-04): O Positive, Believe Media, Honor Society
  // Dead domains: Bossa Nova, Chromista, Golden Content, Sanctuary, HSI Productions
];

// ── Skip patterns — posts that are NOT about specific commercial work ──
const SKIP_TITLE_PATTERNS = [
  /\b(?:joins?|appointed|appoints|promoted|named|welcomes?|welcome|signing|signed)\b/i,
  /\b(?:expands?|announces?|announcing|launch(?:es)?|opens?)\b/i,
  /\b(?:oscar|emmy|bafta|cannes|sundance|berlinale|tribeca|sxsw|golden globe)\b/i,
  /\b(?:award|wins?|won|nominated|nomination|nominee)\b/i,
  /\b(?:spotlight on|directors on directors|year in review|a year in)\b/i,
  /\b(?:interview|profile|q\s*&\s*a|podcast|panel)\b/i,
  /\b(?:welcomes?|welcoming|farewell|in memoriam)\b/i,
  /\b(?:merges?|acquires?|acquisition|partnership|venture)\b/i,
  /\b(?:premieres?\s+at|screens?\s+at|selected\s+for|official selection)\b/i,
  /\b(?:sole owner|managing director|executive producer|head of)\b/i,
];

// ── "Directs Brand" title parsing ──────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseDirectsBrandTitle(rawTitle: string, _excerpt: string): ParsedCredit | null {
  const title = decode(rawTitle);

  // Skip non-work posts
  if (SKIP_TITLE_PATTERNS.some((p) => p.test(title))) return null;

  // Pattern: "Director Directs X in Y for Brand" (brand at end after "for")
  let m = title.match(/^(.+?)\s+directs?\s+.+?\s+for\s+([A-Z][a-zA-Z\s\-'&]+?)$/i);
  if (m) return cleanParsed(m[1], extractBrandFromPhrase(m[2]));

  // Pattern: "Director Directs Brand Campaign"
  m = title.match(/^(.+?)\s+directs?\s+(.+?)$/i);
  if (m) return cleanParsed(m[1], extractBrandFromPhrase(m[2]));

  // Pattern: "Director Teams Up With Actor for Brand"
  m = title.match(/^(.+?)\s+teams?\s+up\s+(?:with\s+.+?\s+)?for\s+(.+?)$/i);
  if (m) return cleanParsed(m[1], extractBrandFromPhrase(m[2]));

  // Pattern: "Director Helms Brand Spot"
  m = title.match(/^(.+?)\s+helms?\s+(?:new\s+)?(.+?)$/i);
  if (m) return cleanParsed(m[1], extractBrandFromPhrase(m[2]));

  // Pattern: "Director Lenses Brand Campaign"
  m = title.match(/^(.+?)\s+lenses?\s+(.+?)$/i);
  if (m) return cleanParsed(m[1], extractBrandFromPhrase(m[2]));

  // Pattern: "Director Shoots Brand Campaign"
  m = title.match(/^(.+?)\s+shoots?\s+(.+?)$/i);
  if (m) return cleanParsed(m[1], extractBrandFromPhrase(m[2]));

  // Pattern: "Director Makes/Creates Brand Campaign"
  m = title.match(/^(.+?)\s+(?:makes?|creates?)\s+(.+?)$/i);
  if (m) return cleanParsed(m[1], extractBrandFromPhrase(m[2]));

  // Pattern: "Brand x Director" style (only if both parts are short/clean)
  m = title.match(/^(.+?)\s+x\s+([A-Z][a-zA-Z\s\-']{2,30})$/i);
  if (m && m[2] && !m[2].includes(":") && m[2].split(/\s+/).length <= 4) {
    return cleanParsed(m[2].trim(), m[1].trim());
  }

  return null;
}

function extractBrandFromPhrase(phrase: string): string {
  return phrase
    .replace(/\s+(?:this\s+)?super\s+bowl.*$/i, "")
    .replace(/\s+(?:campaign|spot|commercial|film|ad|in\s+live).*$/i, "")
    .replace(/\s+(?:for\s+.+)$/i, "")
    .trim();
}

function cleanParsed(
  director: string,
  brand: string,
): ParsedCredit | null {
  const d = director.trim();
  const b = brand.trim();

  // ── Director validation ──────────────────────────────────
  if (d.length < 3 || d.length > 40) return null;
  // Director should be 1-4 words, look like a person's name
  const dWords = d.split(/\s+/);
  if (dWords.length > 5) return null;
  // Reject directors with filler/article words as first word
  const badFirstWords = [
    "the", "a", "an", "his", "her", "their", "our", "its",
    "this", "that", "known", "new", "alice", // "alice brooks in her..." is too long
  ];
  if (dWords.length > 3 && badFirstWords.includes(dWords[0].toLowerCase())) return null;
  // Reject if director contains obvious non-name patterns
  if (/\b(?:in her|in his|most recently|directorial debut|first time)\b/i.test(d)) return null;

  // ── Brand validation ─────────────────────────────────────
  if (b.length < 2) return null;
  // Reject generic/garbage brands
  const genericBrands = [
    "new", "a new", "the new", "his", "her", "their", "our",
    "it", "this", "that", "more", "latest", "unknown",
    "the first time", "the upcoming", "his first",
    "commercial and branded", "crafting visually",
    "a feeling", "this year",
  ];
  if (genericBrands.some((g) => b.toLowerCase().startsWith(g))) return null;
  // Reject brands that are clearly sentence fragments
  if (b.split(/\s+/).length > 6) return null;

  return { director: d, brand: b };
}


function decode(s: string): string {
  return s
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<");
}

// ── RSS feed parser (for companies without WP REST API) ─────────
async function fetchRssPosts(feedUrl: string): Promise<WpPost[]> {
  try {
    const cheerio = await import("cheerio");
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FFReels/1.0)",
        Accept: "application/rss+xml, text/xml, application/xml",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const $ = cheerio.load(xml, { xml: true });
    const posts: WpPost[] = [];
    $("item").each((_, el) => {
      posts.push({
        date: $(el).find("pubDate").text().trim(),
        title: { rendered: $(el).find("title").text().trim() },
        excerpt: { rendered: $(el).find("description").text().trim() },
        link: $(el).find("link").text().trim(),
      });
    });
    return posts;
  } catch {
    return [];
  }
}

// ── Main adapter ────────────────────────────────────────────────
export class ProdCoNews implements SourceAdapter {
  name = "PROD CO NEWS";

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    for (const feed of FEEDS) {
      try {
        let posts: WpPost[];

        if (feed.apiUrl.includes("/feed")) {
          // RSS feed
          posts = await fetchRssPosts(feed.apiUrl);
        } else {
          // WP REST API
          const res = await fetch(feed.apiUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; FFReels/1.0)",
              Accept: "application/json",
            },
            signal: AbortSignal.timeout(10000),
          });
          if (!res.ok) {
            console.error(`[PROD CO NEWS] ${feed.name}: HTTP ${res.status}`);
            continue;
          }
          posts = await res.json();
        }

        let feedCredits = 0;

        for (const post of posts) {
          const title = decode(post.title.rendered);
          const excerpt = post.excerpt?.rendered || "";

          const parsed = feed.parsePost
            ? feed.parsePost(title, excerpt)
            : parseDirectsBrandTitle(title, excerpt);

          if (!parsed) continue;
          if (!parsed.director && !parsed.brand) continue;
          // Require at least a director to be useful from prod co feeds
          if (!parsed.director) continue;

          credits.push({
            brand: parsed.brand || "Unknown",
            campaignName: title.length <= 120 ? title : undefined,
            agency: parsed.agency || undefined,
            directorName: parsed.director,
            productionCompany: feed.name,
            territory: feed.territory,
            sourceUrl: post.link || undefined,
            sourceName: `PROD CO: ${feed.name}`,
            publishedAt: post.date ? new Date(post.date) : undefined,
          });
          feedCredits++;
        }

        console.log(
          `[PROD CO NEWS] ${feed.name}: ${posts.length} posts → ${feedCredits} credits`,
        );
      } catch (err) {
        console.error(`[PROD CO NEWS] ${feed.name} failed:`, err);
      }
    }

    return credits;
  }
}
