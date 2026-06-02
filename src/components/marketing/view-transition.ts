"use client";

const TRANSITION_UNTIL_KEY = "ff:marketing-transition-until";
const TRANSITION_POSTER_KEY = "ff:marketing-transition-poster";
const VIEWER_SCROLL_KEY = "ff:marketing-scroll-viewer";
const TRANSITION_DURATION_MS = 1320;
const TRANSITION_EASING = "cubic-bezier(0.76, 0, 0.24, 1)";
const SOURCE_MEDIA_READY_TIMEOUT_MS = 1800;
const MEDIA_TRANSITION_ACTIVE_CLASS = "marketing-media-transition-active";
const MEDIA_TRANSITION_OVERLAY_SELECTOR = ".marketing-media-transition";

let mediaTransitionInFlight = false;

export const MARKETING_TRANSITION_FINISHED =
  "ff:marketing-route-transition-finished";

type RouterLike = {
  push: (href: string) => void;
};

interface MarketingTransitionOptions {
  sourceElement?: HTMLElement | null;
  sourceNameElement?: HTMLElement | null;
  imageUrl?: string | null;
  directorName?: string | null;
  directorSlug?: string | null;
}

function isSamePathQueryNavigation(href: string) {
  try {
    const target = new URL(href, window.location.href);
    return (
      target.origin === window.location.origin &&
      target.pathname === window.location.pathname &&
      target.search !== window.location.search
    );
  } catch {
    return false;
  }
}

