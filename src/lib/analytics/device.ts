/**
 * Lightweight user-agent → device type detection.
 * No external dependency — regex-based classification.
 */

export type DeviceType = "desktop" | "mobile" | "tablet";

export function detectDevice(userAgent: string | null): DeviceType {
  if (!userAgent) return "desktop";
  const ua = userAgent.toLowerCase();

  // Tablets first (iPad, Android tablets, Kindle, etc.)
  if (/ipad|tablet|playbook|silk|kindle|nexus\s?(7|9|10)/.test(ua)) {
    return "tablet";
  }

  // Mobile phones
  if (
    /mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera\s?mini|iemobile/.test(
      ua
    )
  ) {
    return "mobile";
  }

  return "desktop";
}
