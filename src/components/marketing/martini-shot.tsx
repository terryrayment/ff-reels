"use client";

import { useEffect } from "react";

/**
 * The Martini Shot — type "MARTINI" anywhere on the marketing site and the
 * last setup of the day wraps: every visible element falls, tumbles, and
 * piles up at the bottom of the viewport. Refresh to strike the set.
 *
 * Film slang: the "martini shot" is the final shot before wrap.
 *
 * Implementation notes: the falling pieces are clones in a fixed overlay;
 * the real DOM is only hidden (visibility), so nothing here can interfere
 * with the card-to-viewer morph or any other locked transition behavior.
 * The egg refuses to arm while a morph is in flight.
 */

const MAGIC_WORD = "martini";
const MAX_PIECES = 60;
const GRAVITY = 2600; // px/s^2
const BOUNCE = 0.32;
const SETTLE_SPEED = 90; // px/s — below this on floor contact, the piece rests
const PILE_COLUMNS = 16;
const MAX_PILE_RATIO = 0.45;
const STACK_FACTOR = 0.45; // settled pieces overlap; the pile compresses

type Piece = {
  el: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  angle: number;
  va: number;
  delay: number;
  dropped: boolean;
  settled: boolean;
  bounced: boolean;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

function collectTargets(): HTMLElement[] {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(
      [
        "header a",
        "header button",
        "header p",
        "main a",
        "main button",
        "main h1",
        "main h2",
        "main h3",
        "main p",
        "main li",
        "main [data-marketing-media-frame]",
        "footer a",
        "footer p",
      ].join(", "),
    ),
  );

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const chosen: HTMLElement[] = [];

  for (const el of candidates) {
    if (chosen.some((kept) => kept.contains(el))) continue;
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw)
      continue;
    if (rect.width < 12 || rect.height < 12) continue;
    if (rect.width > vw * 0.92 || rect.height > vh * 0.75) continue;
    const style = getComputedStyle(el);
    if (
      style.visibility === "hidden" ||
      style.display === "none" ||
      parseFloat(style.opacity) < 0.05
    )
      continue;
    chosen.push(el);
    if (chosen.length >= MAX_PIECES) break;
  }
  return chosen;
}

function makeClone(el: HTMLElement, rect: DOMRect): HTMLElement {
  const clone = el.cloneNode(true) as HTMLElement;
  // Live media never survives cloning cleanly; the chrome around it falls instead.
  clone
    .querySelectorAll("video, iframe, mux-player, audio")
    .forEach((node) => node.remove());
  clone.style.position = "fixed";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.margin = "0";
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.boxSizing = "border-box";
  clone.style.pointerEvents = "none";
  clone.style.willChange = "transform";
  return clone;
}

function spawnDust(overlay: HTMLElement, x: number, y: number, width: number) {
  const size = Math.min(Math.max(width * 0.6, 36), 120);
  const dust = document.createElement("div");
  dust.style.cssText = [
    "position:fixed",
    `left:${x - size / 2}px`,
    `top:${y - size / 2}px`,
    `width:${size}px`,
    `height:${size}px`,
    "border-radius:9999px",
    "background:radial-gradient(circle, rgba(26,26,26,0.16), transparent 70%)",
    "pointer-events:none",
    "transition:transform 520ms ease-out, opacity 520ms ease-out",
    "opacity:0.7",
  ].join(";");
  overlay.appendChild(dust);
  requestAnimationFrame(() => {
    dust.style.transform = "scale(1.7)";
    dust.style.opacity = "0";
  });
  window.setTimeout(() => dust.remove(), 600);
}

function showWrapCard(overlay: HTMLElement) {
  const card = document.createElement("button");
  card.type = "button";
  card.setAttribute("aria-label", "That's a wrap — refresh to strike the set");
  card.style.cssText = [
    "position:fixed",
    "left:50%",
    "top:42%",
    "transform:translate(-50%,-50%) rotate(-2deg) scale(0.96)",
    "background:#111",
    "color:#F7F6F3",
    "padding:2.2rem 2.8rem",
    "text-align:center",
    "text-transform:uppercase",
    "cursor:pointer",
    "border:1px solid rgba(247,246,243,0.25)",
    "box-shadow:0 24px 80px rgba(0,0,0,0.45)",
    "opacity:0",
    "transition:opacity 700ms ease, transform 700ms ease",
    "font-family:var(--ff-font-display, inherit)",
    "z-index:1",
  ].join(";");
  card.innerHTML = [
    '<span style="display:block;font-size:clamp(2rem,6vw,4.5rem);font-weight:650;line-height:0.9;letter-spacing:0;">That&rsquo;s a wrap.</span>',
    '<span style="display:block;margin-top:1.1rem;font-size:clamp(0.7rem,1.6vw,0.9rem);letter-spacing:0.18em;opacity:0.75;">Call time tomorrow &mdash; 6:00 AM</span>',
    '<span style="display:block;margin-top:0.5rem;font-size:clamp(0.55rem,1.2vw,0.7rem);letter-spacing:0.18em;opacity:0.45;">refresh to strike the set</span>',
  ].join("");
  card.addEventListener("click", () => window.location.reload());
  overlay.appendChild(card);
  requestAnimationFrame(() => {
    card.style.opacity = "1";
    card.style.transform = "translate(-50%,-50%) rotate(-2deg) scale(1)";
  });
}

