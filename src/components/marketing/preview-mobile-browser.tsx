"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MARKETING_PREVIEW_ROUTES,
  resolvePreviewRouteHref,
  type MarketingPreviewRoute,
} from "@/lib/marketing/preview-routes";

const MOBILE_VIEWPORT = { width: 390, height: 844 } as const;

function groupRoutes(routes: readonly MarketingPreviewRoute[]) {
  const groups = new Map<string, MarketingPreviewRoute[]>();
  for (const route of routes) {
    const bucket = groups.get(route.group) ?? [];
    bucket.push(route);
    groups.set(route.group, bucket);
  }
  return groups;
}

export function PreviewMobileBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParam = searchParams.get("route");
  const activeHref = resolvePreviewRouteHref(routeParam);
  const activeRoute =
    MARKETING_PREVIEW_ROUTES.find((route) => route.href === activeHref) ??
    MARKETING_PREVIEW_ROUTES[0];

  const [desktopShell, setDesktopShell] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 960px)");
    const update = () => setDesktopShell(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const groupedRoutes = useMemo(
    () => groupRoutes(MARKETING_PREVIEW_ROUTES),
    [],
  );

  const activeIndex = MARKETING_PREVIEW_ROUTES.findIndex(
    (route) => route.href === activeHref,
  );

  const selectRoute = useCallback(
    (href: string) => {
      router.replace(`/site/preview?route=${encodeURIComponent(href)}`, {
        scroll: false,
      });
    },
    [router],
  );

  const goRelative = useCallback(
    (delta: number) => {
      const next =
        MARKETING_PREVIEW_ROUTES[
          (activeIndex + delta + MARKETING_PREVIEW_ROUTES.length) %
            MARKETING_PREVIEW_ROUTES.length
        ];
      if (next) selectRoute(next.href);
    },
    [activeIndex, selectRoute],
  );

  return (
    <div className="ff-preview-browser">
      <header className="ff-preview-browser__header">
        <div>
          <p className="ff-preview-browser__eyebrow">Mobile preview</p>
          <h1 className="ff-preview-browser__title">Preview browser</h1>
        </div>
        {desktopShell && (
          <p className="ff-preview-browser__meta">
            {MOBILE_VIEWPORT.width}×{MOBILE_VIEWPORT.height} · iPhone-class
            viewport
          </p>
        )}
      </header>

      <div className="ff-preview-browser__workspace">
        <aside className="ff-preview-browser__rail" aria-label="Preview routes">
          {Array.from(groupedRoutes.entries()).map(([group, routes]) => (
            <div key={group} className="ff-preview-browser__group">
              <p className="ff-preview-browser__group-label">{group}</p>
              <ul className="ff-preview-browser__list">
                {routes.map((route) => {
                  const active = route.href === activeHref;
                  return (
                    <li key={route.id}>
                      <button
                        type="button"
                        className={`ff-preview-browser__route${active ? " is-active" : ""}`}
                        aria-current={active ? "page" : undefined}
                        onClick={() => selectRoute(route.href)}
                      >
                        {route.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        <section className="ff-preview-browser__stage" aria-live="polite">
          {desktopShell ? (
            <>
              <div className="ff-preview-browser__toolbar">
                <div className="ff-preview-browser__toolbar-group">
                  <button
                    type="button"
                    className="ff-preview-browser__tool"
                    onClick={() => goRelative(-1)}
                    aria-label="Previous preview"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="ff-preview-browser__tool"
                    onClick={() => goRelative(1)}
                    aria-label="Next preview"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    className="ff-preview-browser__tool"
                    onClick={() => setIframeKey((value) => value + 1)}
                    aria-label="Reload preview"
                  >
                    Reload
                  </button>
                </div>
                <div className="ff-preview-browser__toolbar-group">
                  <span className="ff-preview-browser__current">
                    {activeRoute?.label}
                  </span>
                  <Link
                    href={activeHref}
                    className="ff-preview-browser__tool ff-preview-browser__tool--link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open tab
                  </Link>
                </div>
              </div>

              {activeRoute?.note && (
                <p className="ff-preview-browser__note">{activeRoute.note}</p>
              )}

              <div className="ff-preview-browser__device-wrap">
                <div
                  className="ff-preview-browser__device"
                  style={{
                    width: MOBILE_VIEWPORT.width,
                    height: MOBILE_VIEWPORT.height,
                  }}
                >
                  <div className="ff-preview-browser__device-notch" aria-hidden />
                  <iframe
                    key={`${activeHref}:${iframeKey}`}
                    title={activeRoute?.label ?? "Mobile preview"}
                    src={activeHref}
                    className="ff-preview-browser__iframe"
                    width={MOBILE_VIEWPORT.width}
                    height={MOBILE_VIEWPORT.height}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="ff-preview-browser__mobile-fallback">
              <p className="ff-preview-browser__note">
                On a phone, open each route directly. Start with{" "}
                <strong>{activeRoute?.label}</strong>.
              </p>
              {activeRoute?.note && (
                <p className="ff-preview-browser__note">{activeRoute.note}</p>
              )}
              <Link href={activeHref} className="ff-preview-browser__open-link">
                Open {activeRoute?.label}
              </Link>
              <ul className="ff-preview-browser__mobile-links">
                {MARKETING_PREVIEW_ROUTES.map((route) => (
                  <li key={route.id}>
                    <Link href={route.href}>{route.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function PreviewMobileBrowserFallback() {
  return (
    <div className="ff-preview-browser">
      <header className="ff-preview-browser__header">
        <p className="ff-preview-browser__eyebrow">Mobile preview</p>
        <h1 className="ff-preview-browser__title">Preview browser</h1>
      </header>
      <p className="ff-preview-browser__note ff-preview-browser__workspace">
        Loading preview routes…
      </p>
    </div>
  );
}
