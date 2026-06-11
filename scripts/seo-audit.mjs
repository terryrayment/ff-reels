#!/usr/bin/env node
/**
 * SEO policy audit for the Next.js app (reels.friendsandfamily.tv).
 * Asserts the indexability policy documented in docs/SEO.md and CLAUDE.md:
 *   - robots.txt allowlists only approved public routes and disallows the rest
 *   - sitemap.xml lists only approved indexable routes (no tokenized/private URLs)
 *   - indexable marketing pages serve `index, follow`
 *   - imprint + preview pages serve `noindex, nofollow`
 *   - private/auth/tokenized/API routes send X-Robots-Tag: noindex
 *
 * Usage: npm run seo:audit [-- --url=https://reels.friendsandfamily.tv]
 */

const DEFAULT_URL = "https://reels.friendsandfamily.tv";

// Exact indexable paths; director portfolios are matched by pattern below.
const INDEXABLE_PATHS = new Set([
  "/site",
  "/site/work",
  "/site/directors",
  "/site/about",
  "/site/contact",
  "/commercial-production-company-los-angeles",
]);
const DIRECTOR_SLUG_PATTERN = /^\/site\/directors\/[a-z0-9-]+$/;

// Publicly reachable pages that must declare noindex in their meta robots.
const NOINDEX_PAGES = [
  "/site/youth",
  "/site/colossal",
  "/site/home/preview",
  "/site/home/preview-2",
  "/site/home/preview-3",
  "/site/about/preview",
  "/site/preview",
  "/site/preview/imprint-nav",
];

// Routes that must answer with an X-Robots-Tag noindex header.
const PRIVATE_ROUTES = ["/login", "/dashboard", "/api/reels", "/s/seo-audit-probe"];

function parseArgs(argv) {
  let baseUrl = DEFAULT_URL;
  for (const arg of argv) {
    if (arg.startsWith("--url=")) baseUrl = arg.slice("--url=".length).replace(/\/$/, "");
  }
  return { baseUrl };
}

const failures = [];

function report(ok, label, detail = "") {
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20000) });
  return { res, body: await res.text() };
}

function metaRobots(html) {
  const match = html.match(/<meta name="robots" content="([^"]+)"/i);
  return match ? match[1] : null;
}

async function auditRobotsTxt(baseUrl) {
  const { res, body } = await fetchText(`${baseUrl}/robots.txt`);
  report(res.status === 200, "robots.txt responds 200", `status ${res.status}`);

  const lines = body.split("\n").map((line) => line.trim());
  report(
    lines.includes("Disallow: /"),
    "robots.txt disallows everything by default",
  );
  for (const path of ["/site", "/commercial-production-company-los-angeles"]) {
    report(
      lines.includes(`Allow: ${path}`),
      `robots.txt allows ${path}`,
    );
  }
  report(
    lines.some((line) => line.startsWith("Sitemap: ")),
    "robots.txt declares a sitemap",
  );
  report(
    !/\/s\/[A-Za-z0-9]|token/i.test(body),
    "robots.txt exposes no tokenized URLs",
  );
}

async function auditSitemap(baseUrl) {
  const { res, body } = await fetchText(`${baseUrl}/sitemap.xml`);
  report(res.status === 200, "sitemap.xml responds 200", `status ${res.status}`);

  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  report(locs.length > 0, "sitemap.xml lists URLs", `${locs.length} entries`);

  const rogue = locs.filter(
    (path) => !INDEXABLE_PATHS.has(path) && !DIRECTOR_SLUG_PATTERN.test(path),
  );
  report(
    rogue.length === 0,
    "sitemap.xml contains only approved indexable routes",
    rogue.length ? `unexpected: ${rogue.join(", ")}` : `${locs.length} entries ok`,
  );

  for (const path of INDEXABLE_PATHS) {
    report(locs.includes(path), `sitemap.xml includes ${path}`);
  }
}

async function auditIndexablePages(baseUrl) {
  for (const path of INDEXABLE_PATHS) {
    const { res, body } = await fetchText(`${baseUrl}${path}`);
    const robots = metaRobots(body);
    const headerTag = res.headers.get("x-robots-tag") ?? "";
    const ok =
      res.status === 200 &&
      !headerTag.includes("noindex") &&
      (robots === null || (robots.includes("index") && !robots.includes("noindex")));
    report(ok, `${path} is indexable`, `status ${res.status}, meta="${robots}", header="${headerTag}"`);
  }
}

async function auditNoindexPages(baseUrl) {
  for (const path of NOINDEX_PAGES) {
    const { res, body } = await fetchText(`${baseUrl}${path}`);
    const robots = metaRobots(body);
    const ok = res.status === 200 && robots !== null && robots.includes("noindex");
    report(ok, `${path} is noindex`, `status ${res.status}, meta="${robots}"`);
  }
}

async function auditPrivateRoutes(baseUrl) {
  for (const path of PRIVATE_ROUTES) {
    const { res } = await fetchText(`${baseUrl}${path}`);
    const headerTag = res.headers.get("x-robots-tag") ?? "";
    report(
      headerTag.includes("noindex"),
      `${path} sends X-Robots-Tag noindex`,
      `status ${res.status}, header="${headerTag}"`,
    );
  }
}

async function main() {
  const { baseUrl } = parseArgs(process.argv.slice(2));
  console.log(`SEO audit against ${baseUrl}\n`);

  await auditRobotsTxt(baseUrl);
  await auditSitemap(baseUrl);
  await auditIndexablePages(baseUrl);
  await auditNoindexPages(baseUrl);
  await auditPrivateRoutes(baseUrl);

  console.log(`\n${failures.length === 0 ? "SEO audit passed" : `SEO audit FAILED (${failures.length} checks)`}`);
  if (failures.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
