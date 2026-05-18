"use client";

const TRANSITION_UNTIL_KEY = "ff:marketing-transition-until";
const TRANSITION_DURATION_MS = 1320;
const TRANSITION_EASING = "cubic-bezier(0.76, 0, 0.24, 1)";
const MEDIA_TRANSITION_ACTIVE_CLASS = "marketing-media-transition-active";

export const MARKETING_TRANSITION_FINISHED =
  "ff:marketing-route-transition-finished";

type RouterLike = {
  push: (href: string) => void;
};

interface MarketingTransitionOptions {
  sourceElement?: HTMLElement | null;
  imageUrl?: string | null;
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

function getFeaturedReelTargetRect() {
  const viewportWidth = window.innerWidth;
  const width =
    viewportWidth >= 768
      ? Math.min(viewportWidth * 0.64, 920)
      : viewportWidth - 48;
  const x = (viewportWidth - width) / 2;
  const y = viewportWidth >= 1024 ? 104 : 88;
  const height = width * (9 / 16);

  return { x, y, width, height };
}

function finishMarketingMediaTransition() {
  document.documentElement.classList.remove(MEDIA_TRANSITION_ACTIVE_CLASS);
  window.dispatchEvent(new Event(MARKETING_TRANSITION_FINISHED));
}

function animateMediaFrame({
  sourceElement,
  imageUrl,
}: MarketingTransitionOptions) {
  if (!sourceElement || typeof document === "undefined") return false;

  const from = sourceElement.getBoundingClientRect();
  if (from.width <= 0 || from.height <= 0) return false;

  const to = getFeaturedReelTargetRect();
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
  overlay.style.boxShadow = "0 30px 90px rgba(0,0,0,0.26)";

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

  const animation = overlay.animate(
    [
      { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
      {
        transform: `translate3d(${to.x - from.left}px, ${to.y - from.top}px, 0) scale(${to.width / from.width}, ${to.height / from.height})`,
        opacity: 1,
      },
    ],
    {
      duration: TRANSITION_DURATION_MS,
      easing: TRANSITION_EASING,
      fill: "forwards",
    },
  );

  animation.finished
    .then(() => {
      finishMarketingMediaTransition();
      return overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 140,
        easing: "ease-out",
        fill: "forwards",
      }).finished;
    })
    .finally(() => overlay.remove())
    .catch(() => overlay.remove());

  return true;
}

export function startMarketingViewTransition(
  router: RouterLike,
  href: string,
  options: MarketingTransitionOptions = {},
) {
  if (typeof window !== "undefined") {
    getStorage()?.setItem(
      TRANSITION_UNTIL_KEY,
      String(Date.now() + TRANSITION_DURATION_MS),
    );
    document.documentElement.classList.add(MEDIA_TRANSITION_ACTIVE_CLASS);
    const hasMediaOverlay = animateMediaFrame(options);
    if (!hasMediaOverlay) {
      window.setTimeout(finishMarketingMediaTransition, TRANSITION_DURATION_MS);
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
