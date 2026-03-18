import * as cheerio from "cheerio";
import { ScrapedCredit, SourceAdapter } from "../types";

/**
 * Muse by Clio (musebyclios.com) RSS feed adapter.
 *
 * STRATEGY: Only trust structured data from <category> XML tags.
 * - Category tags contain real brand names and agency names
 * - pubDate gives accurate timing
 * - We do NOT try to regex-extract director/prodCo from article text
 *   (too error-prone — produces garbage)
 *
 * US-ONLY FILTER:
 * - Reject entries with known non-US agencies or brands
 * - Reject entries with international location markers
 * - Only classify as "agency" if the entity is a recognized agency name
 * - Prevents brands from being misclassified as agencies
 */
export class MuseByClio implements SourceAdapter {
  name = "MUSE BY CLIO";

  // ── Editorial tags that are NOT brands/agencies ──────────────
  private static EDITORIAL_TAGS = new Set([
    "advertising", "sports", "music", "art", "design", "film and tv",
    "gaming", "musings", "2 minutes with", "worldviews", "books",
    "photography", "social good", "technology", "experiential",
    "health", "food and drink", "fashion and beauty", "automotive",
    "retail", "travel", "real estate", "education", "finance",
    "innovation", "media", "data and analytics", "podcast",
    "events", "the work", "agencies", "brands", "people",
    "super bowl", "awards", "clio awards", "holiday",
    "health and wellness", "cannabis", "boxing", "environment",
    "ai", "ad of the week", "on trend", "lunar new year", "maha",
  ]);

  // ── Non-US agencies — if one of these is a category, skip ───
  private static NON_US_AGENCIES = new Set([
    "ogilvy spain", "bbdo paris", "betc paris", "betc", "lola mullenlowe",
    "lola madrid", "ddb paris", "publicis paris", "publicis italy",
    "leo burnett london", "bbh london", "amv bbdo", "wieden+kennedy london",
    "wieden+kennedy amsterdam", "w+k amsterdam", "w+k london",
    "wieden+kennedy tokyo", "droga5 london", "saatchi london",
    "saatchi & saatchi london", "saatchi & saatchi italy",
    "tbwa paris", "tbwa\\paris", "tbwa london", "tbwa\\london",
    "ddb berlin", "ddb spain", "jung von matt", "scholz & friends",
    "adam&eveddb", "adam & eve ddb", "vccp london", "mother london",
    "72andsunny amsterdam", "forsman & bodenfors", "nord ddb",
    "accenture song", "le pub", "david madrid", "david buenos aires",
    "gut buenos aires", "gut são paulo", "almapbbdo", "africa",
    "publicis conseil", "havas paris", "havas london",
    "mccann london", "mccann worldgroup", "dentsu tokyo",
    "dentsu inc", "hakuhodo", "adk", "cheil worldwide",
    "iris worldwide", "uncommon creative studio",
    "save our souls", // South African agency
  ]);

  // ── Non-US brands / non-brand entities — skip articles ──────
  private static NON_US_BRANDS = new Set([
    // UK brands
    "telstra", "bankwest", "citroën", "citroen", "renault", "peugeot",
    "tk maxx", "tkmaxx", "super noodles", "batchelors", "ginsters",
    "marmite", "irn-bru", "john lewis", "waitrose", "cadbury",
    "marks & spencer", "m&s", "virgin media", "sky", "bt",
    "vodafone", "tesco", "sainsbury's", "asda", "warburtons",
    // Canadian brands
    "ikea canada", "ikea uk", "casey house", "childhood cancer canada",
    "tim hortons canada", "niod",
    // Australian brands
    "woolworths", "bunnings", "commbank", "anz",
    // Asian brands
    "samsung india", "flipkart", "swiggy", "zomato", "jio",
    // Chinese/Dutch/Other international brands
    "omoda", "tony's chocolonely", "tonys chocolonely",
    "arthaland", "arthaland una apartments",
    "ace amsterdam", "rimowa", "garage beer",
    // Non-brand entities
    "fotografiska", "greenpeace", "world cup", "olympics",
  ]);

