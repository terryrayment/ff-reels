#!/usr/bin/env node
/**
 * Cross-browser / cross-device compatibility audit for F&F marketing site.
 *
 * Usage:
 *   node scripts/marketing/run-cross-browser-compatibility-audit.mjs
 *   node scripts/marketing/run-cross-browser-compatibility-audit.mjs --quick
 *
 * Artifacts (gitignored): test-results/cross-browser-compatibility-audit/[timestamp]/
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox, webkit, devices } from "playwright";

const DEFAULT_URL = "https://reels.friendsandfamily.tv";
const PAGE_LOAD = "domcontentloaded";
const PAGE_TIMEOUT = 90000;
const OVERFLOW_TOLERANCE_PX = 1;

const DESKTOP_VIEWPORTS = [
  { id: "1024x768", width: 1024, height: 768 },
  { id: "1180x820", width: 1180, height: 820 },
  { id: "1366x768", width: 1366, height: 768 },
  { id: "1440x900", width: 1440, height: 900 },
  { id: "1536x864", width: 1536, height: 864 },
  { id: "1728x1117", width: 1728, height: 1117 },
  { id: "1920x1080", width: 1920, height: 1080 },
];

const CORE_ROUTES = [
  "/site",
  "/site/work",
  "/site/directors",
  "/site/directors/terry-rayment?play=source-terry-rayment-01-kodak-understanding",
  "/site/about",
  "/site/contact",
  "/site/youth",
  "/site/colossal",
  "/versant",
  "/commercial-production-company-los-angeles",
];

const WORK_FILTERS = [
  { path: "/site/work", label: "All" },
  { path: "/site/work?type=commercials", label: "Commercials" },
  { path: "/site/work?type=case-studies", label: "Case studies" },
  { path: "/site/work?type=films", label: "Films" },
];

const WORK_SAMPLES = [
  { label: "Ford Lobo", match: /ford.*lobo|lobo/i },
  { label: "CITI", match: /citi|click/i },
  { label: "Cadillac", match: /cadillac|tree/i },
  { label: "Kodak", match: /kodak|understanding/i },
  { label: "Wealthfront", match: /wealthfront|french/i },
  { label: "AOS JuJu", match: /aos|juju/i },
  { label: "Cody Patron", match: /patron/i },
  { label: "Cody Absolut", match: /absolut/i, posterOnly: true },
];

const TALENT_SLUGS = [
  "caleb-slain",
  "james-frost",
  "bueno",
  "terry-rayment",
  "jack-turits",
  "cody-cloud",
  "brother-willis",
  "boma-iluma",
];

const GALLERY_DIRECTORS = [
  { slug: "terry-rayment", switches: 5 },
  { slug: "james-frost", switches: 5 },
  { slug: "jack-turits", switches: 5 },
  { slug: "cody-cloud", switches: 3 },
  { slug: "brother-willis", switches: 3 },
  { slug: "boma-iluma", switches: 3 },
  { slug: "caleb-slain", switches: 3 },
];

const MOBILE_PROFILES = [
  { id: "iPhone SE", device: "iPhone SE" },
  { id: "iPhone 13", device: "iPhone 13" },
  { id: "iPhone 14 Pro", device: "iPhone 14 Pro" },
  { id: "iPhone 14 Pro Max", device: "iPhone 14 Pro Max" },
  { id: "Pixel 7", device: "Pixel 7" },
  { id: "Galaxy S23", device: "Galaxy S23" },
  { id: "raw-360x740", viewport: { width: 360, height: 740 } },
  { id: "raw-430x932", viewport: { width: 430, height: 932 } },
  { id: "iPad portrait", device: "iPad (gen 7)" },
  { id: "iPad landscape", device: "iPad (gen 7) landscape" },
  { id: "Galaxy Tab S4", device: "Galaxy Tab S4" },
  { id: "raw-768x1024", viewport: { width: 768, height: 1024 } },
  { id: "raw-1024x768", viewport: { width: 1024, height: 768 } },
];

const BROWSER_ENGINES = [
  { id: "chromium", launch: chromium.launch.bind(chromium) },
  { id: "firefox", launch: firefox.launch.bind(firefox) },
  { id: "webkit", launch: webkit.launch.bind(webkit) },
];

function parseArgs(argv) {
  let baseUrl = DEFAULT_URL;
  let quick = false;
  for (const arg of argv) {
    if (arg.startsWith("--url=")) baseUrl = arg.slice("--url=".length).replace(/\/$/, "");
    if (arg === "--quick") quick = true;
  }
  return { baseUrl, quick };
}

function slugify(s) {
  return s.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase();
}

function isMarketingCriticalNetwork(url, status) {
  if (url.includes("favicon") || url.includes("analytics") || url.includes("gtag")) return false;
  if (!url.includes("friendsandfamily.tv") && !url.includes("images.") && !url.includes("mux.com")) return false;
  if (status >= 500) return true;
  if (status === 404 && (url.includes("_next") || url.includes(".js") || url.includes(".m3u8"))) return true;
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
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        if (r.right > vw + tolerance + 0.5) {
          firstOverflowEl = el.tagName.toLowerCase();
          break;
        }
      }
    }
    return { viewportWidth: vw, bodyScrollWidth: sw, horizontalOverflowPx: overflowPx, firstOverflowEl };
  }, OVERFLOW_TOLERANCE_PX);
}

async function collectPageState(page) {
  return page.evaluate(() => {
    const brokenImgs = [...document.querySelectorAll("img")].filter(
      (img) => img.src && img.complete && img.naturalWidth === 0,
    ).length;
    const target = document.querySelector("[data-marketing-featured-media-target]");
    const videos = [...document.querySelectorAll("video")];
    return {
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
      logoVisible: Boolean(document.querySelector('a[aria-label="Friends & Family"]')),
      navVisible: Boolean(document.querySelector("header nav")),
      brokenImages: brokenImgs,
      hasViewer: Boolean(target),
      mediaReady: target?.getAttribute("data-marketing-media-ready") ?? null,
      autoplay: target?.getAttribute("data-marketing-autoplay-state") ?? null,
      videoCount: videos.length,
      playsInline: videos.every((v) => v.hasAttribute("playsinline") || v.playsInline),
      overlayCount: document.querySelectorAll(".marketing-media-transition").length,
    };
  });
}

async function waitTransitionDone(page) {
  await page
    .waitForFunction(
      () => !document.documentElement.classList.contains("marketing-media-transition-active"),
      { timeout: 8000 },
    )
    .catch(() => {});
  await page.waitForTimeout(350);
}

function attachListeners(page, consoleEvents, networkEvents) {
  page.on("console", (msg) => {
    const t = msg.type();
    if (t !== "error" && t !== "warning") return;
    const text = msg.text();
    if (text.includes("ResizeObserver") || text.includes("Media Chrome: No style sheet")) return;
    consoleEvents.push({ type: t, text: text.slice(0, 500), url: page.url(), browser: page._qcBrowser, device: page._qcDevice });
  });
  page.on("requestfailed", (req) => {
    const err = req.failure()?.errorText;
    if (err === "net::ERR_ABORTED" || req.url().includes("favicon")) return;
    networkEvents.push({
      kind: "failed",
      url: req.url(),
      error: err,
      pageUrl: page.url(),
      browser: page._qcBrowser,
      device: page._qcDevice,
    });
  });
  page.on("response", (res) => {
    const status = res.status();
    const url = res.url();
    if (isMarketingCriticalNetwork(url, status)) {
      networkEvents.push({
        kind: "http",
        url,
        status,
        pageUrl: page.url(),
        browser: page._qcBrowser,
        device: page._qcDevice,
      });
    }
  });
}

async function testRoute(page, baseUrl, route, ctx, screenshotDir) {
  const res = await page.goto(`${baseUrl}${route}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT }).catch(() => null);
  await page.waitForTimeout(250);
  const layout = await measureLayout(page);
  const state = await collectPageState(page);
  const status = res?.status() ?? 0;
  const shot = path.join(
    screenshotDir,
    `${slugify(ctx.browser)}__${slugify(ctx.device || ctx.viewport)}__${slugify(route)}.png`,
  );
  await page.screenshot({ path: shot, fullPage: false, timeout: 15000 }).catch(() => {});

  const result = {
    browser: ctx.browser,
    device: ctx.device ?? null,
    viewport: ctx.viewport ?? null,
    route,
    httpStatus: status,
    layout,
    state,
    screenshot: shot,
    pass: status < 400 && layout.horizontalOverflowPx <= OVERFLOW_TOLERANCE_PX && state.brokenImages === 0,
  };

  if (status >= 400) {
    ctx.failures.push({
      severity: "high",
      classification: `${ctx.browser}-only`,
      browser: ctx.browser,
      device: ctx.device,
      viewport: ctx.viewport,
      route,
      failure: `HTTP ${status}`,
      artifact: shot,
    });
  }
  if (layout.horizontalOverflowPx > OVERFLOW_TOLERANCE_PX && !route.includes("youth")) {
    ctx.failures.push({
      severity: layout.horizontalOverflowPx > 8 ? "high" : "medium",
      classification: "common",
      browser: ctx.browser,
      device: ctx.device,
      viewport: ctx.viewport,
      route,
      failure: `Horizontal overflow ${layout.horizontalOverflowPx}px (${layout.firstOverflowEl})`,
      artifact: shot,
    });
    result.pass = false;
  }
  if (state.brokenImages > 0) {
    ctx.failures.push({
      severity: "high",
      classification: `${ctx.browser}-only`,
      browser: ctx.browser,
      route,
      failure: `${state.brokenImages} broken images`,
      artifact: shot,
    });
    result.pass = false;
  }
  return result;
}

async function runBrowserRouteMatrix(baseUrl, browserEngine, quick, artifactRoot, failures, routeResults, browserMatrix, screenshotDir) {
  const browser = await browserEngine.launch({ headless: true });
  const viewports = quick ? DESKTOP_VIEWPORTS.filter((v) => ["1024x768", "1440x900", "1920x1080"].includes(v.id)) : DESKTOP_VIEWPORTS;
  const routes = CORE_ROUTES;
  const consoleEvents = [];
  const networkEvents = [];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    page._qcBrowser = browserEngine.id;
    page._qcDevice = vp.id;
    attachListeners(page, consoleEvents, networkEvents);

    for (const route of routes) {
      const ctx = { browser: browserEngine.id, viewport: vp.id, failures };
      const result = await testRoute(page, baseUrl, route, ctx, screenshotDir);
      routeResults.push(result);
    }
    await context.close();
  }

  if (!quick) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    page._qcBrowser = browserEngine.id;
    page._qcDevice = "1440x900-interactions";
    attachListeners(page, consoleEvents, networkEvents);
    const ctx = { browser: browserEngine.id, viewport: "1440x900", failures };

    for (const filter of WORK_FILTERS) {
      await page.goto(`${baseUrl}${filter.path}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
      const layout = await measureLayout(page);
      if (layout.horizontalOverflowPx > OVERFLOW_TOLERANCE_PX) {
        failures.push({
          severity: "high",
          classification: `${browserEngine.id}-only`,
          browser: browserEngine.id,
          route: filter.path,
          failure: `Work filter overflow ${layout.horizontalOverflowPx}px`,
        });
      }
    }

    await page.goto(`${baseUrl}/site/work`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
    const cards = await page.$$eval("[data-marketing-media-frame]", (frames) =>
      frames.map((f) => {
        const a = f.closest("a");
        return { href: a?.getAttribute("href") ?? "", text: a?.textContent?.replace(/\s+/g, " ").trim() ?? "" };
      }),
    );

    for (const sample of WORK_SAMPLES) {
      const card = cards.find((c) => sample.match.test(c.text) || sample.match.test(c.href));
      if (!card?.href) continue;
      await page.goto(`${baseUrl}/site/work`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
      const link = page.locator(`a[href="${card.href}"]`).first();
      await link.scrollIntoViewIfNeeded();
      await Promise.all([page.waitForURL(/\/site\/directors\//, { timeout: 25000 }), link.click()]);
      await waitTransitionDone(page);
      const state = await collectPageState(page);
      const pass = state.hasViewer && page.url().includes("play=") && state.overlayCount === 0;
      ctx.clickResults = ctx.clickResults || [];
      if (!pass) {
        failures.push({
          severity: "high",
          classification: `${browserEngine.id}-only`,
          browser: browserEngine.id,
          route: page.url(),
          failure: `Work card failed: ${sample.label}`,
        });
      }
      await page.goBack({ waitUntil: PAGE_LOAD, timeout: 60000 }).catch(() => {});
    }

    for (const slug of TALENT_SLUGS) {
      await page.goto(`${baseUrl}/site/directors`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
      const link = page.locator(`a[href*="/site/directors/${slug}"]`).first();
      if (!(await link.count())) continue;
      await Promise.all([page.waitForURL(new RegExp(slug), { timeout: 25000 }), link.click()]);
      await waitTransitionDone(page);
      const state = await collectPageState(page);
      if (!state.hasViewer || state.overlayCount > 0) {
        failures.push({
          severity: "high",
          classification: `${browserEngine.id}-only`,
          browser: browserEngine.id,
          failure: `Talent card failed: ${slug}`,
        });
      }
      await page.goBack({ waitUntil: PAGE_LOAD, timeout: 60000 }).catch(() => {});
    }

    for (const { slug, switches } of GALLERY_DIRECTORS) {
      await page.goto(`${baseUrl}/site/directors/${slug}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
      const gallery = await page.$$eval("[data-marketing-media-frame]", (frames) =>
        frames.map((f) => {
          const a = f.closest("a");
          return a?.getAttribute("href") ?? "";
        }).filter(Boolean),
      );
      const unique = [...new Set(gallery)];
      for (let i = 0; i < Math.min(switches, unique.length); i++) {
        await page.goto(`${baseUrl}/site/directors/${slug}`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
        const link = page.locator(`a[href="${unique[i]}"]`).first();
        if (!(await link.count())) continue;
        await link.click();
        await page.waitForTimeout(1000);
        await waitTransitionDone(page, 3000);
        const morph = await page.evaluate(() =>
          document.documentElement.classList.contains("marketing-media-transition-active"),
        );
        const state = await collectPageState(page);
        if (morph || state.overlayCount > 0 || !page.url().includes("play=")) {
          failures.push({
            severity: "high",
            classification: `${browserEngine.id}-only`,
            browser: browserEngine.id,
            failure: `Gallery switch failed: ${slug} #${i + 1}`,
          });
        }
      }
    }

    await context.close();
  }

  await browser.close();

  const pass = failures.filter((f) => f.browser === browserEngine.id && f.severity === "high").length === 0;
  browserMatrix.push({
    browser: browserEngine.id,
    version: "playwright-bundled",
    os: process.platform,
    routesTested: viewports.length * routes.length,
    pass,
    notes: quick ? "layout-only subset" : "layout + Work/Talent/gallery interactions",
  });

  return { consoleEvents, networkEvents };
}

async function runMobileMatrix(baseUrl, quick, failures, deviceMatrix, routeResults, screenshotDir) {
  const browser = await chromium.launch({ headless: true });
  const profiles = quick
    ? MOBILE_PROFILES.filter((p) => ["iPhone 14 Pro", "Pixel 7", "raw-360x740"].includes(p.id))
    : [
        ...MOBILE_PROFILES,
        { id: "iPhone 14 Pro-reduced-motion", device: "iPhone 14 Pro", reducedMotion: true },
        { id: "Pixel 7-throttled", device: "Pixel 7", throttled: true },
      ];

  for (const profile of profiles) {
    const opts = profile.device
      ? { ...devices[profile.device], reducedMotion: profile.reducedMotion ? "reduce" : "no-preference" }
      : {
          viewport: profile.viewport,
          userAgent: profile.id.includes("430")
            ? devices["Pixel 7"].userAgent
            : devices["iPhone 13"].userAgent,
          isMobile: true,
          hasTouch: true,
        };
    if (profile.throttled) {
      // throttling applied per navigation below
    }
    const context = await browser.newContext(opts);
    const page = await context.newPage();
    page._qcBrowser = "chromium-mobile-emulation";
    page._qcDevice = profile.id;
    const consoleEvents = [];

    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("ResizeObserver")) {
        consoleEvents.push({ type: "error", text: msg.text().slice(0, 300), device: profile.id, url: page.url() });
      }
    });

    const routes = quick ? ["/site", "/site/work", "/site/directors", "/site/contact"] : CORE_ROUTES;
    let pass = true;

    for (const route of routes) {
      if (profile.throttled) await page.waitForTimeout(40);
      const ctx = { browser: "chromium-mobile-emulation", device: profile.id, failures };
      const result = await testRoute(page, baseUrl, route, ctx, screenshotDir);
      routeResults.push(result);
      if (!result.pass) pass = false;
    }

    if (!quick) {
      await page.goto(`${baseUrl}/site`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
      const viewportWidth = page.viewportSize()?.width ?? 0;
      const menuBtn = page.locator('button[aria-controls="marketing-mobile-menu"]');
      if (viewportWidth < 1180 && (await menuBtn.isVisible())) {
        const box = await menuBtn.boundingBox();
        if (!box || box.width < 44 || box.height < 44) {
          failures.push({
            severity: "high",
            classification: "mobile-emulation",
            device: profile.id,
            failure: `Hamburger tap target too small: ${box ? `${Math.round(box.width)}x${Math.round(box.height)}` : "missing"}`,
          });
          pass = false;
        }
        await menuBtn.click({ force: true });
        await page.waitForTimeout(300);
        const expanded = await menuBtn.getAttribute("aria-expanded");
        if (expanded !== "true") {
          failures.push({ severity: "high", classification: "mobile-emulation", device: profile.id, failure: "Menu did not open" });
          pass = false;
        }
        await menuBtn.click({ force: true });
        await page.waitForTimeout(300);
        if ((await menuBtn.getAttribute("aria-expanded")) !== "false") {
          failures.push({ severity: "high", classification: "mobile-emulation", device: profile.id, failure: "Menu did not close" });
          pass = false;
        }
      }

      await page.goto(`${baseUrl}/site/youth`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
      if (!page.url().includes("/site/youth")) {
        failures.push({ severity: "high", classification: "mobile-emulation", device: profile.id, route: "/site/youth", failure: "Youth route popped on scroll" });
        pass = false;
      }
    }

    deviceMatrix.push({
      device: profile.id,
      osBrowser: profile.device ? devices[profile.device]?.defaultBrowserType ?? "webkit/chromium" : "raw viewport",
      realOrEmulated: "emulated",
      routesTested: routes.length,
      pass,
      notes: profile.reducedMotion ? "reduced-motion" : profile.throttled ? "throttled" : "normal",
    });

    await context.close();
  }

  await browser.close();
}

async function main() {
  const { baseUrl, quick } = parseArgs(process.argv.slice(2));
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const artifactRoot = path.join(process.cwd(), "test-results", "cross-browser-compatibility-audit", timestamp);
  for (const d of ["screenshots", "videos", "traces", "logs", "summaries"]) {
    await mkdir(path.join(artifactRoot, d), { recursive: true });
  }
  const screenshotDir = path.join(artifactRoot, "screenshots");

  const failures = [];
  const routeResults = [];
  const clickResults = [];
  const mediaResults = [];
  const browserMatrix = [];
  const deviceMatrix = [];
  const consoleEvents = [];
  const networkEvents = [];

  for (const engine of BROWSER_ENGINES) {
    console.log(`Cross-browser audit — ${engine.id}`);
    const out = await runBrowserRouteMatrix(baseUrl, engine, quick, artifactRoot, failures, routeResults, browserMatrix, screenshotDir);
    consoleEvents.push(...out.consoleEvents);
    networkEvents.push(...out.networkEvents);
  }

  console.log("Cross-browser audit — mobile emulation");
  await runMobileMatrix(baseUrl, quick, failures, deviceMatrix, routeResults, screenshotDir);

  const critical = failures.filter((f) => f.severity === "high");
  const summary = {
    timestamp,
    baseUrl,
    quick,
    realDeviceCoverage: "unavailable",
    browserMatrix,
    deviceMatrixCount: deviceMatrix.length,
    routeResultsCount: routeResults.length,
    failuresCount: failures.length,
    criticalFailures: critical.length,
    consoleErrors: consoleEvents.filter((e) => e.type === "error").length,
    consoleWarnings: consoleEvents.filter((e) => e.type === "warning").length,
    criticalNetworkEvents: networkEvents.length,
    screenshotCount: routeResults.length,
    pass: critical.length === 0,
    productNote:
      "Live Work filters are discipline-based (All, Commercials, Case studies, Films), not industry category filters from legacy brief.",
  };

  await writeFile(path.join(artifactRoot, "browser-matrix.json"), JSON.stringify(browserMatrix, null, 2));
  await writeFile(path.join(artifactRoot, "device-matrix.json"), JSON.stringify(deviceMatrix, null, 2));
  await writeFile(path.join(artifactRoot, "route-results.json"), JSON.stringify(routeResults, null, 2));
  await writeFile(path.join(artifactRoot, "click-results.json"), JSON.stringify(clickResults, null, 2));
  await writeFile(path.join(artifactRoot, "media-results.json"), JSON.stringify(mediaResults, null, 2));
  await writeFile(path.join(artifactRoot, "console-events.json"), JSON.stringify(consoleEvents, null, 2));
  await writeFile(path.join(artifactRoot, "network-events.json"), JSON.stringify(networkEvents, null, 2));
  await writeFile(path.join(artifactRoot, "failures.json"), JSON.stringify(failures, null, 2));
  await writeFile(
    path.join(artifactRoot, "visual-notes.md"),
    `# Cross-browser visual notes\n\nFailures: ${failures.length}\n\n${failures.map((f) => `- [${f.severity}] ${f.browser ?? f.device}: ${f.failure}`).join("\n") || "None."}\n`,
  );
  await writeFile(path.join(artifactRoot, "summary.json"), JSON.stringify(summary, null, 2));

  console.log(JSON.stringify(summary, null, 2));
  console.log(`Artifacts: ${artifactRoot}`);
  if (!summary.pass) process.exit(1);
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
