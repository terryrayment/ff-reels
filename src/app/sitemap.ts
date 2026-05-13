import type { MetadataRoute } from "next";
import { absoluteAppUrl } from "@/lib/seo/site";

const INDEXABLE_ROUTES = [
  {
    path: "/commercial-production-company-los-angeles",
    changeFrequency: "weekly" as const,
    priority: 0.7,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return INDEXABLE_ROUTES.map((route) => ({
    url: absoluteAppUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