  // ── Non-US markers in titles or entity names ────────────────
  private static NON_US_MARKERS = [
    " spain", " paris", " london", " berlin", " amsterdam", " tokyo",
    " shanghai", " mumbai", " delhi", " sydney", " melbourne",
    " buenos aires", " são paulo", " sao paulo", " toronto",
    " montreal", " uk", " u.k.", " india", " china", " japan",
    " australia", " brazil", " brasil", " france", " germany",
    " italy", " nederland", " south korea", " korea",
    " singapore", " hong kong", " dubai", " abu dhabi",
    " new zealand", " nz", " canada",
  ];

  // ── Known US agencies (strict list — only set agency if matched) ──
  private static US_AGENCY_NAMES = new Set([
    // Major networks
    "wieden+kennedy", "w+k", "droga5", "bbdo", "bbdo new york",
    "ddb", "ddb new york", "tbwa", "tbwa\\chiat\\day",
    "mccann", "mccann new york", "ogilvy", "ogilvy new york",
    "leo burnett", "leo burnett chicago", "publicis", "publicis new york",
    "saatchi", "saatchi & saatchi", "saatchi & saatchi new york",
    "grey", "grey new york", "jwt", "fcb", "fcb new york",
    "mullenlowe", "havas", "havas new york", "deutsch",
    // Top independents
    "mother", "anomaly", "72andsunny", "gut", "gut miami",
    "alma", "rethink", "special group", "vmly&r", "vml",
    "dentsu creative", "media arts lab", "tbwamedia arts lab",
    "tbwa\\media arts lab", "tbwa\\ media arts lab",
    "in-house", "mcgarrybowen", "goodby silverstein",
    "goodby silverstein & partners", "crispin porter bogusky",
    "cpb", "david miami", "david", "johannes leonardo",
    "r/ga", "huge", "akqa", "sapient", "razorfish",
    "wunderman thompson", "edelman", "edelman new york",
    "allison worldwide", "dept", "mischief",
    "the martin agency", "arnold worldwide", "hill holliday",
    "digitas", "the community", "translation", "mirimar",
    "preacher", "mckinney", "erich & kallman", "highdive",
    "majority agency", "broken heart love affair",
    "bigtime creative shop", "vccp", "bbh", "bbh usa", "bbh new york",
    "mccann worldgroup", "mccann new york",
    "l&c", "la comunidad", "gallegos united", "casanova",
    "the garden", "forsman & bodenfors ny",
    // Digital/media
    "360i", "essence", "hearts & science", "mindshare",
    "mediacom", "initiative", "um", "zenith", "starcom",
  ]);

  // ── Skip these "entities" — editorial, meta, or non-credits ─
  private static SKIP_ENTITIES = new Set([
    "influencers", "zombie brands", "concept arts", "plot",
    "chemistry", "healthyish", "beal institute", "d8",
    "art of the album", "album art", "on trend",
    "ad of the week", "vml intelligence", "slush management",
    "two tango", "house of oddities", "eastman",
    "cannaplanners", "warner chappell music",
    // Person names (celebrity features, not campaigns)
    "jason kelce", "john cena", "paris hilton", "morgan freeman",
    "shahnaz mahmud", "john long",
    // Generic
    "the ring", "the blossom",
  ]);

  private isEditorialTag(tag: string): boolean {
    return MuseByClio.EDITORIAL_TAGS.has(tag.toLowerCase().trim());
  }

  private isNonUsAgency(name: string): boolean {
    return MuseByClio.NON_US_AGENCIES.has(name.toLowerCase().trim());
  }

  private isNonUsBrand(name: string): boolean {
    return MuseByClio.NON_US_BRANDS.has(name.toLowerCase().trim());
  }

  private hasNonUsMarker(text: string): boolean {
    const lower = " " + text.toLowerCase() + " ";
    return MuseByClio.NON_US_MARKERS.some((m) => lower.includes(m));
  }

  private isKnownUsAgency(name: string): boolean {
    const lower = name.toLowerCase().trim();
    if (MuseByClio.US_AGENCY_NAMES.has(lower)) return true;
    // Fuzzy match: contains a known agency root
    const agencyRoots = [
      "wieden+kennedy", "wieden", "droga5", "bbdo", "ogilvy", "mccann",
      "publicis", "saatchi", "leo burnett", "tbwa", "mullenlowe",
      "johannes leonardo", "72andsunny", "anomaly", "gut agency",
      "media arts lab", "goodby silverstein", "crispin porter",
      "the martin agency", "mother ", "dept agency",
    ];
    return agencyRoots.some((r) => lower.includes(r));
  }

