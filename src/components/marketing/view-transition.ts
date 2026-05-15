"use client";

const TRANSITION_UNTIL_KEY = "ff:marketing-transition-until";
const TRANSITION_DURATION_MS = 900;

export const MARKETING_TRANSITION_FINISHED =
  "ff:marketing-route-transition-finished";

type RouterLike = {
  push: (href: string) => void;
};

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

export function startMarketingViewTransition(router: RouterLike, href: string) {
  if (
    typeof document === "undefined" ||
    typeof window === "undefined" ||
    typeof document.startViewTransition !== "function"
  ) {
    router.push(href);
    return;
  }

  document.documentElement.classList.add("marketing-view-transition");
  getStorage()?.setItem(
    TRANSITION_UNTIL_KEY,
    String(Date.now() + TRANSITION_DURATION_MS),
  );

  const transition = document.startViewTransition(() => {
    router.push(href);
  });

  transition.finished.finally(() => {
    document.documentElement.classList.remove("marketing-view-transition");
    window.dispatchEvent(new Event(MARKETING_TRANSITION_FINISHED));
  });
}
