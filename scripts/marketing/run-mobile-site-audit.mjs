#!/usr/bin/env node
/**
 * Mobile QA audit for Friends & Family marketing site.
 * Artifacts: test-results/mobile-site-audit/[timestamp]/
 */

import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "playwright";

const DEFAULT_URL = "https://reels.friendsandfamily.tv";
const PAGE_LOAD = "domcontentloaded";
const PAGE_TIMEOUT = 90000;
const OVERFLOW_TOLERANCE_PX = 1;

const VIEWPORTS = [
  { id: "320x568", width: 320, height: 568, orientation: "portrait" },
  { id: "360x740", width: 360, height: 740, orientation: "portrait" },
  { id: "375x667", width: 375, height: 667, orientation: "portrait" },
  { id: "390x844", width: 390, height: 844, orientation: "portrait" },
  { id: "393x852", width: 393, height: 852, orientation: "portrait" },
  { id: "414x896", width: 414, height: 896, orientation: "portrait" },
  { id: "430x932", width: 430, height: 932, orientation: "portrait" },
  { id: "768x1024", width: 768, height: 1024, orientation: "portrait" },
  { id: "390x844-landscape", width: 844, height: 390, orientation: "landscape" },
  { id: "430x932-landscape", width: 932, height: 430, orientation: "landscape" },
];

const STATIC_ROUTES = [
  "/site",
  "/site/work",
  "/site/work?type=commercials",
  "/site/work?type=case-studies",
  "/site/work?type=films",
  "/site/directors",
  "/site/about",
  "/site/contact",
  "/site/youth",
  "/site/colossal",
  "/versant",
  "/commercial-production-company-los-angeles",
];

const WORK_CARD_SAMPLES = [
  { label: "Ford Lobo", match: /ford|lobo/i },
  { label: "CITI Can I Click It", match: /citi|click/i },
  { label: "Cadillac Tree Hunting", match: /cadillac|tree/i },
  { label: "Kodak Understanding", match: /kodak|understanding/i },
  { label: "Wealthfront French Toast", match: /wealthfront|french/i },
  { label: "AOS JuJu", match: /aos|juju/i },
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
];

const DIRECTOR_PLAY_TESTS = [
  { slug: "caleb-slain", playMatch: /ford|lobo/i },
  { slug: "james-frost", playMatch: /nike|human|printing/i },
  { slug: "terry-rayment", playMatch: /cadillac|tree/i },
  { slug: "jack-turits", playMatch: /wealthfront|french/i },
  { slug: "cody-cloud", playMatch: /patron/i },
  { slug: "cody-cloud", playMatch: /absolut/i, posterOnly: true },
  { slug: "bueno", playMatch: /citi|click/i },
  { slug: "brother-willis", playMatch: /topps/i },
  { slug: "boma-iluma", playMatch: /.+/ },
];

function parseArgs(argv) {
  let baseUrl = DEFAULT_URL;
  let headed = false;
  let throttled = false;
  let reducedMotion = false;
  let skipScreenshots = false;
  let skipLayout = false;
  for (const arg of argv) {
    if (arg.startsWith("--url=")) baseUrl = arg.slice("--url=".length).replace(/\/$/, "");
    if (arg === "--headed") headed = true;
    if (arg === "--throttled") throttled = true;
    if (arg === "--reduced-motion") reducedMotion = true;
    if (arg === "--skip-screenshots") skipScreenshots = true;
    if (arg === "--skip-layout") skipLayout = true;
  }
  return { baseUrl, headed, throttled, reducedMotion, skipScreenshots, skipLayout };
}