  private shouldSkipEntity(name: string): boolean {
    return MuseByClio.SKIP_ENTITIES.has(name.toLowerCase().trim());
  }

  async scrape(): Promise<ScrapedCredit[]> {
    const credits: ScrapedCredit[] = [];

    try {
      const res = await fetch("https://musebyclios.com/feed/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FFReels/1.0)",
          Accept: "application/rss+xml, application/xml, text/xml",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) return credits;

      const xml = await res.text();
      const $ = cheerio.load(xml, { xml: true });

      $("item").each((_, el) => {
        const title = $(el).find("title").text().trim();
        const link = $(el).find("link").text().trim();
        const pubDate = $(el).find("pubDate").text().trim();
        const contentEncoded = $(el).find("content\\:encoded").text().trim();

        if (!title) return;

        // ── Collect category tags ──────────────────────────────
        const categories: string[] = [];
        $(el).find("category").each((_, cat) => {
          const text = $(cat).text().trim();
          if (text) categories.push(text);
        });

        // Split into entities vs editorial tags
        const entities = categories.filter((c) => !this.isEditorialTag(c));
        const editorialTags = categories.filter((c) => this.isEditorialTag(c));

        // Need at least one entity to create a credit
        if (entities.length === 0) return;

        // ── US-ONLY FILTER ─────────────────────────────────────
        if (entities.some((e) => this.isNonUsAgency(e))) return;
        if (entities.some((e) => this.isNonUsBrand(e))) return;
        if (this.hasNonUsMarker(title)) return;
        // Also check entities for non-US markers
        if (entities.some((e) => this.hasNonUsMarker(e))) return;

        // Filter out skip entities
        const validEntities = entities.filter((e) => !this.shouldSkipEntity(e));
        if (validEntities.length === 0) return;

        // ── Entity classification ──────────────────────────────
        // STRICT: Only set agency if entity is a KNOWN US agency.
        // This prevents brands (McDonald's, DoorDash, etc) from being misclassified.

        // First pass: separate agencies from non-agencies
        const agencyEntities = validEntities.filter((e) => this.isKnownUsAgency(e));
        const nonAgencyEntities = validEntities.filter((e) => !this.isKnownUsAgency(e));

        // If ALL entities are agencies (article about agencies, not a campaign) → skip
        if (nonAgencyEntities.length === 0) return;

        // Brand = first non-agency entity that appears in the title, or just the first non-agency
        const brand = nonAgencyEntities.find((e) =>
          title.toLowerCase().includes(e.toLowerCase())
        ) || nonAgencyEntities[0];

        // Agency = first recognized agency (if different from brand)
        let agency: string | undefined = agencyEntities[0];
        if (brand && agency && brand.toLowerCase() === agency.toLowerCase()) {
          agency = undefined;
        }

        if (!brand) return;

        // ── Category from editorial tags ───────────────────────
        const skipCats = new Set([
          "advertising", "musings", "2 minutes with", "worldviews",
          "the work", "agencies", "brands", "people", "awards",
          "clio awards", "events", "podcast", "data and analytics",
          "innovation", "media", "health and wellness", "cannabis",
          "boxing", "environment", "ai", "ad of the week",
          "on trend", "lunar new year", "maha",
        ]);
        const category = editorialTags.find(
          (t) => !skipCats.has(t.toLowerCase())
        );

        credits.push({
          brand,
          campaignName: title.length <= 120 ? title : undefined,
          agency: agency || undefined,
          productionCompany: undefined,
          directorName: undefined,
          category: category?.toLowerCase() || undefined,
          sourceUrl: link || undefined,
          sourceName: "MUSE BY CLIO",
          publishedAt: pubDate ? new Date(pubDate) : undefined,
          articleText: contentEncoded || undefined,
        });
      });
    } catch (err) {
      console.error("[MUSE BY CLIO scraper] Error:", err);
    }

    return credits;
  }
}
