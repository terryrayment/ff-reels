import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin routes that DIRECTOR users cannot access
const ADMIN_ROUTES = [
  "/dashboard",
  "/reels",
  "/analytics",
  "/contacts",
  "/leads",
  "/directors",
  "/treatments",
  "/industry",
  "/upload",
  "/users",
  "/updates",
];

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";

  // Subdomain rewrite: treatments.friendsandfamily.tv/{token} → /t/{token}
  if (host.startsWith("treatments.")) {
    const url = req.nextUrl.clone();
    if (url.pathname === "/" || url.pathname === "") {
      // Root of treatments subdomain has nothing to show — send to marketing site
      return NextResponse.redirect("https://www.friendsandfamily.tv");
    }
    // Only rewrite if not already prefixed (shouldn't happen, but safe)
    if (!url.pathname.startsWith("/t/") && !url.pathname.startsWith("/api/") && !url.pathname.startsWith("/_next/")) {
      url.pathname = `/t${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Pitch subdomains: versant.reels.friendsandfamily.tv → /pitch/versant
  // Add new pitch subdomains here as branded pitch experiences are built.
  const PITCH_SUBDOMAINS: Record<string, string> = {
    versant: "/pitch/versant",
  };
  for (const [subdomain, pitchPath] of Object.entries(PITCH_SUBDOMAINS)) {
    if (host.startsWith(`${subdomain}.`)) {
      const url = req.nextUrl.clone();
      // Root → pitch landing page (preserve query for ?t=<token> recipient personalization)
      if (url.pathname === "/" || url.pathname === "") {
        url.pathname = pitchPath;
        return NextResponse.rewrite(url);
      }
      // Other paths (e.g. /s/[token], /t/[token], /api/*, /_next/*) pass through unchanged
      // so the embedded reel viewer + treatment viewer keep working on the same subdomain.
      return NextResponse.next();
    }
  }

  // Main app routes: DIRECTOR role guard
  const token = await getToken({ req });

  // Not logged in — let NextAuth handle redirect
  if (!token) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // DIRECTOR users: redirect away from admin routes to /portfolio
  if (token.role === "DIRECTOR") {
    const isAdminRoute = ADMIN_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/portfolio", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match everything except Next.js internals + static files. The subdomain
  // rewrite needs to run on any path hitting treatments.* — can't use a
  // narrow allowlist. The DIRECTOR-role check below is scoped inside the
  // handler so non-admin routes short-circuit quickly.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|icon.png|apple-icon.png|robots.txt|sitemap.xml|pdf\\.worker\\.min\\.mjs).*)",
  ],
};
