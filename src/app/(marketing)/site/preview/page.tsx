import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PreviewMobileBrowser,
  PreviewMobileBrowserFallback,
} from "@/components/marketing/preview-mobile-browser";

export const metadata: Metadata = {
  title: "Mobile preview browser",
  description:
    "Review Friends & Family marketing mockups and site routes in a mobile viewport.",
  robots: { index: false, follow: false },
};

export default function PreviewBrowserPage() {
  return (
    <Suspense fallback={<PreviewMobileBrowserFallback />}>
      <PreviewMobileBrowser />
    </Suspense>
  );
}
