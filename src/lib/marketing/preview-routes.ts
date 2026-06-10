export type MarketingPreviewRoute = {
  id: string;
  label: string;
  href: string;
  group: "Mockups" | "Site";
  note?: string;
};

export const MARKETING_PREVIEW_ROUTES: readonly MarketingPreviewRoute[] = [
  {
    id: "home-type",
    label: "Home · Type over video",
    href: "/site/home/preview",
    group: "Mockups",
  },
  {
    id: "home-solid",
    label: "Home · Solid brand field",
    href: "/site/home/preview-2",
    group: "Mockups",
  },
  {
    id: "home-split",
    label: "Home · Split hero",
    href: "/site/home/preview-3",
    group: "Mockups",
  },
  {
    id: "imprint-nav",
    label: "Nav · Imprint hovers",
    href: "/site/preview/imprint-nav",
    group: "Mockups",
    note: "Open mobile menu for Youth / Colossal drawer hovers.",
  },
  {
    id: "about-micro",
    label: "About · Photo trail",
    href: "/site/about/preview",
    group: "Mockups",
  },
  {
    id: "site-home",
    label: "Home (live splash)",
    href: "/site",
    group: "Site",
  },
  {
    id: "site-work",
    label: "Work",
    href: "/site/work",
    group: "Site",
  },
  {
    id: "site-directors",
    label: "Directors",
    href: "/site/directors",
    group: "Site",
  },
  {
    id: "site-about",
    label: "About",
    href: "/site/about",
    group: "Site",
  },
  {
    id: "site-contact",
    label: "Contact",
    href: "/site/contact",
    group: "Site",
  },
  {
    id: "site-youth",
    label: "The Youth Company",
    href: "/site/youth",
    group: "Site",
  },
  {
    id: "site-colossal",
    label: "Colossal",
    href: "/site/colossal",
    group: "Site",
  },
] as const;

export const DEFAULT_PREVIEW_ROUTE_HREF =
  MARKETING_PREVIEW_ROUTES[0]?.href ?? "/site/work";

export function findPreviewRoute(href: string | null | undefined) {
  if (!href) return null;
  return MARKETING_PREVIEW_ROUTES.find((route) => route.href === href) ?? null;
}

export function resolvePreviewRouteHref(
  candidate: string | null | undefined,
): string {
  if (!candidate) return DEFAULT_PREVIEW_ROUTE_HREF;
  const match = findPreviewRoute(candidate);
  return match?.href ?? DEFAULT_PREVIEW_ROUTE_HREF;
}
