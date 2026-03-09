import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin routes that DIRECTOR users cannot access
const ADMIN_ROUTES = [
  "/dashboard",
  "/reels",
  "/analytics",
  "/contacts",
  "/directors",
  "/treatments",
  "/industry",
  "/upload",
  "/users",
  "/updates",
];

export async function middleware(req: NextRequest) {
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
  matcher: [
    "/dashboard/:path*",
    "/reels/:path*",
    "/analytics/:path*",
    "/contacts/:path*",
    "/directors/:path*",
    "/treatments/:path*",
    "/industry/:path*",
    "/upload/:path*",
    "/users/:path*",
    "/updates/:path*",
  ],
};
