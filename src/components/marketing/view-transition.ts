"use client";

const TRANSITION_UNTIL_KEY = "ff:marketing-transition-until";
const TRANSITION_POSTER_KEY = "ff:marketing-transition-poster";
const VIEWER_SCROLL_KEY = "ff:marketing-scroll-viewer";
const GALLERY_PLAY_DEFER_KEY = "ff:marketing-gallery-play-defer";
const GALLERY_SCROLL_MS = 680;
const GALLERY_SCROLL_TOP_GAP_PX = 16;
const TRANSITION_DURATION_MS = 1320;
const TRANSITION_EASING = "cubic-bezier(0.76, 0, 0.24, 1)";
const SOURCE_MEDIA_READY_TIMEOUT_MS = 1800;
const DESTINATION_TARGET_TIMEOUT_MS = 1500;
const DESTINATION_HANDOFF_TIMEOUT_MS = 1400;
const MEDIA_TRANSITION_ACTIVE_CLASS = "marketing-media-transition-active";
const MEDIA_TRANSITION_OVERLAY_SELECTOR = ".marketing-media-transition";
const NAME_TRANSITION_OVERLAY_SELECTOR = ".marketing-director-name-transition";
const NAME_MORPH_MAX_WIDTH_RATIO = 2.4;
const NAME_MORPH_MAX_TRAVEL_RATIO = 0.55;

let mediaTransitionInFlight = false;

export const MARKETING_TRANSITION_FINISHED =
  "ff:marketing-route-transition-finished";

export const MARKETING_VIEWER_SCROLL_FINISHED =
  "ff:marketing-viewer-scroll-finished";

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

export function requestMarketingGalleryPlayDefer() {
  getStorage()?.setItem(GALLERY_PLAY_DEFER_KEY, "1");
}

export function consumeMarketingViewerScroll() {
  const storage = getStorage();
  const shouldScroll = storage?.getItem(VIEWER_SCROLL_KEY) === "1";
  storage?.removeItem(VIEWER_SCROLL_KEY);
  return shouldScroll;
}

export function consumeMarketingGalleryPlayDefer() {
  const storage = getStorage();
  const defer = storage?.getItem(GALLERY_PLAY_DEFER_KEY) === "1";
  storage?.removeItem(GALLERY_PLAY_DEFER_KEY);
  return defer;
}

export function isSameDirectorPlayNavigation(href: string) {
  return isSamePathQueryNavigation(href);
}

function marketingNavHeightPx() {
  if (typeof window === "undefined") return 88;
  return window.innerWidth >= 1024 ? 104 : 88;
}

function marketingPrefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function resolveFeaturedViewerSection(section?: HTMLElement | null) {
  return (
    section ??
    document
      .querySelector<HTMLElement>("[data-marketing-featured-media-target]")
      ?.closest("section") ??
    null
  );
}

/** Scroll target: frame the viewer just below the fixed nav. */
function getMarketingFeaturedViewerScrollTop(section: HTMLElement) {
  const navHeight = marketingNavHeightPx();
  const rect = section.getBoundingClientRect();
  return Math.max(
    window.scrollY + rect.top - navHeight - GALLERY_SCROLL_TOP_GAP_PX,
    0,
  );
}

/** Easy-ease scroll up to frame the featured viewer (director gallery switches). */
export function animateMarketingFeaturedViewerScroll(
  section?: HTMLElement | null,
): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);

  const target = resolveFeaturedViewerSection(section);
  if (!target) return Promise.resolve(false);

  const endY = getMarketingFeaturedViewerScrollTop(target);
  const startY = window.scrollY;

  if (Math.abs(endY - startY) < 2 || marketingPrefersReducedMotion()) {
    window.scrollTo({ top: endY, behavior: "auto" });
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / GALLERY_SCROLL_MS, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + (endY - startY) * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve(true);
      }
    };

    requestAnimationFrame(tick);
  });
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