function slugifyRoute(route) {
  return route.replace(/^\//, "").replace(/[/?=&]/g, "_") || "root";
}

async function measureLayout(page) {
  return page.evaluate((tolerance) => {
    const vw = window.innerWidth;
    const sw = document.documentElement.scrollWidth;
    const overflowPx = Math.max(0, sw - vw - tolerance);
    let firstOverflowEl = null;
    if (overflowPx > 0) {
      const all = document.querySelectorAll("body *");
      for (const el of all) {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (rect.right > vw + tolerance + 0.5 || rect.left < -tolerance - 0.5) {
          const tag = el.tagName.toLowerCase();
          const cls =
            typeof el.className === "string"
              ? el.className.split(/\s+/).slice(0, 3).join(".")
              : "";
          firstOverflowEl = `${tag}${cls ? `.${cls}` : ""}`;
          break;
        }
      }
    }
    return {
      viewportWidth: vw,
      bodyScrollWidth: sw,
      horizontalOverflowPx: overflowPx,
      firstOverflowElement: firstOverflowEl,
    };
  }, OVERFLOW_TOLERANCE_PX);
}

async function collectRouteInventory(page, url) {
  return page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const navBtn = document.querySelector('button[aria-controls="marketing-mobile-menu"]');
    const footer = document.querySelector("footer");
    const clickables = [...document.querySelectorAll("a[href], button")].filter((el) => {
      const style = getComputedStyle(el);
      return style.visibility !== "hidden" && style.display !== "none";
    });
    return {
      title: document.title,
      mainHeading: h1?.textContent?.trim() ?? null,
      navMenuExpanded: navBtn?.getAttribute("aria-expanded") ?? null,
      footerVisible: Boolean(footer && footer.getBoundingClientRect().height > 0),
      clickableCount: clickables.length,
      cardCount: document.querySelectorAll("[data-marketing-media-frame]").length,
      videoViewerCount: document.querySelectorAll("[data-marketing-featured-media-target]").length,
      imageCount: document.querySelectorAll("img").length,
    };
  });
}

async function getTapTargetSize(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  }, selector);
}

