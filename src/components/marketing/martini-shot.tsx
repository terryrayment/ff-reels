"use client";

import { useEffect } from "react";

/**
 * The Martini Shot — type "MARTINI" anywhere on the marketing site and the
 * last setup of the day wraps: every visible element falls, tumbles, and
 * piles up at the bottom of the viewport under a clapperboard slate.
 * Escape or refresh strikes the set.
 *
 * Film slang: the "martini shot" is the final shot before wrap.
 *
 * Implementation notes: the falling pieces are clones in a fixed overlay;
 * the real DOM is only hidden (visibility), so nothing here can interfere
 * with the card-to-viewer morph or any other locked transition behavior.
 * The egg refuses to arm while a morph is in flight. Live <video> frames
 * are frozen onto canvases so playing previews fall as stills.
 */

const MAGIC_WORD = "martini";
const MAX_PIECES = 60;
const GRAVITY = 2600; // px/s^2
const BOUNCE = 0.32;
const SETTLE_SPEED = 90; // px/s — below this on floor contact, the piece rests
const PILE_COLUMNS = 16;
const MAX_PILE_RATIO = 0.45;
const STACK_FACTOR = 0.45; // settled pieces overlap; the pile compresses
const INK = "#141414";
const PAPER = "#F7F6F3";

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

/** Replace live videos in the clone with a frozen frame of the original. */
function freezeVideos(original: HTMLElement, clone: HTMLElement) {
  const sourceVideos = original.querySelectorAll("video");
  const cloneVideos = clone.querySelectorAll("video");
  cloneVideos.forEach((cloneVideo, i) => {
    const source = sourceVideos[i];
    const fillStyle =
      "width:100%;height:100%;object-fit:cover;display:block;";
    let replacement: HTMLElement | null = null;
    if (source && source.readyState >= 2 && source.videoWidth > 0) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = source.videoWidth;
        canvas.height = source.videoHeight;
        canvas.getContext("2d")?.drawImage(source, 0, 0);
        canvas.style.cssText = fillStyle;
        replacement = canvas;
      } catch {
        replacement = null;
      }
    }
    if (!replacement && source?.poster) {
      const img = document.createElement("img");
      img.src = source.poster;
      img.style.cssText = fillStyle;
      replacement = img;
    }
    if (replacement) cloneVideo.replaceWith(replacement);
    else cloneVideo.remove();
  });
}

