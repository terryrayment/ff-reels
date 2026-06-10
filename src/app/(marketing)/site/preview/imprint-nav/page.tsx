import type { Metadata } from "next";
import Link from "next/link";
import { HomeSplash } from "@/components/marketing/home-splash";

export const metadata: Metadata = {
  title: "Nav · Imprint hover preview",
  description:
    "Preview of capability-strip hover popups for The Youth and Colossal nav links.",
  robots: { index: false, follow: false },
};

export default function ImprintNavHoverPreviewPage() {
  return (
    <>
      <p className="sr-only">
        Preview: hover The Youth or Colossal in the navigation to see capability
        strip popups.
      </p>
      <HomeSplash />
      <div className="ff-imprint-nav-preview-note ff-shell">
        <p className="ff-copy-small text-ff-muted">
          Preview — open the mobile menu and tap{" "}
          <Link href="/site/youth" className="ff-text-link">
            The Youth Company
          </Link>{" "}
          or{" "}
          <Link href="/site/colossal" className="ff-text-link">
            Colossal
          </Link>{" "}
          to see capability strips (390px+ uses drawer; desktop nav at 1180px+).
        </p>
      </div>
    </>
  );
}
