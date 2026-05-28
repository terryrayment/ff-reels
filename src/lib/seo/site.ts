const APP_URL_FALLBACK = "https://reels.friendsandfamily.tv";
const MARKETING_URL_FALLBACK = "https://www.friendsandfamily.tv";

function normalizeUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  try {
    const parsed = new URL(trimmed);
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export function getAppUrl(): string {
  return normalizeUrl(process.env.NEXT_PUBLIC_APP_URL, APP_URL_FALLBACK);
}

export function getMarketingUrl(): string {
  return normalizeUrl(
    process.env.NEXT_PUBLIC_MARKETING_SITE_URL,
    MARKETING_URL_FALLBACK
  );
}

export function absoluteAppUrl(path = "/"): string {
  return new URL(path, `${getAppUrl()}/`).toString();
}

export function absoluteMarketingUrl(path = "/"): string {
  return new URL(path, `${getMarketingUrl()}/`).toString();
}
