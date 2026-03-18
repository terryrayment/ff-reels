import OpenAI from "openai";

/**
 * AI-powered credit extraction using gpt-4o-mini.
 *
 * Sends stripped article text to the LLM with a structured prompt,
 * returns parsed commercial production credits. Designed to be cheap
 * (~$0.0001/article) and fast (<5s per call).
 */

export interface ExtractedCredits {
  director?: string;
  productionCompany?: string;
  agency?: string;
  brand?: string;
  dp?: string;
  editor?: string;
  musicCompany?: string;
  executiveProducer?: string;
}

const SYSTEM_PROMPT = `You extract commercial advertising production credits from articles.

Given article text about a TV commercial, online ad, or branded content piece, extract these fields:
- director: The director's full name (person, not company)
- productionCompany: The production company name
- agency: The advertising agency name
- brand: The brand/advertiser name
- dp: Director of Photography / cinematographer name
- editor: Editor name
- musicCompany: Music/sound company name
- executiveProducer: Executive producer name

Rules:
- Only extract credits for US commercial advertising (TV spots, online ads, branded content)
- Skip music videos, feature films, TV shows, documentaries
- Only include fields you are confident about — omit uncertain fields
- Names should be properly capitalized
- For production companies, use their common name (e.g. "Smuggler" not "Smuggler Films LLC")
- Return valid JSON only, no markdown or explanation`;

const USER_PROMPT_TEMPLATE = `Extract production credits from this article.

Known context (from structured metadata):
- Brand: {brand}
- Agency: {agency}

Article text:
{text}

Return JSON with fields: director, productionCompany, agency, brand, dp, editor, musicCompany, executiveProducer. Omit fields you cannot determine.`;

let _client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[AI Extract] OPENAI_API_KEY not set — skipping AI extraction");
    return null;
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

/**
 * Strip HTML tags and collapse whitespace. Keeps text content only.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract structured credits from article text using gpt-4o-mini.
 *
 * Returns null if:
 * - No API key configured
 * - Article too short or too long
 * - LLM call fails or returns invalid JSON
 */
export async function extractCredits(
  articleHtml: string,
  hints: { brand?: string; agency?: string } = {},
): Promise<ExtractedCredits | null> {
  const client = getClient();
  if (!client) return null;

  const text = stripHtml(articleHtml);

  // Skip articles too short to contain credits
  if (text.length < 100) return null;

  // Skip articles too long (likely long-form features, cost guard)
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 3000) {
    console.log(`[AI Extract] Skipping article (${wordCount} words — too long)`);
    return null;
  }

  // Truncate to ~2000 words to keep token costs low
  const truncated = text.split(/\s+/).slice(0, 2000).join(" ");

  const userPrompt = USER_PROMPT_TEMPLATE
    .replace("{brand}", hints.brand || "Unknown")
    .replace("{agency}", hints.agency || "Unknown")
    .replace("{text}", truncated);

  try {
    const response = await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 300,
      },
      { timeout: 10000 },
    );

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as ExtractedCredits;

    // Validate: at least one meaningful field extracted
    const hasValue = Object.values(parsed).some(
      (v) => typeof v === "string" && v.trim().length > 1,
    );
    if (!hasValue) return null;

    // Clean up: remove fields that look like garbage
    return cleanExtracted(parsed);
  } catch (err) {
    console.error("[AI Extract] LLM call failed:", err);
    return null;
  }
}

/**
 * Validate and clean extracted fields.
 */
function cleanExtracted(raw: ExtractedCredits): ExtractedCredits | null {
  const result: ExtractedCredits = {};

  if (raw.director && isValidName(raw.director)) {
    result.director = raw.director.trim();
  }
  if (raw.productionCompany && raw.productionCompany.trim().length >= 2) {
    result.productionCompany = raw.productionCompany.trim();
  }
  if (raw.agency && raw.agency.trim().length >= 2) {
    result.agency = raw.agency.trim();
  }
  if (raw.brand && raw.brand.trim().length >= 2) {
    result.brand = raw.brand.trim();
  }
  if (raw.dp && isValidName(raw.dp)) {
    result.dp = raw.dp.trim();
  }
  if (raw.editor && isValidName(raw.editor)) {
    result.editor = raw.editor.trim();
  }
  if (raw.musicCompany && raw.musicCompany.trim().length >= 2) {
    result.musicCompany = raw.musicCompany.trim();
  }
  if (raw.executiveProducer && isValidName(raw.executiveProducer)) {
    result.executiveProducer = raw.executiveProducer.trim();
  }

  const hasValue = Object.values(result).some(Boolean);
  return hasValue ? result : null;
}

/**
 * Basic person-name validation: 2-5 words, reasonable length.
 */
function isValidName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 50) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 1 || words.length > 5) return false;
  // Reject if it contains HTML or URLs
  if (/<|>|http|www\./i.test(trimmed)) return false;
  return true;
}

/**
 * Process multiple articles concurrently with a concurrency limit.
 */
export async function extractCreditsBatch(
  articles: Array<{
    articleHtml: string;
    hints: { brand?: string; agency?: string };
  }>,
  concurrency = 5,
): Promise<(ExtractedCredits | null)[]> {
  const results: (ExtractedCredits | null)[] = new Array(articles.length).fill(null);

  for (let i = 0; i < articles.length; i += concurrency) {
    const batch = articles.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((a) => extractCredits(a.articleHtml, a.hints)),
    );
    for (let j = 0; j < batchResults.length; j++) {
      results[i + j] = batchResults[j];
    }
  }

  return results;
}
