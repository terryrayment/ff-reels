#!/usr/bin/env node
/**
 * Full desktop functionality audit for F&F marketing site.
 *
 * Usage:
 *   npm run marketing:desktop-qc
 *   node scripts/marketing/run-desktop-functionality-audit.mjs --url=https://reels.friendsandfamily.tv
 *   node scripts/marketing/run-desktop-functionality-audit.mjs --quick   # layout/nav/filters only (~2 min)
 *   node scripts/marketing/run-desktop-functionality-audit.mjs --headed
 *
 * Artifacts (gitignored): test-results/desktop-functionality-audit/[timestamp]/
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const DEFAULT_URL = "https://reels.friendsandfamily.tv";
const PAGE_LOAD = "domcontentloaded";
const PAGE_TIMEOUT = 90000;
const OVERFLOW_TOLERANCE_PX = 1;
const REPO_ROOT = process.cwd();

const VIEWPORTS = [
  { id: "1024x768", width: 1024, height: 768 },
  { id: "1180x820", width: 1180, height: 820 },
  { id: "1366x768", width: 1366, height: 768 },
  { id: "1440x900", width: 1440, height: 900 },
  { id: "1536x864", width: 1536, height: 864 },
  { id: "1728x1117", width: 1728, height: 1117 },
  { id: "1920x1080", width: 1920, height: 1080 },
];

const STATIC_ROUTES = [
  "/site",
  "/site/work",
  "/site/directors",
  "/site/about",
  "/site/contact",
  "/site/youth",
  "/site/colossal",
  "/versant",
  "/commercial-production-company-los-angeles",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
];

const WORK_FILTERS = [
  { path: "/site/work", label: "All" },
  { path: "/site/work?type=commercials", label: "Commercials" },
  { path: "/site/work?type=case-studies", label: "Case studies" },
  { path: "/site/work?type=films", label: "Films" },
];

const REQUIRED_WORK_SAMPLES = [
  { label: "Ford Lobo", match: /ford|lobo/i },
  { label: "Little Caesars Pizza Bot", match: /little caesars|pizza bot/i },
  { label: "CITI Can I Click It", match: /citi|click/i },
  { label: "Topps Chrome Rush", match: /topps|chrome/i },
  { label: "Frank's Shake", match: /frank|shake/i },
  { label: "Friendly's Food Pics", match: /friendly|food pic/i },
  { label: "Cadillac Tree Hunting", match: /cadillac|tree/i },
  { label: "Kodak Understanding", match: /kodak|understanding/i },
  { label: "Purina April Dixie", match: /purina|april|dixie/i },
  { label: "Doordash In Peace", match: /doordash|peace/i },
  { label: "Viacom Mental Health", match: /viacom|mental/i },
  { label: "Jaguar Joyride", match: /jaguar|joyride/i },
  { label: "Wealthfront French Toast", match: /wealthfront|french/i },
  { label: "AOS JuJu", match: /aos|juju/i },
  { label: "Four Loko Premium", match: /four loko|premium/i },
  { label: "Evian This is Evian", match: /evian/i },
  { label: "Callaway Forefront", match: /callaway|forefront/i },
  { label: "Bonnaroo Dragon", match: /bonnaroo|dragon/i },
  { label: "Cody Cloud playable", match: /patron|cody/i },
  { label: "Cody Cloud poster-only", match: /absolut/i },
  { label: "James Frost Nike", match: /nike|human|printing/i },
  { label: "Husky Sumo", match: /husky|sumo/i },
  { label: "Brother Willis", match: /brother willis|topps|ford drive/i },
  { label: "Boma Iluma", match: /boma|iluma|jeep|jordan/i },
  { label: "Bueno", match: /bueno|doritos|citi/i },
  { label: "Caleb Slain", match: /caleb|ford|lexus|microsoft/i },
];

const DIRECTOR_SAMPLES = [
  "caleb-slain",
  "james-frost",
  "bueno",
  "terry-rayment",
  "jack-turits",
  "cody-cloud",
  "brother-willis",
  "boma-iluma",
  "matt-dilmore",
  "le-ged",
  "kelsey-larkin",
  "tarik-karam",
];

const GALLERY_SWITCH_DIRECTORS = [
  { slug: "terry-rayment", switches: 5 },
  { slug: "jack-turits", switches: 5 },
  { slug: "james-frost", switches: 5 },
  { slug: "cody-cloud", switches: 3 },
  { slug: "brother-willis", switches: 5 },
  { slug: "boma-iluma", switches: 5 },
  { slug: "bueno", switches: 5 },
  { slug: "caleb-slain", switches: 5 },
];

const NAV_DESKTOP_LINKS = [
  { href: "/site/work", label: "Work" },
  { href: "/site/directors", label: "Talent" },
  { href: "/site/youth", label: "Youth" },
  { href: "/site/colossal", label: "Colossal" },
  { href: "/site/about", label: "About" },
  { href: "/site/contact", label: "Contact" },
];

function parseArgs(argv) {
  let baseUrl = DEFAULT_URL;
  let headed = false;
  let quick = false;
  for (const arg of argv) {
    if (arg.startsWith("--url=")) baseUrl = arg.slice("--url=".length).replace(/\/$/, "");
    if (arg === "--headed") headed = true;
    if (arg === "--quick") quick = true;
  }
  return { baseUrl, headed, quick };
}

function slugifyRoute(route) {
  return route.replace(/^\//, "").replace(/[/?=&.]/g, "_") || "root";
}

function isCriticalNetwork(url, status) {
  if (url.includes("favicon")) return false;
  if (url.includes("analytics") || url.includes("hotjar") || url.includes("gtag")) return false;
  if (status >= 500) return true;
  if (status === 404 && (url.includes(".js") || url.includes("_next") || url.includes("images.imagenegativa"))) return true;
  return status >= 400 && url.includes("friendsandfamily.tv");
}

async function measureLayout(page) {
  return page.evaluate((tolerance) => {
    const vw = window.innerWidth;
    const sw = document.documentElement.scrollWidth;
    const overflowPx = Math.max(0, sw - vw - tolerance);
    let firstOverflowEl = null;
    if (overflowPx > 0) {
      for (const el of document.querySelectorAll("body *")) {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (rect.right > vw + tolerance + 0.5 || rect.left < -tolerance - 0.5) {
          const tag = el.tagName.toLowerCase();
          const cls = typeof el.className === "string" ? el.className.split(/\s+/).slice(0, 3).join(".") : "";
          firstOverflowEl = `${tag}${cls ? `.${cls}` : ""}`;
          break;
        }
      }
    }
    return { viewportWidth: vw, bodyScrollWidth: sw, horizontalOverflowPx: overflowPx, firstOverflowElement: firstOverflowEl };
  }, OVERFLOW_TOLERANCE_PX);
}

async function collectRouteInventory(page) {
  return page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const footer = document.querySelector("footer");
    const clickables = [...document.querySelectorAll("a[href], button")].filter((el) => {
      const s = getComputedStyle(el);
      return s.visibility !== "hidden" && s.display !== "none";
    });
    return {
      title: document.title,
      mainHeading: h1?.textContent?.trim() ?? null,
      footerVisible: Boolean(footer && footer.getBoundingClientRect().height > 0),
      clickableCount: clickables.length,
      cardCount: document.querySelectorAll("[data-marketing-media-frame]").length,
      videoViewerCount: document.querySelectorAll("[data-marketing-featured-media-target]").length,
      imageCount: document.querySelectorAll("img").length,
    };
  });
}

async function readViewerState(page) {
  return page.evaluate(() => {
    const target = document.querySelector("[data-marketing-featured-media-target]");
    const caption = document.querySelector("[data-marketing-transition-reveal]")?.textContent?.replace(/\s+/g, " ").trim() ?? null;
    return {
      url: location.href,
      hasPlay: location.search.includes("play="),
      hasTarget: Boolean(target),
      mediaReady: target?.getAttribute("data-marketing-media-ready") ?? null,
      autoplay: target?.getAttribute("data-marketing-autoplay-state") ?? null,
      overlayCount: document.querySelectorAll(".marketing-media-transition").length,
      activeClass: document.documentElement.classList.contains("marketing-media-transition-active"),
      caption,
    };
  });
}

async function waitTransitionDone(page, ms = 6000) {
  await page.waitForFunction(
    () => !document.documentElement.classList.contains("marketing-media-transition-active"),
    { timeout: ms },
  ).catch(() => {});
  await page.waitForTimeout(400);
}

async function testDesktopNav(page, baseUrl, viewport, clickLog, failures) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(`${baseUrl}/site`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });

  const logo = page.locator('a[aria-label="Friends & Family"]');
  if (!(await logo.isVisible())) {
    failures.push({ severity: "high", category: "nav", viewport: viewport.id, route: "/site", failure: "Logo not visible" });
  }

  for (const link of NAV_DESKTOP_LINKS) {
    await page.goto(`${baseUrl}/site`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    const navLink = page.locator(`header nav a[href="${link.href}"]`).first();
    if (!(await navLink.isVisible())) {
      if (viewport.width >= 1180) {
        failures.push({ severity: "high", category: "nav", viewport: viewport.id, failure: `Nav link not visible: ${link.label}` });
      }
      continue;
    }
    await navLink.click({ timeout: 15000 });
    clickLog.push({ action: "nav-click", link: link.label, viewport: viewport.id });
    await page.waitForURL(new RegExp(link.href.replace("/", "\\/")), { timeout: 30000 });
    const layout = await measureLayout(page);
    if (layout.horizontalOverflowPx > OVERFLOW_TOLERANCE_PX) {
      failures.push({
        severity: "medium",
        category: "layout",
        viewport: viewport.id,
        route: link.href,
        failure: `Overflow after nav to ${link.label}: ${layout.horizontalOverflowPx}px`,
        element: layout.firstOverflowElement,
      });
    }
    await page.goBack({ waitUntil: PAGE_LOAD, timeout: 60000 }).catch(() => {});
  }

  await page.goto(`${baseUrl}/site/work`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  await logo.click();
  clickLog.push({ action: "logo-click", viewport: viewport.id });
  await page.waitForURL(/\/site\/?$/, { timeout: 15000 });
}

async function testWorkFilters(page, baseUrl, viewport, filterChecks, failures, clickLog) {
  for (const filter of WORK_FILTERS) {
    await page.goto(`${baseUrl}${filter.path}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    const layout = await measureLayout(page);
    const cards = await page.$$eval("[data-marketing-media-frame]", (frames) =>
      frames.map((f) => {
        const a = f.closest("a");
        return {
          href: a?.getAttribute("href") ?? "",
          text: a?.textContent?.replace(/\s+/g, " ").trim() ?? "",
        };
      }),
    );
    const titles = cards.slice(0, 10).map((c) => c.text.slice(0, 60));
    const hrefs = cards.map((c) => c.href);
    const dupes = hrefs.filter((h, i) => hrefs.indexOf(h) !== i);
    const active = await page.locator(".ff-filter-link-active").textContent().catch(() => null);

    filterChecks.push({
      filter: filter.label,
      path: filter.path,
      viewport: viewport.id,
      cardCount: cards.length,
      firstTenTitles: titles,
      duplicateHrefs: dupes.length,
      activeLabel: active?.trim() ?? null,
      overflowPx: layout.horizontalOverflowPx,
    });

    if (dupes.length > 0) {
      failures.push({ severity: "high", category: "work", route: filter.path, failure: `Duplicate cards after filter: ${dupes.length}` });
    }
    if (layout.horizontalOverflowPx > OVERFLOW_TOLERANCE_PX) {
      failures.push({ severity: "high", category: "layout", route: filter.path, viewport: viewport.id, failure: `Work filter overflow ${layout.horizontalOverflowPx}px`, element: layout.firstOverflowElement });
    }

    for (let i = 0; i < Math.min(3, cards.length); i++) {
      const card = cards[i];
      if (!card.href.includes("play=")) {
        failures.push({ severity: "high", category: "work", route: filter.path, failure: `Card missing ?play: ${card.text}` });
        continue;
      }
      await page.goto(`${baseUrl}/site/work`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
      const link = page.locator(`a[href="${card.href}"]`).first();
      await link.scrollIntoViewIfNeeded();
      await Promise.all([
        page.waitForURL(/\/site\/directors\//, { timeout: 25000 }),
        link.click(),
      ]);
      clickLog.push({ action: "work-filter-card", filter: filter.label, card: card.text.slice(0, 50) });
      await waitTransitionDone(page);
      const state = await readViewerState(page);
      if (!state.hasTarget) failures.push({ severity: "high", category: "work", failure: `No viewer after card click: ${card.text}` });
      if (!state.hasPlay) failures.push({ severity: "high", category: "work", failure: `No ?play in URL: ${state.url}` });
      if (state.overlayCount > 0 || state.activeClass) failures.push({ severity: "high", category: "transition", failure: `Stuck overlay: ${card.text}` });
      await page.goBack({ waitUntil: PAGE_LOAD, timeout: 60000 }).catch(() => page.goto(`${baseUrl}${filter.path}`));
    }
  }
}

async function collectAllWorkCards(page, baseUrl) {
  await page.goto(`${baseUrl}/site/work`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  return page.$$eval("[data-marketing-media-frame]", (frames) =>
    frames.map((f, index) => {
      const a = f.closest("a");
      return {
        index,
        href: a?.getAttribute("href") ?? "",
        text: a?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      };
    }),
  );
}

async function testWorkCardsBatch(page, baseUrl, cards, indices, viewerChecks, failures, clickLog, label) {
  for (const i of indices) {
    const card = cards[i];
    if (!card?.href) continue;
    await page.goto(`${baseUrl}/site/work`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    const link = page.locator(`a[href="${card.href}"]`).first();
    if (!(await link.count())) continue;
    await link.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await Promise.all([
      page.waitForURL(/\/site\/directors\//, { timeout: 25000 }),
      link.click(),
    ]);
    clickLog.push({ action: "work-card", batch: label, index: i, card: card.text.slice(0, 60) });
    await waitTransitionDone(page);
    const state = await readViewerState(page);
    viewerChecks.push({ batch: label, index: i, card: card.text.slice(0, 80), ...state });
    if (!state.hasTarget) failures.push({ severity: "high", category: "work", failure: `[${label}] Missing viewer: ${card.text}`, route: state.url });
    if (!state.hasPlay) failures.push({ severity: "high", category: "work", failure: `[${label}] Missing ?play: ${card.text}` });
    if (state.overlayCount > 0) failures.push({ severity: "high", category: "transition", failure: `[${label}] Stuck overlay: ${card.text}` });
    const autoplayOk = ["playing", "blocked", "requested", "unavailable"].includes(state.autoplay ?? "");
    if (!autoplayOk) failures.push({ severity: "medium", category: "media", failure: `[${label}] Bad autoplay state ${state.autoplay}: ${card.text}` });
    await page.goBack({ waitUntil: PAGE_LOAD, timeout: 60000 }).catch(() => {});
  }
}

async function testTalentCards(page, baseUrl, slugs, viewerChecks, failures, clickLog) {
  await page.goto(`${baseUrl}/site/directors`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  const talentCards = await page.$$eval("[data-marketing-media-frame]", (frames) =>
    frames.map((f) => {
      const a = f.closest("a");
      return { href: a?.getAttribute("href") ?? "", text: a?.textContent?.replace(/\s+/g, " ").trim() ?? "" };
    }),
  );

  const toTest = new Set(slugs);
  for (const card of talentCards) {
    const m = card.href.match(/\/site\/directors\/([^/?#]+)/);
    if (!m) continue;
    if (!toTest.has(m[1]) && toTest.size < 25) toTest.add(m[1]);
  }

  for (const slug of [...toTest]) {
    await page.goto(`${baseUrl}/site/directors`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    const link = page.locator(`a[href*="/site/directors/${slug}"]`).first();
    if (!(await link.count())) continue;
    await link.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(new RegExp(`/site/directors/${slug}`), { timeout: 25000 }),
      link.click(),
    ]);
    clickLog.push({ action: "talent-card", slug });
    await waitTransitionDone(page);
    const state = await readViewerState(page);
    viewerChecks.push({ type: "talent", slug, ...state });
    if (!state.hasTarget) failures.push({ severity: "high", category: "talent", failure: `No viewer for ${slug}` });
    if (state.overlayCount > 0) failures.push({ severity: "high", category: "transition", failure: `Stuck overlay talent ${slug}` });
    await page.goBack({ waitUntil: PAGE_LOAD, timeout: 60000 }).catch(() => {});
  }
}

async function testGallerySwitches(page, baseUrl, failures, clickLog, transitionScorecard) {
  for (const { slug, switches } of GALLERY_SWITCH_DIRECTORS) {
    await page.goto(`${baseUrl}/site/directors/${slug}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    await waitTransitionDone(page);
    const gallery = await page.$$eval("[data-marketing-media-frame]", (frames) =>
      frames.map((f) => {
        const a = f.closest("a");
        return { href: a?.getAttribute("href") ?? "", text: a?.textContent?.replace(/\s+/g, " ").trim() ?? "" };
      }),
    );
    const unique = gallery.filter((g, i, arr) => g.href && arr.findIndex((x) => x.href === g.href) === i);
    let prevUrl = page.url();
    for (let s = 0; s < Math.min(switches, unique.length); s++) {
      const card = unique[s];
      await page.goto(`${baseUrl}/site/directors/${slug}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
      const link = page.locator(`a[href="${card.href}"]`).first();
      if (!(await link.count())) continue;
      const scrollBefore = await page.evaluate(() => window.scrollY);
      await link.scrollIntoViewIfNeeded();
      await link.click();
      clickLog.push({ action: "gallery-switch", slug, switch: s + 1, card: card.text.slice(0, 40) });
      await page.waitForTimeout(1200);
      await waitTransitionDone(page, 3000);
      const state = await readViewerState(page);
      const scrollAfter = await page.evaluate(() => window.scrollY);
      const morphActive = await page.evaluate(() =>
        document.documentElement.classList.contains("marketing-media-transition-active"),
      );
      transitionScorecard.push({ slug, switch: s + 1, prevUrl, url: state.url, scrollBefore, scrollAfter, morphActive, ...state });
      if (!state.url.includes("play=")) failures.push({ severity: "high", category: "gallery", failure: `${slug} switch ${s + 1} missing ?play` });
      if (morphActive || state.overlayCount > 0) failures.push({ severity: "high", category: "gallery", failure: `${slug} switch ${s + 1} stuck morph/overlay` });
      prevUrl = state.url;
    }
  }
}

async function testRequiredWorkSamples(page, baseUrl, allCards, viewerChecks, failures, clickLog) {
  for (const sample of REQUIRED_WORK_SAMPLES) {
    const match = allCards.find((c) => sample.match.test(c.text) || sample.match.test(c.href));
    if (!match) {
      failures.push({ severity: "medium", category: "content", failure: `Required work card not found: ${sample.label}` });
      continue;
    }
    await page.goto(`${baseUrl}/site/work`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    const link = page.locator(`a[href="${match.href}"]`).first();
    await link.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(/\/site\/directors\//, { timeout: 25000 }),
      link.click(),
    ]);
    clickLog.push({ action: "required-work", sample: sample.label });
    await waitTransitionDone(page);
    const state = await readViewerState(page);
    viewerChecks.push({ type: "required", sample: sample.label, card: match.text, ...state });
    if (!state.hasPlay || !state.hasTarget) {
      failures.push({ severity: "high", category: "work", failure: `Required sample failed: ${sample.label}` });
    }
    if (sample.label.includes("poster-only") && state.mediaReady !== "poster" && state.mediaReady !== "unavailable") {
      failures.push({ severity: "medium", category: "media", failure: `Poster-only expected for ${sample.label}, got ${state.mediaReady}` });
    }
    await page.goBack({ waitUntil: PAGE_LOAD, timeout: 60000 }).catch(() => {});
  }
}

async function testContactAndLinks(page, baseUrl, failures, linkCrawl) {
  await page.goto(`${baseUrl}/site/contact`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  const links = await page.$$eval("a[href]", (as) =>
    as.map((a) => ({ href: a.getAttribute("href") ?? "", text: a.textContent?.replace(/\s+/g, " ").trim() ?? "" })),
  );
  for (const link of links) {
    if (!link.href || link.href === "#" || link.href.startsWith("javascript:void")) {
      failures.push({ severity: "high", category: "links", route: "/site/contact", failure: `Bad href: ${link.href || "(empty)"}` });
    }
  }
  linkCrawl.contactLinksChecked = links.length;

  const visited = new Set();
  const toVisit = ["/site", "/site/work", "/site/directors", "/site/about", "/site/contact", "/site/youth", "/site/colossal"];
  const broken = [];
  while (toVisit.length && visited.size < 60) {
    const route = toVisit.shift();
    if (!route || visited.has(route)) continue;
    visited.add(route);
    const res = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => null);
    const status = res?.status() ?? 0;
    if (status >= 400) broken.push({ route, status });
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs) {
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      if (href.startsWith("http") && !href.includes("friendsandfamily.tv")) continue;
      const p = href.startsWith("http") ? new URL(href).pathname : href.split("#")[0];
      if (p.startsWith("/site") && !visited.has(p)) toVisit.push(p);
    }
  }
  linkCrawl.pagesVisited = [...visited];
  linkCrawl.brokenLinks = broken;
}

async function screenshotRoutes(page, baseUrl, viewport, routes, screenshotDir, routeInventory, failures) {
  let count = 0;
  for (const route of routes) {
    if (route.endsWith(".txt") || route.endsWith(".xml") || route.endsWith(".json")) continue;
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const res = await page.goto(`${baseUrl}${route}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT }).catch(() => null);
    await page.waitForTimeout(300);
    const file = path.join(screenshotDir, `${viewport.id}__${slugifyRoute(route)}.png`);
    await page.screenshot({ path: file, fullPage: false, timeout: 15000 }).catch(() => {});
    count += 1;
    const layout = await measureLayout(page);
    const inventory = await collectRouteInventory(page);
    routeInventory.push({ route, viewport: viewport.id, screenshot: file, layout, inventory, httpStatus: res?.status() ?? 0 });
    if (layout.horizontalOverflowPx > OVERFLOW_TOLERANCE_PX && !route.includes("youth") && !route.includes("colossal")) {
      failures.push({
        severity: layout.horizontalOverflowPx > 8 ? "high" : "medium",
        category: "layout",
        route,
        viewport: viewport.id,
        failure: `Horizontal overflow ${layout.horizontalOverflowPx}px`,
        element: layout.firstOverflowElement,
        artifact: file,
      });
    }
  }
  return count;
}

async function testYouthColossal(page, baseUrl, failures, clickLog) {
  await page.goto(`${baseUrl}/site/youth`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  const logoVisible = await page.locator('a[aria-label="Friends & Family"]').isVisible();
  if (!logoVisible) failures.push({ severity: "medium", category: "youth", failure: "Logo not visible on Youth" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  clickLog.push({ action: "youth-scroll-bottom" });
  if (!page.url().includes("/site/youth")) failures.push({ severity: "high", category: "youth", failure: "Youth route popped away on scroll" });
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.goto(`${baseUrl}/site/colossal`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  const layout = await measureLayout(page);
  if (layout.horizontalOverflowPx > OVERFLOW_TOLERANCE_PX) {
    failures.push({ severity: "medium", category: "colossal", failure: `Colossal overflow ${layout.horizontalOverflowPx}px` });
  }
}

async function testKeyboardFocus(page, baseUrl, failures, clickLog) {
  await page.goto(`${baseUrl}/site`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  await page.keyboard.press("Tab");
  for (let i = 0; i < 8; i++) await page.keyboard.press("Tab");
  const focusInfo = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    return { tag: el.tagName, href: el.getAttribute("href") };
  });
  clickLog.push({ action: "keyboard-tab", focusInfo });
  if (!focusInfo) failures.push({ severity: "medium", category: "a11y", failure: "No focus after tabbing" });
}

async function testMetaRoutes(page, baseUrl, failures, linkCrawl) {
  for (const route of ["/robots.txt", "/sitemap.xml", "/manifest.json"]) {
    const res = await page.goto(`${baseUrl}${route}`, { waitUntil: PAGE_LOAD, timeout: 30000 }).catch(() => null);
    const status = res?.status() ?? 0;
    linkCrawl.checked = linkCrawl.checked || [];
    linkCrawl.checked.push({ route, status });
    if (status >= 400) failures.push({ severity: "high", category: "seo", route, failure: `Meta route ${status}` });
  }
}

async function main() {
  const { baseUrl, headed, quick } = parseArgs(process.argv.slice(2));
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const artifactRoot = path.join(REPO_ROOT, "test-results", "desktop-functionality-audit", timestamp);
  for (const d of ["videos", "screenshots", "traces", "logs", "summaries"]) {
    await mkdir(path.join(artifactRoot, d), { recursive: true });
  }

  const failures = [];
  const clickLog = [];
  const filterChecks = [];
  const viewerChecks = [];
  const transitionScorecard = [];
  const consoleEvents = [];
  const networkEvents = [];
  const routeInventory = [];
  const linkCrawl = { contactLinksChecked: 0, pagesVisited: [], brokenLinks: [], checked: [] };

  const browser = await chromium.launch({ headless: !headed });
  const primaryViewport = VIEWPORTS.find((v) => v.id === "1440x900");

  async function setupPage(variant = {}) {
    const context = await browser.newContext({
      viewport: { width: primaryViewport.width, height: primaryViewport.height },
      reducedMotion: variant.reducedMotion ? "reduce" : "no-preference",
      serviceWorkers: variant.noCache ? "block" : "allow",
    });
    if (variant.throttled) {
      await context.route("**/*", async (route) => {
        await new Promise((r) => setTimeout(r, 40));
        await route.continue();
      });
    }
    const page = await context.newPage();
    page.on("console", (msg) => {
      const t = msg.type();
      if (t === "error" || t === "warning") {
        const text = msg.text();
        if (text.includes("ResizeObserver")) return;
        consoleEvents.push({ type: t, text, url: page.url() });
      }
    });
    page.on("requestfailed", (req) => {
      const url = req.url();
      if (url.includes("favicon") || req.failure()?.errorText === "net::ERR_ABORTED") return;
      networkEvents.push({ kind: "failed", url, error: req.failure()?.errorText, pageUrl: page.url() });
    });
    page.on("response", (res) => {
      const status = res.status();
      const url = res.url();
      if (isCriticalNetwork(url, status)) {
        networkEvents.push({ kind: "http", url, status, pageUrl: page.url() });
      }
    });
    return { context, page };
  }

  const { context, page } = await setupPage();
  let screenshotCount = 0;

  console.log("Desktop audit — layout + screenshots across viewports");
  for (const viewport of VIEWPORTS) {
    screenshotCount += await screenshotRoutes(
      page,
      baseUrl,
      viewport,
      STATIC_ROUTES.filter((r) => !r.includes(".")),
      path.join(artifactRoot, "screenshots"),
      routeInventory,
      failures,
    );
  }

  console.log("Desktop audit — nav + interactions at 1440x900");
  await page.setViewportSize({ width: 1440, height: 900 });
  await testDesktopNav(page, baseUrl, primaryViewport, clickLog, failures);
  await testWorkFilters(page, baseUrl, primaryViewport, filterChecks, failures, clickLog);

  const allCards = await collectAllWorkCards(page, baseUrl);
  const n = allCards.length;
  const first20 = [...Array(Math.min(20, n)).keys()];
  const midStart = Math.max(0, Math.floor(n / 2) - 10);
  const middle20 = [...Array(Math.min(20, n - midStart)).keys()].map((i) => i + midStart);
  const deepStart = Math.max(0, n - 20);
  const deep20 = [...Array(Math.min(20, n - deepStart)).keys()].map((i) => i + deepStart);

  if (!quick) {
    console.log("Desktop audit — work cards, talent, gallery switches");
    await testWorkCardsBatch(page, baseUrl, allCards, first20, viewerChecks, failures, clickLog, "first20");
    await testWorkCardsBatch(page, baseUrl, allCards, middle20, viewerChecks, failures, clickLog, "middle20");
    await testWorkCardsBatch(page, baseUrl, allCards, deep20, viewerChecks, failures, clickLog, "deep20");
    await testRequiredWorkSamples(page, baseUrl, allCards, viewerChecks, failures, clickLog);
    await testTalentCards(page, baseUrl, DIRECTOR_SAMPLES, viewerChecks, failures, clickLog);
    await testGallerySwitches(page, baseUrl, failures, clickLog, transitionScorecard);
  }

  await testYouthColossal(page, baseUrl, failures, clickLog);
  await testContactAndLinks(page, baseUrl, failures, linkCrawl);
  await testMetaRoutes(page, baseUrl, failures, linkCrawl);
  await testKeyboardFocus(page, baseUrl, failures, clickLog);

  await context.close();

  if (!quick) {
    const { context: ctx2, page: page2 } = await setupPage({ reducedMotion: true });
    await page2.goto(`${baseUrl}/site/work`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    const card = page2.locator("[data-marketing-media-frame]").first();
    if (await card.count()) {
      await Promise.all([page2.waitForURL(/\/site\/directors\//, { timeout: 25000 }), card.click()]);
      clickLog.push({ action: "reduced-motion-work-card" });
      const overlay = await page2.evaluate(() => document.querySelectorAll(".marketing-media-transition").length);
      if (overlay > 0) failures.push({ severity: "high", category: "a11y", failure: "Reduced motion still showed morph overlay" });
    }
    await ctx2.close();

    const { context: ctx3, page: page3 } = await setupPage({ throttled: true, noCache: true });
    await page3.goto(`${baseUrl}/site/directors`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    const tcard = page3.locator("[data-marketing-media-frame]").first();
    if (await tcard.count()) {
      await Promise.all([page3.waitForURL(/\/site\/directors\//, { timeout: 45000 }), tcard.click()]);
      clickLog.push({ action: "throttled-talent-card" });
      await waitTransitionDone(page3, 10000);
      const state = await readViewerState(page3);
      if (!state.hasTarget) failures.push({ severity: "high", category: "network", failure: "Throttled talent navigation missing viewer" });
    }
    await ctx3.close();
  }

  await browser.close();

  const criticalConsole = consoleEvents.filter((e) => e.type === "error");
  const summary = {
    timestamp,
    baseUrl,
    viewports: VIEWPORTS.map((v) => v.id),
    routesAudited: STATIC_ROUTES,
    workCardsTotal: n,
    workCardsTested: viewerChecks.filter((v) => v.batch).length,
    talentCardsTested: viewerChecks.filter((v) => v.type === "talent").length,
    gallerySwitches: transitionScorecard.length,
    failuresCount: failures.length,
    criticalFailures: failures.filter((f) => f.severity === "high").length,
    consoleErrors: criticalConsole.length,
    consoleWarnings: consoleEvents.filter((e) => e.type === "warning").length,
    criticalNetworkEvents: networkEvents.length,
    screenshotCount,
    pass: failures.filter((f) => f.severity === "high").length === 0,
  };

  await writeFile(path.join(artifactRoot, "desktop-route-inventory.json"), JSON.stringify(routeInventory, null, 2));
  await writeFile(path.join(artifactRoot, "desktop-click-log.json"), JSON.stringify(clickLog, null, 2));
  await writeFile(path.join(artifactRoot, "desktop-filter-checks.json"), JSON.stringify(filterChecks, null, 2));
  await writeFile(path.join(artifactRoot, "desktop-selected-viewer-checks.json"), JSON.stringify(viewerChecks, null, 2));
  await writeFile(path.join(artifactRoot, "desktop-transition-scorecard.json"), JSON.stringify(transitionScorecard, null, 2));
  await writeFile(path.join(artifactRoot, "desktop-console-events.json"), JSON.stringify(consoleEvents, null, 2));
  await writeFile(path.join(artifactRoot, "desktop-network-events.json"), JSON.stringify(networkEvents, null, 2));
  await writeFile(path.join(artifactRoot, "desktop-link-media-crawl.json"), JSON.stringify(linkCrawl, null, 2));
  await writeFile(path.join(artifactRoot, "desktop-failures.json"), JSON.stringify(failures, null, 2));
  await writeFile(
    path.join(artifactRoot, "desktop-visual-notes.md"),
    `# Desktop visual notes\n\n- Screenshots: ${screenshotCount}\n- Failures: ${failures.length}\n\n${failures.map((f) => `- [${f.severity}] ${f.category}: ${f.failure}`).join("\n") || "No failures."}\n`,
  );
  await writeFile(path.join(artifactRoot, "summary.json"), JSON.stringify(summary, null, 2));

  console.log("");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Artifacts: ${artifactRoot}`);
  if (!summary.pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