function makeClone(el: HTMLElement, rect: DOMRect): HTMLElement {
  const clone = el.cloneNode(true) as HTMLElement;
  freezeVideos(el, clone);
  // Embedded documents and players never survive cloning; drop what's left.
  clone
    .querySelectorAll("iframe, mux-player, audio")
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
  // Park the clone exactly over the original before its drop cue arrives.
  clone.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
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

function nextTake(): string {
  let take = 1;
  try {
    take = (parseInt(window.localStorage.getItem("ff-martini-take") ?? "0", 10) || 0) + 1;
    window.localStorage.setItem("ff-martini-take", String(take));
  } catch {
    // private mode — every take is the first take
  }
  return String(Math.min(take, 99)).padStart(2, "0");
}

const STRIPES = `repeating-linear-gradient(-45deg, ${PAPER} 0 14px, ${INK} 14px 28px)`;

function slateField(label: string, value: string, grow = "1") {
  return [
    `<span style="display:flex;flex-direction:column;gap:0.3rem;flex:${grow};padding:0.7rem 0.9rem;border-right:1px solid rgba(247,246,243,0.14);min-width:0;">`,
    `<span style="font-size:0.5rem;letter-spacing:0.22em;opacity:0.45;">${label}</span>`,
    `<span style="font-size:0.78rem;font-weight:600;letter-spacing:0.1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${value}</span>`,
    "</span>",
  ].join("");
}

function showWrapCard(overlay: HTMLElement, animateClap: boolean) {
  const scene = (window.location.pathname.replace(/^\/site\/?/, "") || "one")
    .slice(0, 14)
    .toUpperCase();

  const card = document.createElement("button");
  card.type = "button";
  card.setAttribute("aria-label", "That's a wrap — refresh to strike the set");
  card.style.cssText = [
    "position:fixed",
    "left:50%",
    "top:40%",
    "transform:translate(-50%,-50%) rotate(-2deg) scale(0.96)",
    "width:min(34rem, 88vw)",
    `background:${INK}`,
    `color:${PAPER}`,
    "padding:0",
    "text-align:left",
    "text-transform:uppercase",
    "cursor:pointer",
    "border:1px solid rgba(247,246,243,0.22)",
    "border-radius:3px",
    "overflow:hidden",
    "box-shadow:0 32px 90px rgba(0,0,0,0.5)",
    "opacity:0",
    "transition:opacity 600ms ease, transform 600ms ease",
    "font-family:inherit",
    "z-index:1",
  ].join(";");

  card.innerHTML = [
    // Swinging clapper arm + fixed jaw
    `<span data-ff-clap style="display:block;height:1.5rem;background:${STRIPES};transform-origin:0% 100%;transform:rotate(${animateClap ? -22 : 0}deg);transition:transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1) 350ms;"></span>`,
    `<span style="display:block;height:1.5rem;background:${STRIPES};border-top:2px solid ${INK};"></span>`,
    // Slate fields
    '<span style="display:flex;border-bottom:1px solid rgba(247,246,243,0.14);">',
    slateField("Prod.", "Friends &amp; Family", "1.6"),
    slateField("Roll", "Martini"),
    "</span>",
    '<span style="display:flex;border-bottom:1px solid rgba(247,246,243,0.14);">',
    slateField("Scene", scene, "1.6"),
    slateField("Take", nextTake()),
    "</span>",
    // The wrap
    '<span style="display:block;padding:1.6rem 0.9rem 1.5rem;text-align:center;">',
    '<span style="display:block;font-family:var(--ff-font-display, inherit);font-size:clamp(1.9rem,5.2vw,3.4rem);font-weight:650;line-height:0.92;">That&rsquo;s a wrap.</span>',
    '<span style="display:block;margin-top:0.95rem;font-size:clamp(0.62rem,1.4vw,0.78rem);letter-spacing:0.2em;opacity:0.7;">Call time tomorrow &mdash; 6:00 AM</span>',
    '<span style="display:block;margin-top:0.45rem;font-size:clamp(0.5rem,1.1vw,0.62rem);letter-spacing:0.2em;opacity:0.4;">refresh to strike the set</span>',
    "</span>",
  ].join("");

  card.addEventListener("click", () => window.location.reload());
  overlay.appendChild(card);
  requestAnimationFrame(() => {
    card.style.opacity = "1";
    card.style.transform = "translate(-50%,-50%) rotate(-2deg) scale(1)";
    if (animateClap) {
      const clap = card.querySelector<HTMLElement>("[data-ff-clap]");
      if (clap) clap.style.transform = "rotate(0deg)";
    }
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
    showWrapCard(overlay, false);
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
      vx: (Math.random() - 0.5) * 220,
      vy: -Math.random() * 240, // a little knock upward as the set lets go
      angle: 0,
      va: (Math.random() - 0.5) * 360,
      delay: Math.random() * 0.9,
      dropped: false,
      settled: false,
      bounced: false,
    };
  });

  document.documentElement.style.overflow = "hidden";

  // Floor sampled under the middle of the piece so it can't perch on a
  // neighbor's pile column it barely overlaps.
  const floorFor = (piece: Piece) => {
    const first = Math.max(0, Math.floor((piece.x + piece.w * 0.25) / colWidth));
    const last = Math.min(
      PILE_COLUMNS - 1,
      Math.floor((piece.x + piece.w * 0.75) / colWidth),
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
      if (piece.vy > 0 && piece.y + piece.h >= floor) {
        // Snap small overshoots back to the pile surface; if the pile has
        // already risen well past this piece, rest where it is instead of
        // teleporting up onto the heap.
        const restY = floor - piece.h;
        const overshoot = piece.y - restY;
        piece.y =
          overshoot > Math.max(48, piece.h * 0.5)
            ? Math.min(piece.y, vh - piece.h)
            : restY;
        if (!piece.bounced) {
          piece.bounced = true;
          spawnDust(overlay, piece.x + piece.w / 2, piece.y + piece.h, piece.w);
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
        showWrapCard(overlay, true);
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
