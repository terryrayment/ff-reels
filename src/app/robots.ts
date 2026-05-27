import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/commercial-production-company-los-angeles"],
        disallow: [
          "/",
          "/login",
          "/forgot-password",
          "/set-password",
          "/dashboard",
          "/analytics",
          "/contacts",
          "/directors",
          "/industry",
          "/my-reels",
          "/my-stats",
          "/portfolio",
          "/reels",
          "/treatments",
          "/updates",
          "/upload",
          "/users",
          "/s/",
          "/preview/",
          "/api/",
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
