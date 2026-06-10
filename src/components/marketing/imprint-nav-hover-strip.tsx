import Link from "next/link";
import type { PartnerId } from "@/components/marketing/partner-portal";

export type ImprintNavHoverItem = {
  label: string;
  href: string;
};

/** Capability-strip items for imprint nav hover preview (idea #2). */
export const IMPRINT_NAV_HOVER_ITEMS: Record<PartnerId, ImprintNavHoverItem[]> = {
  youth: [
    { label: "Directors", href: "/site/youth" },
    { label: "Production", href: "/site/youth" },
    { label: "Brazil", href: "/site/youth" },
  ],
  colossal: [{ label: "Animation", href: "/site/colossal" }],
};

type ImprintNavHoverStripProps = {
  partnerId: PartnerId;
  id?: string;
  variant?: "dropdown" | "drawer";
  onNavigate?: () => void;
};

export function ImprintNavHoverStrip({
  partnerId,
  id,
  variant = "dropdown",
  onNavigate,
}: ImprintNavHoverStripProps) {
  const items = IMPRINT_NAV_HOVER_ITEMS[partnerId];

  return (
    <div
      id={id}
      className={[
        "ff-imprint-nav-hover",
        variant === "drawer" ? "ff-imprint-nav-hover--drawer" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label={`${partnerId} capabilities`}
    >
      {items.map((item, index) => (
        <span
          key={item.label}
          className="ff-imprint-nav-hover__segment"
          style={{ ["--ff-imprint-stagger" as string]: `${index * 0.5}s` }}
        >
          {index > 0 && (
            <span className="ff-imprint-nav-hover__sep" aria-hidden="true">
              {" · "}
            </span>
          )}
          <Link
            href={item.href}
            prefetch={false}
            onClick={onNavigate}
            className="ff-imprint-nav-hover__link ff-focusable"
          >
            {item.label}
          </Link>
        </span>
      ))}
    </div>
  );
}