function getStorage() {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function getMarketingTransitionDelay() {
  const until = Number(getStorage()?.getItem(TRANSITION_UNTIL_KEY) ?? 0);
  if (!Number.isFinite(until)) return 0;
  return Math.min(Math.max(until - Date.now(), 0), TRANSITION_DURATION_MS);
}

export function clearMarketingTransitionDelay() {
  getStorage()?.removeItem(TRANSITION_UNTIL_KEY);
}

export function getMarketingTransitionPoster(fallback?: string | null) {
  return getStorage()?.getItem(TRANSITION_POSTER_KEY) ?? fallback ?? null;
}

export function clearMarketingTransitionPoster() {
  getStorage()?.removeItem(TRANSITION_POSTER_KEY);
}

export function requestMarketingViewerScroll() {
  getStorage()?.setItem(VIEWER_SCROLL_KEY, "1");
}

export function consumeMarketingViewerScroll() {
  const storage = getStorage();
  const shouldScroll = storage?.getItem(VIEWER_SCROLL_KEY) === "1";
  storage?.removeItem(VIEWER_SCROLL_KEY);
  return shouldScroll;
}

function getFeaturedReelTarget() {
  return document.querySelector<HTMLElement>(
    "[data-marketing-featured-media-target]",
  );
}

function isValidRect(rect: DOMRect) {
  return (
    Number.isFinite(rect.left) &&
    Number.isFinite(rect.top) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    rect.width > 0 &&
    rect.height > 0
  );
}

function isUsableTransitionRect(rect: DOMRect) {
  if (!isValidRect(rect)) return false;

  const maxDimension = Math.max(window.innerWidth, window.innerHeight) * 2;
  return (
    rect.width <= maxDimension &&
    rect.height <= maxDimension &&
    rect.left > -window.innerWidth &&
    rect.left < window.innerWidth * 2 &&
    rect.top >= 0 &&
    rect.top < window.innerHeight
  );
}

function isSourceMediaFrameReady(sourceElement: HTMLElement) {
  const rect = sourceElement.getBoundingClientRect();
  if (!isUsableTransitionRect(rect)) return false;

  const style = window.getComputedStyle(sourceElement);
  if (
    style.visibility === "hidden" ||
    style.display === "none" ||
    style.opacity === "0" ||
    style.clipPath.includes("100%")
  ) {
    return false;
  }

  const image = sourceElement.querySelector<HTMLImageElement>("img");
  if (!image) return true;

  const imageStyle = window.getComputedStyle(image);
  return (
    image.complete &&
    image.naturalWidth > 0 &&
    imageStyle.visibility !== "hidden" &&
    imageStyle.display !== "none" &&
    imageStyle.opacity !== "0"
  );
}

function waitForSourceMediaFrameReady(
  sourceElement: HTMLElement,
  timeoutMs = SOURCE_MEDIA_READY_TIMEOUT_MS,
) {
  const startedAt = performance.now();

  return new Promise<boolean>((resolve) => {
    const tick = () => {
      if (isSourceMediaFrameReady(sourceElement)) {
        resolve(true);
        return;
      }
      if (performance.now() - startedAt >= timeoutMs) {
        resolve(false);
        return;
      }
      window.requestAnimationFrame(tick);
    };

    tick();
  });
}

function isFeaturedReelTargetVisuallyReady(target: HTMLElement) {
  const poster = target.querySelector<HTMLImageElement>(
    "[data-marketing-poster-layer]",
  );
  const video = target.querySelector<HTMLVideoElement>("video");
  const mediaReady = target.getAttribute("data-marketing-media-ready");
  const autoplayState = target.getAttribute("data-marketing-autoplay-state");

  if (poster?.complete && poster.naturalWidth > 0) return true;
  if (
    mediaReady === "video" &&
    video &&
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    return true;
  }
  if (autoplayState === "unavailable") return true;
  return !poster && !video;
}

function waitForFeaturedReelTarget(timeoutMs = 900) {
  const startedAt = performance.now();

  return new Promise<DOMRect | null>((resolve) => {
    const tick = () => {
      const target = getFeaturedReelTarget();
      if (target) {
        const rect = target.getBoundingClientRect();
        if (
          isUsableTransitionRect(rect) &&
          (isFeaturedReelTargetVisuallyReady(target) ||
            performance.now() - startedAt >= timeoutMs)
        ) {
          resolve(rect);
          return;
        }
      }
      if (performance.now() - startedAt >= timeoutMs) {
        const target = getFeaturedReelTarget();
        const rect = target?.getBoundingClientRect();
        resolve(rect && isUsableTransitionRect(rect) ? rect : null);
        return;
      }
      window.requestAnimationFrame(tick);
    };

    tick();
  });
}

function finishMarketingMediaTransition() {
  document.documentElement.classList.remove(MEDIA_TRANSITION_ACTIVE_CLASS);
  document
    .querySelectorAll(MEDIA_TRANSITION_OVERLAY_SELECTOR)
    .forEach((overlay) => overlay.remove());
  mediaTransitionInFlight = false;
  window.dispatchEvent(new Event(MARKETING_TRANSITION_FINISHED));
}

function animateMediaFrame({
  sourceElement,
  imageUrl,
}: MarketingTransitionOptions) {
  if (!sourceElement || typeof document === "undefined") return false;

  const from = sourceElement.getBoundingClientRect();
  if (!isUsableTransitionRect(from)) return false;

  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.className = "marketing-media-transition";
  overlay.style.position = "fixed";
  overlay.style.left = `${from.left}px`;
  overlay.style.top = `${from.top}px`;
  overlay.style.width = `${from.width}px`;
  overlay.style.height = `${from.height}px`;
  overlay.style.zIndex = "2147483647";
  overlay.style.overflow = "hidden";
  overlay.style.background = "#050505";
  overlay.style.pointerEvents = "none";
  overlay.style.transformOrigin = "top left";

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "";
    image.decoding = "async";
    image.style.width = "100%";
    image.style.height = "100%";
    image.style.objectFit = "cover";
    image.style.display = "block";
    overlay.appendChild(image);
  }

  document.body.appendChild(overlay);

  const startedAt = performance.now();

  waitForFeaturedReelTarget()
    .then((targetRect) => {
      if (!targetRect) {
        return overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 180,
          easing: "ease-out",
          fill: "forwards",
        }).finished;
      }

      const to = targetRect;
      const remaining = Math.max(
        TRANSITION_DURATION_MS - (performance.now() - startedAt),
        760,
      );

      return overlay.animate(
        [
          { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
          {
            transform: `translate3d(${to.x - from.left}px, ${to.y - from.top}px, 0) scale(${to.width / from.width}, ${to.height / from.height})`,
            opacity: 1,
          },
        ],
        {
          duration: remaining,
          easing: TRANSITION_EASING,
          fill: "forwards",
        },
      ).finished;
    })
    .then(() => {
      finishMarketingMediaTransition();
      return overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 140,
        easing: "ease-out",
        fill: "forwards",
      }).finished;
    })
    .catch(() => {
      finishMarketingMediaTransition();
    })
    .finally(() => {
      overlay.remove();
      mediaTransitionInFlight = false;
    });

  return true;
}

function getDirectorNameTarget(slug: string) {
  return document.querySelector<HTMLElement>(
    `[data-marketing-director-name-target="${slug}"]`,
  );
}

function waitForDirectorNameTarget(slug: string, timeoutMs = 900) {
  const startedAt = performance.now();

  return new Promise<HTMLElement | null>((resolve) => {
    const tick = () => {
      const target = getDirectorNameTarget(slug);
      if (target) {
        resolve(target);
        return;
      }
      if (performance.now() - startedAt >= timeoutMs) {
        resolve(null);
        return;
      }
      window.requestAnimationFrame(tick);
    };

    tick();
  });
}

