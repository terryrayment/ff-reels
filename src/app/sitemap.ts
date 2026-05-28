import type { MetadataRoute } from "next";
import { getCanonicalDirectors } from "@/lib/marketing/canonical-source";
import { absoluteAppUrl } from "@/lib/seo/site";

const INDEXABLE_ROUTES = [
  {
    path: "/site",
    changeFrequency: "weekly" as const,
    priority: 1,
  },
  {
    path: "/site/work",
    changeFrequency: "weekly" as const,
    priority: 0.9,
  },
  {
    path: "/site/directors",
    changeFrequency: "weekly" as const,
    priority: 0.9,
  },
  {
    path: "/site/about",
    changeFrequency: "monthly" as const,
    priority: 0.7,
  },
  {
    path: "/site/contact",
    changeFrequency: "monthly" as const,
    priority: 0.7,
  },
  {
    path: "/commercial-production-company-los-angeles",
    changeFrequency: "weekly" as const,
    priority: 0.7,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...INDEXABLE_ROUTES.map((route) => ({
      url: absoluteAppUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...getCanonicalDirectors().map((director) => ({
      url: absoluteAppUrl(`/site/directors/${director.slug}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