async function discoverDirectorLinks(page, baseUrl) {
  await page.goto(`${baseUrl}/site/directors`, {
    waitUntil: PAGE_LOAD,
    timeout: PAGE_TIMEOUT,
  });
  await page.waitForSelector('a[href*="/site/directors/"]', { timeout: 30000 });
  return page.$$eval('a[href*="/site/directors/"]', (links) => {
    const seen = new Set();
    const out = [];
    for (const a of links) {
      const href = a.getAttribute("href") ?? "";
      const m = href.match(/\/site\/directors\/([^/?#]+)/);
      if (!m) continue;
      const slug = m[1];
      if (seen.has(slug)) continue;
      seen.add(slug);
      out.push({ slug, href, label: a.textContent?.replace(/\s+/g, " ").trim() ?? slug });
    }
    return out;
  });
}

async function testMobileNav(page, baseUrl, viewport, clickLog, failures) {
  const menuBtnSel = 'button[aria-controls="marketing-mobile-menu"]';
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(`${baseUrl}/site`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });

  const hamburgerSize = await getTapTargetSize(page, menuBtnSel);
  if (!hamburgerSize || hamburgerSize.width < 44 || hamburgerSize.height < 44) {
    failures.push({
      severity: hamburgerSize ? "medium" : "high",
      category: "nav",
      viewport: viewport.id,
      failure: `Hamburger tap target ${hamburgerSize ? `${Math.round(hamburgerSize.width)}x${Math.round(hamburgerSize.height)}` : "missing"} (<44px)`,
    });
  }

  const openLabel = await page.getAttribute(menuBtnSel, "aria-label");
  // Hydration guard: at domcontentloaded React may not have attached handlers
  // yet (common on dev servers), so a force-click can be a no-op. Retry once.
  await page.click(menuBtnSel, { force: true });
  try {
    await page.waitForSelector("#marketing-mobile-menu.is-open", { timeout: 4000 });
  } catch {
    await page.click(menuBtnSel, { force: true });
    await page
      .waitForSelector("#marketing-mobile-menu.is-open", { timeout: 8000 })
      .catch(() => {});
  }
  clickLog.push({ action: "menu-open", viewport: viewport.id, ts: Date.now() });

  const expanded = await page.getAttribute(menuBtnSel, "aria-expanded");
  const closeLabel = await page.getAttribute(menuBtnSel, "aria-label");
  if (expanded !== "true") {
    failures.push({
      severity: "high",
      category: "nav",
      viewport: viewport.id,
      failure: "Menu did not open (aria-expanded !== true)",
    });
  }
  if (closeLabel !== "Close menu") {
    failures.push({
      severity: "medium",
      category: "a11y",
      viewport: viewport.id,
      failure: `Menu close label wrong: ${closeLabel}`,
    });
  }

  const menuVisible = await page.locator("#marketing-mobile-menu.is-open").isVisible();
  if (!menuVisible) {
    failures.push({
      severity: "high",
      category: "nav",
      viewport: viewport.id,
      failure: "Mobile menu not visible after open",
    });
  }

  const layoutOpen = await measureLayout(page);
  if (layoutOpen.horizontalOverflowPx > OVERFLOW_TOLERANCE_PX) {
    failures.push({
      severity: "medium",
      category: "layout",
      viewport: viewport.id,
      route: "/site",
      failure: `Horizontal overflow with menu open: ${layoutOpen.horizontalOverflowPx}px`,
      element: layoutOpen.firstOverflowElement,
    });
  }

  await page.locator("#marketing-mobile-menu.is-open a[href='/site/work']").click({
    timeout: 15000,
  });
  clickLog.push({ action: "nav-link-work", viewport: viewport.id, ts: Date.now() });
  await page.waitForURL(/\/site\/work/, { timeout: 30000 });
  if (!(await page.url()).includes("/site/work")) {
    failures.push({
      severity: "high",
      category: "nav",
      viewport: viewport.id,
      failure: "Work nav link failed",
    });
  }

  await page.goto(`${baseUrl}/site`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  await page.click(menuBtnSel, { force: true });
  await page.click(menuBtnSel, { force: true });
  clickLog.push({ action: "menu-close", viewport: viewport.id, ts: Date.now() });
  await page.waitForTimeout(350);

  const closedExpanded = await page.getAttribute(menuBtnSel, "aria-expanded");
  if (closedExpanded !== "false") {
    failures.push({
      severity: "high",
      category: "nav",
      viewport: viewport.id,
      failure: "Menu did not close",
    });
  }

  const blockingOverlay = await page.evaluate(() => {
    const menu = document.getElementById("marketing-mobile-menu");
    if (!menu) return false;
    const style = getComputedStyle(menu);
    if (style.visibility === "visible" && style.opacity !== "0") return true;
    const rect = menu.getBoundingClientRect();
    if (rect.height > 0 && style.pointerEvents !== "none") {
      const el = document.elementFromPoint(
        Math.min(window.innerWidth / 2, window.innerWidth - 10),
        Math.min(window.innerHeight / 2, window.innerHeight - 10),
      );
      return el && menu.contains(el);
    }
    return false;
  });
  if (blockingOverlay) {
    failures.push({
      severity: "high",
      category: "nav",
      viewport: viewport.id,
      failure: "Closed menu still blocks center taps",
    });
  }

  return { openLabel, closeLabel, hamburgerSize };
}

async function testWorkFilters(page, baseUrl, clickLog, failures, mediaChecks) {
  const filters = [
    { path: "/site/work", label: "All" },
    { path: "/site/work?type=commercials", label: "Commercials" },
    { path: "/site/work?type=case-studies", label: "Case studies" },
    { path: "/site/work?type=films", label: "Films" },
  ];

  for (const filter of filters) {
    await page.goto(`${baseUrl}${filter.path}`, {
waitUntil: PAGE_LOAD,
    timeout: PAGE_TIMEOUT,
    });
    const layout = await measureLayout(page);
    const cardCount = await page.locator("[data-marketing-media-frame]").count();
    clickLog.push({
      action: "work-filter",
      filter: filter.label,
      cardCount,
      overflow: layout.horizontalOverflowPx,
    });
    if (layout.horizontalOverflowPx > OVERFLOW_TOLERANCE_PX) {
      failures.push({
        severity: "high",
        category: "layout",
        route: filter.path,
        failure: `Work filter overflow ${layout.horizontalOverflowPx}px`,
        element: layout.firstOverflowElement,
      });
    }
    if (cardCount > 0) {
      const cards = page.locator("[data-marketing-media-frame]").first();
      await cards.click({ timeout: 15000 });
      clickLog.push({ action: "work-card-tap", filter: filter.label });
      await page.waitForTimeout(2000);
      const stuck = await page.evaluate(() => ({
        overlay: document.querySelectorAll(".marketing-media-transition").length,
        active: document.documentElement.classList.contains(
          "marketing-media-transition-active",
        ),
      }));
      if (stuck.overlay > 0 || stuck.active) {
        failures.push({
          severity: "high",
          category: "interaction",
          route: filter.path,
          failure: `Stuck transition overlay after card tap (overlay=${stuck.overlay}, active=${stuck.active})`,
        });
      }
      const viewer = page.locator("[data-marketing-featured-media-target]");
      if ((await viewer.count()) > 0) {
        const box = await viewer.first().boundingBox();
        const vw = page.viewportSize()?.width ?? 390;
        if (box && box.width > vw + OVERFLOW_TOLERANCE_PX) {
          failures.push({
            severity: "high",
            category: "media",
            route: page.url(),
            failure: `Viewer wider than viewport (${Math.round(box.width)} > ${vw})`,
          });
        }
      }
      await page.goBack({ waitUntil: PAGE_LOAD, timeout: 60000 }).catch(() => {});
    }
  }

  await page.goto(`${baseUrl}/site/work`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  const allHrefs = await page.$$eval("[data-marketing-media-frame]", (frames) =>
    frames.map((f) => {
      const a = f.closest("a");
      return {
        href: a?.getAttribute("href") ?? "",
        text: a?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      };
    }),
  );

  let extraTested = 0;
  for (const sample of WORK_CARD_SAMPLES) {
    const match = allHrefs.find((h) => sample.match.test(h.text) || sample.match.test(h.href));
    if (!match?.href) continue;
    await page.goto(`${baseUrl}/site/work`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    const link = page.locator(`a[href="${match.href}"]`).first();
    if (!(await link.count())) continue;
    await link.click({ timeout: 15000 });
    await page.waitForTimeout(2500);
    mediaChecks.push({
      sample: sample.label,
      url: page.url(),
      hasViewer: (await page.locator("[data-marketing-featured-media-target]").count()) > 0,
    });
    extraTested += 1;
    await page.goBack({ waitUntil: PAGE_LOAD, timeout: 60000 }).catch(() => {
      page.goto(`${baseUrl}/site/work`, { waitUntil: PAGE_LOAD });
    });
  }

  clickLog.push({ action: "work-high-risk-samples", tested: WORK_CARD_SAMPLES.length, navigated: extraTested });
}

async function testDirectors(page, baseUrl, directors, clickLog, failures, mediaChecks) {
  await page.goto(`${baseUrl}/site/directors`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  const layout = await measureLayout(page);
  if (layout.horizontalOverflowPx > OVERFLOW_TOLERANCE_PX) {
    failures.push({
      severity: "high",
      category: "layout",
      route: "/site/directors",
      failure: `Talent grid overflow ${layout.horizontalOverflowPx}px`,
      element: layout.firstOverflowElement,
    });
  }

  const slugsToTest = [
    ...DIRECTOR_SAMPLES,
    ...directors.map((d) => d.slug).filter((s) => !DIRECTOR_SAMPLES.includes(s)).slice(0, 10),
  ];

  for (const slug of slugsToTest) {
    const href = `/site/directors/${slug}`;
    await page.goto(`${baseUrl}${href}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    clickLog.push({ action: "director-detail", slug });
    const detailLayout = await measureLayout(page);
    if (detailLayout.horizontalOverflowPx > OVERFLOW_TOLERANCE_PX) {
      failures.push({
        severity: "high",
        category: "layout",
        route: href,
        failure: `Director detail overflow ${detailLayout.horizontalOverflowPx}px`,
        element: detailLayout.firstOverflowElement,
      });
    }
    const viewer = page.locator("[data-marketing-featured-media-target]");
    if ((await viewer.count()) > 0) {
      const box = await viewer.first().boundingBox();
      const vw = page.viewportSize()?.width ?? 390;
      if (box && box.width > vw + OVERFLOW_TOLERANCE_PX) {
        failures.push({
          severity: "high",
          category: "media",
          route: href,
          failure: `Director viewer wider than viewport`,
        });
      }
    }
    const galleryCards = page.locator('[data-marketing-media-frame]');
    if ((await galleryCards.count()) > 1) {
      await galleryCards.nth(1).click({ timeout: 15000 });
      await page.waitForTimeout(2000);
      clickLog.push({ action: "director-gallery-switch", slug });
      const url = page.url();
      if (!url.includes("play=")) {
        failures.push({
          severity: "medium",
          category: "interaction",
          route: href,
          failure: "Gallery switch did not update ?play URL",
        });
      }
    }
    mediaChecks.push({ slug, url: page.url() });
  }
}

// NOTE: running the audit with --reduced-motion will trip the medium-severity
// "no preview reached playing" check by design — the hook disables previews
// under prefers-reduced-motion.
async function testTouchPreviews(page, baseUrl, failures, clickLog) {
  // Count CARDS with playing media (not raw elements — mux-player can nest a
  // video). A breach is only real if it survives a 300ms recheck; a single
  // snapshot can catch the one-commit unmount/mount handoff between cards.
  const countPlayingPreviews = () =>
    page.evaluate(() => {
      const frames = Array.from(
        document.querySelectorAll("[data-marketing-media-frame]"),
      );
      return frames.filter((frame) =>
        Array.from(frame.querySelectorAll("mux-player, video")).some(
          (el) => el.paused === false && el.ended !== true,
        ),
      ).length;
    });

  const countPlayingPreviewsStable = async () => {
    const first = await countPlayingPreviews();
    if (first <= 2) return first;
    await page.waitForTimeout(300);
    return countPlayingPreviews();
  };

  await page.goto(`${baseUrl}/site/directors`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  await page.waitForTimeout(2500);

  const samples = [];
  for (let i = 0; i < 6; i += 1) {
    const playing = await countPlayingPreviewsStable();
    samples.push(playing);
    if (playing > 2) {
      failures.push({
        severity: "high",
        category: "media",
        route: "/site/directors",
        failure: `Touch preview concurrency exceeded: ${playing} playing simultaneously`,
      });
      break;
    }
    await page.evaluate(() => window.scrollBy(0, Math.round(window.innerHeight * 0.8)));
    await page.waitForTimeout(1800);
  }
  clickLog.push({ action: "touch-preview-scan", samples });

  if (!samples.some((count) => count > 0)) {
    failures.push({
      severity: "medium",
      category: "media",
      route: "/site/directors",
      failure: "No director card preview reached playing state during scroll scan",
    });
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);
  const firstCard = page.locator("a.ff-fluid-card").first();
  if ((await firstCard.count()) > 0) {
    await firstCard.click({ timeout: 15000 });
    await page.waitForTimeout(3000);
    clickLog.push({ action: "touch-preview-tap-through", url: page.url() });
    if (!/\/site\/directors\/[^/?]+/.test(page.url())) {
      failures.push({
        severity: "high",
        category: "interaction",
        route: "/site/directors",
        failure: `Tap on director card did not navigate (landed on ${page.url()})`,
      });
    }
    const strandedOverlays = await page
      .locator(".marketing-media-transition")
      .count();
    if (strandedOverlays > 0) {
      failures.push({
        severity: "high",
        category: "interaction",
        route: "/site/directors",
        failure: `Morph overlay left in DOM after tap-through (${strandedOverlays})`,
      });
    }
  }

  // Tablet portrait (2-column grid) — the cap exists for this case.
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${baseUrl}/site/directors`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  await page.waitForTimeout(2500);
  const tabletPlaying = await countPlayingPreviewsStable();
  clickLog.push({ action: "touch-preview-tablet-scan", playing: tabletPlaying });
  if (tabletPlaying > 2) {
    failures.push({
      severity: "high",
      category: "media",
      route: "/site/directors",
      failure: `Tablet touch preview concurrency exceeded: ${tabletPlaying} playing`,
    });
  }

  // Restore phone viewport for the checks that run after this one.
  await page.setViewportSize({ width: 390, height: 844 });
}

async function testDirectorPlayCases(page, baseUrl, failures, clickLog) {
  for (const test of DIRECTOR_PLAY_TESTS) {
    await page.goto(`${baseUrl}/site/directors/${test.slug}`, {
waitUntil: PAGE_LOAD,
    timeout: PAGE_TIMEOUT,
    });
    const cards = await page.$$eval("[data-marketing-media-frame]", (frames) =>
      frames.map((f) => {
        const a = f.closest("a");
        return {
          href: a?.getAttribute("href") ?? "",
          text: a?.textContent?.replace(/\s+/g, " ").trim() ?? "",
        };
      }),
    );
    const target = cards.find((c) => test.playMatch.test(c.text) || test.playMatch.test(c.href));
    if (!target?.href) {
      failures.push({
        severity: "medium",
        category: "content",
        route: `/site/directors/${test.slug}`,
        failure: `Play test card not found: ${test.playMatch}`,
      });
      continue;
    }
    await page.goto(`${baseUrl}${target.href}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    clickLog.push({ action: "director-play-test", slug: test.slug, href: target.href });
    await page.waitForTimeout(1500);
    const state = await page.evaluate(() => {
      const t = document.querySelector("[data-marketing-featured-media-target]");
      return {
        url: location.href,
        mediaReady: t?.getAttribute("data-marketing-media-ready") ?? null,
        autoplay: t?.getAttribute("data-marketing-autoplay-state") ?? null,
        overlay: document.querySelectorAll(".marketing-media-transition").length,
        active: document.documentElement.classList.contains("marketing-media-transition-active"),
      };
    });
    if (state.overlay > 0 || state.active) {
      failures.push({
        severity: "high",
        category: "interaction",
        route: state.url,
        failure: "Stuck overlay on director play load",
      });
    }
    if (test.posterOnly && state.mediaReady !== "poster" && state.mediaReady !== "unavailable") {
      failures.push({
        severity: "medium",
        category: "media",
        route: state.url,
        failure: `Expected poster-only state, got ${state.mediaReady}`,
      });
    }
  }
}

async function testContactLinks(page, baseUrl, failures) {
  await page.goto(`${baseUrl}/site/contact`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  const links = await page.$$eval("a[href]", (as) =>
    as.map((a) => ({
      href: a.getAttribute("href") ?? "",
      text: a.textContent?.replace(/\s+/g, " ").trim() ?? "",
    })),
  );
  for (const link of links) {
    if (!link.href || link.href === "#" || link.href.startsWith("javascript:void")) {
      failures.push({
        severity: "high",
        category: "links",
        route: "/site/contact",
        failure: `Bad href: ${link.href || "(empty)"} (${link.text})`,
      });
    }
  }
}

async function crawlLinks(page, baseUrl, networkEvents) {
  const visited = new Set();
  const toVisit = ["/site", "/site/work", "/site/directors", "/site/about", "/site/contact"];
  const broken = [];
  const checked = [];

  while (toVisit.length > 0 && visited.size < 80) {
    const route = toVisit.shift();
    if (!route || visited.has(route)) continue;
    visited.add(route);
    const url = `${baseUrl}${route}`;
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => null);
    const status = response?.status() ?? 0;
    checked.push({ route, status });
    if (status >= 400) broken.push({ route, status });

    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs) {
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      if (href.startsWith("http") && !href.includes("friendsandfamily.tv")) continue;
      const pathOnly = href.startsWith("http")
        ? new URL(href).pathname
        : href.split("#")[0];
      if (pathOnly.startsWith("/site") && !visited.has(pathOnly)) toVisit.push(pathOnly);
    }
  }

  return { pagesVisited: [...visited], internalLinksChecked: checked.length, brokenLinks: broken };
}

async function screenshotRoute(page, baseUrl, route, viewport, screenshotDir) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(`${baseUrl}${route}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  await page.waitForTimeout(350);
  const file = path.join(
    screenshotDir,
    `${viewport.id}__${slugifyRoute(route)}.png`,
  );
  await page.screenshot({ path: file, fullPage: false, timeout: 15000 });
  const layout = await measureLayout(page);
  const inventory = await collectRouteInventory(page, `${baseUrl}${route}`);
  return { route, viewport: viewport.id, screenshot: file, layout, inventory };
}

async function main() {
  const {
    baseUrl,
    headed,
    throttled,
    reducedMotion,
    skipScreenshots,
    skipLayout,
  } = parseArgs(process.argv.slice(2));
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const artifactRoot = path.join("test-results", "mobile-site-audit", timestamp);
  const dirs = ["screenshots", "videos", "traces", "logs", "summaries"];
  for (const d of dirs) await mkdir(path.join(artifactRoot, d), { recursive: true });

  const failures = [];
  const clickLog = [];
  const layoutMeasurements = [];
  const routeInventory = [];
  const consoleEvents = [];
  const networkEvents = [];
  const mediaChecks = [];
  const visualNotes = [];

  const browser = await chromium.launch({ headless: !headed });
  const contextOptions = {
    ...devices["iPhone 14"],
    locale: "en-US",
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  };
  if (throttled) {
    contextOptions.slowMo = 50;
  }
  const context = await browser.newContext(contextOptions);
  if (throttled) {
    await context.route("**/*", async (route) => {
      await new Promise((r) => setTimeout(r, 30));
      await route.continue();
    });
  }
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleEvents.push({ type: msg.type(), text: msg.text(), url: page.url() });
    }
  });
  page.on("requestfailed", (req) => {
    const failure = req.failure();
    networkEvents.push({
      url: req.url(),
      method: req.method(),
      failure: failure?.errorText ?? "failed",
      pageUrl: page.url(),
    });
  });
  page.on("response", (res) => {
    const status = res.status();
    if (status >= 400 && !res.url().includes("favicon")) {
      networkEvents.push({
        url: res.url(),
        status,
        pageUrl: page.url(),
      });
    }
  });

  const directors = await discoverDirectorLinks(page, baseUrl);
  const directorRoutes = directors.map((d) => `/site/directors/${d.slug}`);
  const layoutRoutes = STATIC_ROUTES;
  const screenshotRoutes = [...STATIC_ROUTES, ...directorRoutes];

  if (!skipLayout) {
  for (const viewport of VIEWPORTS) {
    for (const route of layoutRoutes) {
      try {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${baseUrl}${route}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
        await page.waitForTimeout(250);
        const layout = await measureLayout(page);
        const inventory = await collectRouteInventory(page, `${baseUrl}${route}`);
        layoutMeasurements.push({ route, viewport: viewport.id, layout });
        routeInventory.push({
          url: `${baseUrl}${route}`,
          viewport: viewport.id,
          ...inventory,
          ...layout,
        });
        if (layout.horizontalOverflowPx > OVERFLOW_TOLERANCE_PX) {
          failures.push({
            severity: "high",
            category: "layout",
            route,
            viewport: viewport.id,
            failure: `Horizontal overflow ${layout.horizontalOverflowPx}px`,
            element: layout.firstOverflowElement,
          });
        }
      } catch (err) {
        failures.push({
          severity: "high",
          category: "route",
          route,
          viewport: viewport.id,
          failure: String(err.message ?? err),
        });
      }
    }
  }
  }

  if (!skipScreenshots) {
  for (const viewport of VIEWPORTS) {
    for (const route of screenshotRoutes) {
      try {
        process.stderr.write(`screenshot ${viewport.id} ${route}\n`);
        const result = await screenshotRoute(
          page,
          baseUrl,
          route,
          viewport,
          path.join(artifactRoot, "screenshots"),
        );
        if (result.screenshot) {
          layoutMeasurements.push({
            route: result.route,
            viewport: result.viewport,
            screenshot: result.screenshot,
          });
        }
      } catch (err) {
        failures.push({
          severity: "medium",
          category: "screenshot",
          route,
          viewport: viewport.id,
          failure: String(err.message ?? err),
        });
      }
    }
  }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  const navViewports = VIEWPORTS.filter((v) =>
    ["320x568", "360x740", "375x667", "390x844", "414x896", "430x932"].includes(v.id),
  );
  const navResults = [];
  for (const vp of navViewports) {
    navResults.push(await testMobileNav(page, baseUrl, vp, clickLog, failures));
  }

  await testWorkFilters(page, baseUrl, clickLog, failures, mediaChecks);
  await testDirectors(page, baseUrl, directors, clickLog, failures, mediaChecks);
  await testTouchPreviews(page, baseUrl, failures, clickLog);
  await testDirectorPlayCases(page, baseUrl, failures, clickLog);
  await testContactLinks(page, baseUrl, failures);

  for (const metaRoute of ["/robots.txt", "/sitemap.xml", "/manifest.json"]) {
    const res = await page.goto(`${baseUrl}${metaRoute}`, { timeout: 30000 });
    routeInventory.push({
      url: `${baseUrl}${metaRoute}`,
      status: res?.status() ?? 0,
    });
  }

  const youthRes = await page.goto(`${baseUrl}/site/youth`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  const youthUrl = page.url();
  if (!youthUrl.includes("/site/youth")) {
    failures.push({
      severity: "high",
      category: "route",
      route: "/site/youth",
      failure: `Youth route popped to ${youthUrl}`,
    });
  }
  const youthLogo = await page.locator('a[aria-label="Friends & Family"]').first().isVisible();
  if (!youthLogo) {
    failures.push({
      severity: "medium",
      category: "layout",
      route: "/site/youth",
      failure: "FF logo not visible on Youth route after scroll",
    });
  }

  const linkCrawl = await crawlLinks(page, baseUrl, networkEvents);

  const criticalNetwork = networkEvents.filter(
    (e) => (e.status && e.status >= 500) || e.failure,
  );

  if (consoleEvents.length > 0) {
    visualNotes.push(`${consoleEvents.length} console errors captured — see mobile-console-events.json`);
  }

  const screenshotFiles = await readdir(path.join(artifactRoot, "screenshots"));

  const summary = {
    timestamp,
    baseUrl,
    routesChecked: layoutRoutes.length,
    viewportsChecked: VIEWPORTS.length,
    screenshotCount: screenshotFiles.length,
    failureCount: failures.length,
    consoleErrorCount: consoleEvents.length,
    criticalNetworkCount: criticalNetwork.length,
    pass: failures.filter((f) => f.severity === "high").length === 0,
  };

  await writeFile(
    path.join(artifactRoot, "mobile-route-inventory.json"),
    JSON.stringify(routeInventory, null, 2),
  );
  await writeFile(
    path.join(artifactRoot, "mobile-click-log.json"),
    JSON.stringify(clickLog, null, 2),
  );
  await writeFile(
    path.join(artifactRoot, "mobile-layout-measurements.json"),
    JSON.stringify(layoutMeasurements, null, 2),
  );
  await writeFile(
    path.join(artifactRoot, "mobile-console-events.json"),
    JSON.stringify(consoleEvents, null, 2),
  );
  await writeFile(
    path.join(artifactRoot, "mobile-network-events.json"),
    JSON.stringify(networkEvents, null, 2),
  );
  await writeFile(
    path.join(artifactRoot, "mobile-media-checks.json"),
    JSON.stringify(mediaChecks, null, 2),
  );
  await writeFile(
    path.join(artifactRoot, "mobile-failures.json"),
    JSON.stringify(failures, null, 2),
  );
  await writeFile(
    path.join(artifactRoot, "mobile-visual-notes.md"),
    `# Mobile visual notes\n\n${visualNotes.join("\n\n") || "No additional visual notes."}\n`,
  );
  await writeFile(
    path.join(artifactRoot, "summaries", "summary.json"),
    JSON.stringify({ ...summary, navResults, linkCrawl }, null, 2),
  );
  await writeFile(path.join(artifactRoot, "summary.json"), JSON.stringify(summary, null, 2));

  console.log(JSON.stringify(summary, null, 2));
  console.log(`Artifacts: ${artifactRoot}`);

  await browser.close();
  process.exit(summary.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