function animateDirectorName({
  sourceNameElement,
  directorName,
  directorSlug,
}: MarketingTransitionOptions) {
  if (
    !sourceNameElement ||
    !directorName ||
    !directorSlug ||
    typeof document === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return false;
  }

  const from = sourceNameElement.getBoundingClientRect();
  if (from.width <= 0 || from.height <= 0) return false;

  const sourceStyle = window.getComputedStyle(sourceNameElement);
  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.className = "marketing-director-name-transition";
  overlay.textContent = directorName;
  overlay.style.position = "fixed";
  overlay.style.left = `${from.left}px`;
  overlay.style.top = `${from.top}px`;
  overlay.style.width = `${from.width}px`;
  overlay.style.height = `${from.height}px`;
  overlay.style.zIndex = "2147483647";
  overlay.style.pointerEvents = "none";
  overlay.style.transformOrigin = "top left";
  overlay.style.fontFamily = sourceStyle.fontFamily;
  overlay.style.fontSize = sourceStyle.fontSize;
  overlay.style.fontWeight = sourceStyle.fontWeight;
  overlay.style.lineHeight = sourceStyle.lineHeight;
  overlay.style.letterSpacing = sourceStyle.letterSpacing;
  overlay.style.color = sourceStyle.color;
  overlay.style.willChange = "left, top, width, height, font-size, line-height";

  document.body.appendChild(overlay);

  const startedAt = performance.now();

  waitForDirectorNameTarget(directorSlug)
    .then((target) => {
      if (!target) {
        return overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 180,
          easing: "ease-out",
          fill: "forwards",
        }).finished;
      }

      const to = target.getBoundingClientRect();
      const targetStyle = window.getComputedStyle(target);
      const remaining = Math.max(
        TRANSITION_DURATION_MS - (performance.now() - startedAt),
        620,
      );

      return overlay
        .animate(
          [
            {
              left: `${from.left}px`,
              top: `${from.top}px`,
              width: `${from.width}px`,
              height: `${from.height}px`,
              fontSize: sourceStyle.fontSize,
              lineHeight: sourceStyle.lineHeight,
              letterSpacing: sourceStyle.letterSpacing,
              opacity: 1,
            },
            {
              left: `${to.left}px`,
              top: `${to.top}px`,
              width: `${to.width}px`,
              height: `${to.height}px`,
              fontSize: targetStyle.fontSize,
              lineHeight: targetStyle.lineHeight,
              letterSpacing: targetStyle.letterSpacing,
              opacity: 1,
            },
          ],
          {
            duration: remaining,
            easing: TRANSITION_EASING,
            fill: "forwards",
          },
        )
        .finished.then(
          () =>
            overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 120,
              easing: "ease-out",
              fill: "forwards",
            }).finished,
        );
    })
    .finally(() => overlay.remove())
    .catch(() => overlay.remove());

  return true;
}

export async function startMarketingViewTransition(
  router: RouterLike,
  href: string,
  options: MarketingTransitionOptions = {},
) {
  if (typeof window !== "undefined") {
    if (isSamePathQueryNavigation(href)) {
      finishMarketingMediaTransition();
      clearMarketingTransitionDelay();
      clearMarketingTransitionPoster();
      requestMarketingViewerScroll();
      router.push(href);
      return;
    }

    if (
      mediaTransitionInFlight ||
      document.documentElement.classList.contains(
        MEDIA_TRANSITION_ACTIVE_CLASS,
      ) ||
      document.querySelector(MEDIA_TRANSITION_OVERLAY_SELECTOR)
    ) {
      finishMarketingMediaTransition();
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearMarketingTransitionDelay();
      clearMarketingTransitionPoster();
      document.documentElement.classList.remove(MEDIA_TRANSITION_ACTIVE_CLASS);
      router.push(href);
      return;
    }

    const sourceReady = options.sourceElement
      ? await waitForSourceMediaFrameReady(options.sourceElement)
      : true;
    if (!sourceReady) {
      clearMarketingTransitionDelay();
      clearMarketingTransitionPoster();
      document.documentElement.classList.remove(MEDIA_TRANSITION_ACTIVE_CLASS);
      window.location.assign(href);
      return;
    }

    getStorage()?.setItem(
      TRANSITION_UNTIL_KEY,
      String(Date.now() + TRANSITION_DURATION_MS),
    );
    if (options.imageUrl) {
      getStorage()?.setItem(TRANSITION_POSTER_KEY, options.imageUrl);
    } else {
      clearMarketingTransitionPoster();
    }
    document.documentElement.classList.add(MEDIA_TRANSITION_ACTIVE_CLASS);
    const hasMediaOverlay = animateMediaFrame(options);
    const hasNameOverlay = animateDirectorName(options);
    mediaTransitionInFlight = hasMediaOverlay || hasNameOverlay;
    if (!hasMediaOverlay) {
      window.setTimeout(finishMarketingMediaTransition, TRANSITION_DURATION_MS);
    }
    if (hasMediaOverlay || hasNameOverlay) {
      router.push(href);
      return;
    }
  }

  if (
    typeof document === "undefined" ||
    typeof window === "undefined" ||
    typeof document.startViewTransition !== "function"
  ) {
    router.push(href);
    return;
  }

  document.documentElement.classList.add("marketing-view-transition");

  const transition = document.startViewTransition(() => {
    router.push(href);
  });

  transition.finished.finally(() => {
    document.documentElement.classList.remove("marketing-view-transition");
  });
}
