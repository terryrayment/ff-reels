#!/usr/bin/env node
/**
 * Clicks every Talent + Work thumbnail on the marketing site and verifies
 * thumbnail-to-viewer transitions. See docs/marketing/transitions/transition.md
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const DEFAULT_URL = "https://reels.friendsandfamily.tv";
const FINISH_TIMEOUT_MS = 6000;
const MID_SAMPLE_MS = 2500;

function parseArgs(argv) {
  let baseUrl = DEFAULT_URL;
  let headed = false;
  for (const arg of argv) {
    if (arg.startsWith("--url=")) baseUrl = arg.slice("--url=".length).replace(/\/$/, "");
    if (arg === "--headed") headed = true;
  }
  return { baseUrl, headed };
}

// Talent is a name list (frames only mount on hover); Work is a card grid.
// Collect from both shapes: anchors with a director slug, and visible media-frame cards.
const CARD_SOURCE_SELECTOR =
  "a[data-director-slug], [data-marketing-media-frame]";

// networkidle never settles when streaming media or analytics keep connections
// open; the document is loaded by then, so fall through to the selector waits.
async function gotoSettled(page, url) {
  await page
    .goto(url, { waitUntil: "networkidle", timeout: 60000 })
    .catch((error) => {
      if (error.name !== "TimeoutError") throw error;
    });
}

async function collectCardHrefs(page, baseUrl, listPath) {
  await gotoSettled(page, `${baseUrl}${listPath}`);
  await page.waitForSelector(CARD_SOURCE_SELECTOR, { timeout: 30000 });

  return page.$$eval(CARD_SOURCE_SELECTOR, (nodes) => {
    const seen = new Set();
    const out = [];
    for (const node of nodes) {
      const link = node.closest("a");
      if (!link?.href) continue;
      const url = new URL(link.href);
      if (!url.pathname.startsWith("/site/directors/")) continue;
      const key = url.pathname + url.search;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        href: link.getAttribute("href") ?? link.href,
        label: link.textContent?.replace(/\s+/g, " ").trim().slice(0, 80) ?? key,
      });
    }
    return out;
  });
}

async function sampleMidTransition(page) {
  const started = Date.now();
  while (Date.now() - started < MID_SAMPLE_MS) {
    const sample = await page.evaluate(() => {
      const active = document.documentElement.classList.contains(
        "marketing-media-transition-active",
      );
      if (!active) return null;
      const target = document.querySelector("[data-marketing-featured-media-target]");
      const overlay = document.querySelector(".marketing-media-transition");
      const targetStyle = target ? getComputedStyle(target) : null;
      return {
        scrollY: window.scrollY,
        overlayCount: document.querySelectorAll(".marketing-media-transition").length,
        hasOverlay: Boolean(overlay),
        targetVisibility: targetStyle?.visibility ?? null,
        targetOpacity: targetStyle?.opacity ?? null,
      };
    });
    if (sample) return sample;
    await page.waitForTimeout(50);
  }
  return null;
}

async function waitForTransitionFinish(page) {
  await page
    .waitForFunction(
      () =>
        !document.documentElement.classList.contains(
          "marketing-media-transition-active",
        ),
      { timeout: FINISH_TIMEOUT_MS },
    )
    .catch(() => {});
  await page.waitForTimeout(350);
}

async function readFinalState(page) {
  return page.evaluate(() => {
    const target = document.querySelector("[data-marketing-featured-media-target]");
    return {
      url: location.href,
      hasTarget: Boolean(target),
      mediaReady: target?.getAttribute("data-marketing-media-ready") ?? null,
      autoplay: target?.getAttribute("data-marketing-autoplay-state") ?? null,
      overlayLeft: document.querySelectorAll(".marketing-media-transition").length,
      activeClass: document.documentElement.classList.contains(
        "marketing-media-transition-active",
      ),
    };
  });
}

function evaluateResult({ expectedPath, mid, final }) {
  const reasons = [];

  if (!final.url.includes(expectedPath.split("?")[0])) {
    reasons.push(`wrong-url:${final.url}`);
  }

  if (!final.hasTarget) {
    reasons.push("missing-featured-target");
  }

  if (final.overlayLeft > 0) {
    reasons.push(`overlay-stuck:${final.overlayLeft}`);
  }

  if (final.activeClass) {
    reasons.push("active-class-stuck");
  }

  if (mid) {
    if (mid.overlayCount > 1) reasons.push(`overlay-count:${mid.overlayCount}`);
    if (mid.hasOverlay && mid.targetVisibility !== "hidden") {
      reasons.push(`double-frame:vis=${mid.targetVisibility}`);
    }
    if (mid.hasOverlay && mid.targetOpacity !== "0") {
      reasons.push(`double-frame:op=${mid.targetOpacity}`);
    }
  }

  const readyOk =
    final.mediaReady === "poster" ||
    final.mediaReady === "video" ||
    final.mediaReady === "unavailable";
  if (!readyOk) reasons.push(`media-ready:${final.mediaReady}`);

  const autoplayOk =
    final.autoplay === "playing" ||
    final.autoplay === "blocked" ||
    final.autoplay === "requested" ||
    final.autoplay === "unavailable";
  if (!autoplayOk) reasons.push(`autoplay:${final.autoplay}`);

  return { pass: reasons.length === 0, reasons };
}

async function testCard(page, baseUrl, listPath, card, index) {
  await gotoSettled(page, `${baseUrl}${listPath}`);
  await page.waitForSelector(`a[href="${card.href}"]`, { timeout: 30000 });

  const link = page.locator(`a[href="${card.href}"]`).first();
  await link.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);

  await Promise.all([
    page.waitForURL(/\/site\/directors\//, { timeout: 20000 }),
    link.click(),
  ]);

  const mid = await sampleMidTransition(page);
  await waitForTransitionFinish(page);
  const final = await readFinalState(page);
  const verdict = evaluateResult({ expectedPath: card.href, mid, final });

  return {
    index,
    page: listPath,
    label: card.label,
    href: card.href,
    mid,
    final,
    ...verdict,
  };
}

async function main() {
  const { baseUrl, headed } = parseArgs(process.argv.slice(2));
  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join("test-results", "transition-matrix-qc", runId);
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const suites = [
    { name: "talent", path: "/site/directors" },
    { name: "work", path: "/site/work" },
  ];

  const results = [];
  for (const suite of suites) {
    const cards = await collectCardHrefs(page, baseUrl, suite.path);
    for (let i = 0; i < cards.length; i++) {
      let result;
      try {
        result = await testCard(page, baseUrl, suite.path, cards[i], i + 1);
      } catch (error) {
        result = {
          index: i + 1,
          page: suite.path,
          label: cards[i].label,
          href: cards[i].href,
          pass: false,
          reasons: [`harness-error:${error.message?.split("\n")[0] ?? error}`],
        };
      }
      results.push({ suite: suite.name, ...result });
      const mark = result.pass ? "PASS" : "FAIL";
      console.log(`[${mark}] ${suite.name} ${i + 1}/${cards.length} ${result.label}`);
      if (!result.pass) console.log(`       ${result.reasons.join(", ")}`);
    }
  }

  await browser.close();

  const passed = results.filter((r) => r.pass).length;
  const summary = {
    runId,
    baseUrl,
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };

  await writeFile(
    path.join(outDir, "report.json"),
    JSON.stringify(summary, null, 2),
  );

  console.log("");
  console.log(`Matrix QA: ${passed}/${results.length} passed`);
  console.log(`Report: ${outDir}/report.json`);

  if (passed !== results.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