function isIntersectingViewport(rect: DOMRect, minVisibleRatio = 0.2) {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
  if (visibleWidth <= 0 || visibleHeight <= 0) return false;
  const visibleArea = visibleWidth * visibleHeight;
  const totalArea = rect.width * rect.height;
  if (totalArea <= 0) return false;
  return visibleArea / totalArea >= minVisibleRatio;
}

function isUsableSourceTransitionRect(rect: DOMRect) {
  if (!isValidRect(rect)) return false;

  const maxDimension = Math.max(window.innerWidth, window.innerHeight) * 2;
  return (
    rect.width <= maxDimension &&
    rect.height <= maxDimension &&
    rect.left > -window.innerWidth &&
    rect.left < window.innerWidth * 2 &&
    rect.bottom > 0 &&
    rect.top < window.innerHeight + rect.height * 0.35 &&
    isIntersectingViewport(rect, 0.15)
  );
}

function isUsableDestinationTransitionRect(rect: DOMRect) {
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

function isUsableTransitionRect(rect: DOMRect) {
  return isUsableDestinationTransitionRect(rect);
}

function isVisibleElement(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  return (
    style.visibility !== "hidden" &&
    style.display !== "none" &&
    Number(style.opacity) > 0.05
  );
}

function isUsableNameSourceRect(rect: DOMRect) {
  if (!isUsableSourceTransitionRect(rect)) return false;
  return rect.width >= 24 && rect.height >= 12;
}

function isUsableNameDestinationRect(rect: DOMRect) {
  if (!isUsableDestinationTransitionRect(rect)) return false;
  return (
    rect.width >= 24 &&
    rect.height >= 12 &&
    rect.top >= 0 &&
    rect.top < window.innerHeight * 0.65 &&
    rect.left >= -8 &&
    rect.left < window.innerWidth
  );
}

function isSafeNameMorphPath(from: DOMRect, to: DOMRect) {
  const widthRatio = to.width / from.width;
  const heightRatio = to.height / Math.max(from.height, 1);
  const travelX = Math.abs(to.left - from.left);
  const travelY = Math.abs(to.top - from.top);
  const maxTravel = Math.max(window.innerWidth, window.innerHeight) * NAME_MORPH_MAX_TRAVEL_RATIO;

  return (
    widthRatio >= 1 / NAME_MORPH_MAX_WIDTH_RATIO &&
    widthRatio <= NAME_MORPH_MAX_WIDTH_RATIO &&
    heightRatio >= 1 / NAME_MORPH_MAX_WIDTH_RATIO &&
    heightRatio <= NAME_MORPH_MAX_WIDTH_RATIO &&
    travelX <= maxTravel &&
    travelY <= maxTravel
  );
}

function removeNameTransitionOverlays() {
  document.querySelectorAll(NAME_TRANSITION_OVERLAY_SELECTOR).forEach((node) => {
    node.remove();
  });
}

function isSourceMediaFrameReady(sourceElement: HTMLElement) {
  const rect = sourceElement.getBoundingClientRect();
  if (!isUsableSourceTransitionRect(rect)) return false;

  const style = window.getComputedStyle(sourceElement);
  if (
    style.visibility === "hidden" ||
    style.display === "none" ||
    Number(style.opacity) === 0
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
    imageStyle.display !== "none"
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

function isDestinationHandoffReady(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  if (!isUsableTransitionRect(rect)) return false;

  const mediaReady = target.getAttribute("data-marketing-media-ready");
  if (
    mediaReady === "poster" ||
    mediaReady === "video" ||
    mediaReady === "unavailable"
  ) {
    return true;
  }

  const poster = target.querySelector<HTMLImageElement>(
    "[data-marketing-poster-layer]",
  );
  if (!poster) return true;
  return poster.complete && poster.naturalWidth > 0;
}

function waitForDestinationHandoff(timeoutMs = DESTINATION_HANDOFF_TIMEOUT_MS) {
  const startedAt = performance.now();

  return new Promise<void>((resolve) => {
    const tick = () => {
      const target = getFeaturedReelTarget();
      if (target && isDestinationHandoffReady(target)) {
        resolve();
        return;
      }
      if (performance.now() - startedAt >= timeoutMs) {
        resolve();
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

function waitForFeaturedReelTarget(timeoutMs = DESTINATION_TARGET_TIMEOUT_MS) {
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

function finishMarketingMediaTransition(options?: { keepOverlays?: boolean }) {
  document.documentElement.classList.remove(MEDIA_TRANSITION_ACTIVE_CLASS);
  if (!options?.keepOverlays) {
    document
      .querySelectorAll(MEDIA_TRANSITION_OVERLAY_SELECTOR)
      .forEach((node) => node.remove());
  }
  removeNameTransitionOverlays();
  mediaTransitionInFlight = false;
  window.dispatchEvent(new Event(MARKETING_TRANSITION_FINISHED));
}

function applyOverlayFrame(
  overlay: HTMLDivElement,
  rect: DOMRect,
) {
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
}

function freezeRect(rect: DOMRect) {
  return new DOMRect(rect.x, rect.y, rect.width, rect.height);
}

function animateMediaFrame({
  sourceElement,
  imageUrl,
}: MarketingTransitionOptions) {
  if (!sourceElement || typeof document === "undefined") return false;

  if (document.querySelectorAll(MEDIA_TRANSITION_OVERLAY_SELECTOR).length > 0) {
    return false;
  }

  const initialFrom = freezeRect(sourceElement.getBoundingClientRect());
  if (!isUsableSourceTransitionRect(initialFrom)) return false;

  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.className = "marketing-media-transition";
  overlay.style.position = "fixed";
  applyOverlayFrame(overlay, initialFrom);
  overlay.style.zIndex = "2147483647";
  overlay.style.overflow = "hidden";
  overlay.style.background = "#050505";
  overlay.style.pointerEvents = "none";
  overlay.style.transformOrigin = "top left";
  overlay.style.opacity = "0";

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

  const from = initialFrom;

  waitForFeaturedReelTarget()
    .then(async (targetRect) => {
      if (!targetRect || !isUsableSourceTransitionRect(from)) {
        return overlay.animate([{ opacity: 0 }, { opacity: 0 }], {
          duration: 1,
          fill: "forwards",
        }).finished;
      }

      await waitForDestinationHandoff();

      const remeasuredTarget = getFeaturedReelTarget()?.getBoundingClientRect();
      const toRect =
        remeasuredTarget && isUsableDestinationTransitionRect(remeasuredTarget)
          ? freezeRect(remeasuredTarget)
          : freezeRect(targetRect);
      if (!isUsableDestinationTransitionRect(toRect)) {
        return overlay.animate([{ opacity: 0 }, { opacity: 0 }], {
          duration: 1,
          fill: "forwards",
        }).finished;
      }

      applyOverlayFrame(overlay, from);
      overlay.style.opacity = "1";

      getStorage()?.setItem(
        TRANSITION_UNTIL_KEY,
        String(Date.now() + TRANSITION_DURATION_MS),
      );

      return overlay.animate(
        [
          { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
          {
            transform: `translate3d(${toRect.x - from.left}px, ${toRect.y - from.top}px, 0) scale(${toRect.width / from.width}, ${toRect.height / from.height})`,
            opacity: 1,
          },
        ],
        {
          duration: TRANSITION_DURATION_MS,
          easing: TRANSITION_EASING,
          fill: "forwards",
        },
      ).finished;
    })
    .then(() => {
      finishMarketingMediaTransition({ keepOverlays: true });
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
      if (target && isNameTargetReady(target)) {
        resolve(target);
        return;
      }
      if (performance.now() - startedAt >= timeoutMs) {
        resolve(null);
      } else {
        window.requestAnimationFrame(tick);
      }
    };

    tick();
  });
}

function isNameTargetReady(target: HTMLElement) {
  if (!isVisibleElement(target)) return false;
  const rect = target.getBoundingClientRect();
  return isUsableNameDestinationRect(rect);
}

function createDirectorNameOverlay(
  sourceNameElement: HTMLElement,
  directorName: string,
) {
  const from = sourceNameElement.getBoundingClientRect();
  if (!isUsableNameSourceRect(from)) return null;

  const sourceStyle = window.getComputedStyle(sourceNameElement);
  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.className = "marketing-director-name-transition";
  overlay.textContent = directorName;
  overlay.style.position = "fixed";
  overlay.style.left = `${from.left}px`;
  overlay.style.top = `${from.top}px`;
  overlay.style.width = `${from.width}px`;
  overlay.style.minHeight = `${from.height}px`;
  overlay.style.height = "auto";
  overlay.style.overflow = "hidden";
  overlay.style.zIndex = "2147483647";
  overlay.style.pointerEvents = "none";
  overlay.style.transformOrigin = "top left";
  overlay.style.fontFamily = sourceStyle.fontFamily;
  overlay.style.fontSize = sourceStyle.fontSize;
  overlay.style.fontWeight = sourceStyle.fontWeight;
  overlay.style.lineHeight = sourceStyle.lineHeight;
  overlay.style.letterSpacing = sourceStyle.letterSpacing;
  overlay.style.color = sourceStyle.color;
  overlay.style.willChange = "transform, opacity";
  document.body.appendChild(overlay);
  return { overlay, from, sourceStyle };
}

function fadeDirectorNameOverlay(overlay: HTMLDivElement, durationMs = 260) {
  return overlay
    .animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: durationMs,
      easing: "ease-out",
      fill: "forwards",
    })
    .finished.finally(() => overlay.remove())
    .catch(() => overlay.remove());
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

  if (document.querySelectorAll(NAME_TRANSITION_OVERLAY_SELECTOR).length > 0) {
    removeNameTransitionOverlays();
  }

  const created = createDirectorNameOverlay(sourceNameElement, directorName);
  if (!created) return false;

  const { overlay, from } = created;
  const startedAt = performance.now();

  waitForDirectorNameTarget(directorSlug)
    .then((target) => {
      if (!target) {
        return fadeDirectorNameOverlay(overlay);
      }

      const to = target.getBoundingClientRect();
      if (
        !isUsableNameDestinationRect(to) ||
        !isSafeNameMorphPath(from, to)
      ) {
        return fadeDirectorNameOverlay(overlay);
      }

      const remaining = Math.max(
        TRANSITION_DURATION_MS - (performance.now() - startedAt),
        620,
      );
      const dx = to.left - from.left;
      const dy = to.top - from.top;
      const scaleX = to.width / from.width;
      const scaleY = to.height / Math.max(from.height, 1);

      return overlay
        .animate(
          [
            {
              transform: "translate3d(0, 0, 0) scale(1, 1)",
              opacity: 1,
            },
            {
              transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scaleX}, ${scaleY})`,
              opacity: 1,
            },
          ],
          {
            duration: remaining,
            easing: TRANSITION_EASING,
            fill: "forwards",
          },
        )
        .finished.then(() =>
          overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 140,
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
      requestMarketingGalleryPlayDefer();
      router.push(href);
      return;
    }

    if (
      mediaTransitionInFlight ||
      document.documentElement.classList.contains(
        MEDIA_TRANSITION_ACTIVE_CLASS,
      ) ||
      document.querySelector(MEDIA_TRANSITION_OVERLAY_SELECTOR) ||
      document.querySelector(NAME_TRANSITION_OVERLAY_SELECTOR)
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
      if (options.imageUrl) {
        getStorage()?.setItem(TRANSITION_POSTER_KEY, options.imageUrl);
      } else {
        clearMarketingTransitionPoster();
      }
      document.documentElement.classList.remove(MEDIA_TRANSITION_ACTIVE_CLASS);
      router.push(href);
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

    if (options.imageUrl) {
      getStorage()?.setItem(TRANSITION_POSTER_KEY, options.imageUrl);
    }
    router.push(href);
    return;
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