function runMartiniShot() {
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  const overlay = document.createElement("div");
  overlay.setAttribute("data-ff-martini", "true");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:90;pointer-events:none;";
  document.body.appendChild(overlay);

  const escListener = (event: KeyboardEvent) => {
    if (event.key === "Escape") window.location.reload();
  };
  window.addEventListener("keydown", escListener);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    overlay.style.pointerEvents = "auto";
    showWrapCard(overlay);
    return;
  }

  const targets = collectTargets();
  const heights = new Array<number>(PILE_COLUMNS).fill(0);
  const maxPile = vh * MAX_PILE_RATIO;
  const colWidth = vw / PILE_COLUMNS;

  const pieces: Piece[] = targets.map((el) => {
    const rect = el.getBoundingClientRect();
    const clone = makeClone(el, rect);
    overlay.appendChild(clone);
    el.style.visibility = "hidden";
    return {
      el: clone,
      x: rect.left,
      y: rect.top,
      w: rect.width,
      h: rect.height,
      vx: (Math.random() - 0.5) * 160,
      vy: 0,
      angle: 0,
      va: (Math.random() - 0.5) * 360,
      delay: Math.random() * 0.9,
      dropped: false,
      settled: false,
      bounced: false,
    };
  });

  document.documentElement.style.overflow = "hidden";

  const floorFor = (piece: Piece) => {
    const first = Math.max(0, Math.floor(piece.x / colWidth));
    const last = Math.min(
      PILE_COLUMNS - 1,
      Math.floor((piece.x + piece.w) / colWidth),
    );
    let pile = 0;
    for (let col = first; col <= last; col++) pile = Math.max(pile, heights[col]);
    return { floor: vh - pile, first, last };
  };

  let elapsed = 0;
  let last = performance.now();
  let wrapped = false;

  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;

    let allSettled = true;
    for (const piece of pieces) {
      if (piece.settled) continue;
      allSettled = false;
      if (!piece.dropped) {
        if (elapsed < piece.delay) continue;
        piece.dropped = true;
      }

      piece.vy += GRAVITY * dt;
      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.angle += piece.va * dt;

      if (piece.x < -piece.w * 0.4) piece.x = -piece.w * 0.4;
      if (piece.x > vw - piece.w * 0.6) piece.x = vw - piece.w * 0.6;

      const { floor, first, last: lastCol } = floorFor(piece);
      if (piece.y + piece.h >= floor) {
        piece.y = floor - piece.h;
        if (!piece.bounced) {
          piece.bounced = true;
          spawnDust(overlay, piece.x + piece.w / 2, floor, piece.w);
        }
        if (Math.abs(piece.vy) > SETTLE_SPEED) {
          piece.vy = -piece.vy * BOUNCE;
          piece.vx *= 0.6;
          piece.va *= 0.5;
        } else {
          piece.settled = true;
          for (let col = first; col <= lastCol; col++) {
            heights[col] = Math.min(maxPile, heights[col] + piece.h * STACK_FACTOR);
          }
        }
      }

      piece.el.style.transform = `translate(${piece.x}px, ${piece.y}px) rotate(${piece.angle}deg)`;
    }

    if ((allSettled && elapsed > 1.2) || elapsed > 6) {
      if (!wrapped) {
        wrapped = true;
        overlay.style.pointerEvents = "auto";
        showWrapCard(overlay);
      }
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function MartiniShot() {
  useEffect(() => {
    let buffer = "";
    let fired = false;

    const onKeyDown = (event: KeyboardEvent) => {
      if (fired) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.key.length !== 1) return;
      buffer = (buffer + event.key.toLowerCase()).slice(-MAGIC_WORD.length);
      if (buffer !== MAGIC_WORD) return;
      // Never arm mid-morph — the transition owns the viewport until it clears.
      if (
        document.documentElement.classList.contains(
          "marketing-media-transition-active",
        )
      )
        return;
      fired = true;
      runMartiniShot();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
