import Replicate from "replicate";

/**
 * Image upscaling via Real-ESRGAN on Replicate.
 *
 * Takes a source image URL and returns the upscaled image URL.
 * Uses 2x scale (1080p → ~3840px wide = 4K presentation quality).
 *
 * Cost: ~$0.0035 per image, ~1.8s per image.
 */

let _replicate: Replicate | null = null;

function getReplicate(): Replicate | null {
  if (_replicate) return _replicate;
  const auth = process.env.REPLICATE_API_TOKEN;
  if (!auth) {
    console.warn("[Upscaler] REPLICATE_API_TOKEN not set — skipping upscale");
    return null;
  }
  _replicate = new Replicate({ auth });
  return _replicate;
}

/**
 * Upscale a single image using Real-ESRGAN.
 *
 * @param imageUrl - URL of the source image (Mux thumbnail URL)
 * @param scale - Upscale factor (2 = 2x, 4 = 4x). Default 2x.
 * @returns URL of the upscaled image hosted on Replicate's CDN, or null on failure.
 */
export async function upscaleImage(
  imageUrl: string,
  scale = 2,
): Promise<string | null> {
  const replicate = getReplicate();
  if (!replicate) return null;

  try {
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      {
        input: {
          image: imageUrl,
          scale,
          face_enhance: false,
        },
      },
    );

    // Output is a URL string
    if (typeof output === "string") return output;

    // Some versions return a FileOutput or ReadableStream
    if (output && typeof output === "object" && "url" in output) {
      return (output as { url: string }).url;
    }

    console.warn("[Upscaler] Unexpected output type:", typeof output);
    return null;
  } catch (err) {
    console.error("[Upscaler] Real-ESRGAN failed:", err);
    return null;
  }
}

/**
 * Upscale multiple images with concurrency limit.
 * Returns array of [sourceUrl, upscaledUrl | null].
 */
export async function upscaleBatch(
  imageUrls: string[],
  concurrency = 4,
  scale = 2,
): Promise<Array<{ sourceUrl: string; upscaledUrl: string | null }>> {
  const results: Array<{ sourceUrl: string; upscaledUrl: string | null }> = [];

  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const batch = imageUrls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (url) => ({
        sourceUrl: url,
        upscaledUrl: await upscaleImage(url, scale),
      })),
    );
    results.push(...batchResults);
    console.log(
      `[Upscaler] Batch ${Math.floor(i / concurrency) + 1}: ${batchResults.filter((r) => r.upscaledUrl).length}/${batch.length} upscaled`,
    );
  }

  return results;
}
