import type { ReactNode } from "react";

export type PropertyMotionType =
  | "golf-putt"
  | "golf-flag"
  | "tee-time-clock"
  | "trophy-glint"
  | "nascar-tire"
  | "soccer-pass"
  | "wrestling-ropes"
  | "golf-target-break"
  | "trick-shot"
  | "vertical-crop"
  | "basketball-bounce"
  | "volleyball-set"
  | "scoreboard-flip"
  | "college-pennant";

export type PropertyChipProps = {
  id?: string;
  label: string;
  shortLabel?: string;
  logo?: ReactNode;
  logoSrc?: string;
  logoAlt?: string;
  logoKey?: string;
  mark?: string;
  motionType?: PropertyMotionType;
  href?: string;
  ariaLabel?: string;
  category?: string;
  className?: string;
  monochrome?: boolean;
};

function PropertyMotionIcon({ type }: { type: PropertyMotionType }) {
  const common = {
    className: "versant-property-motion-icon",
    "data-motion-type": type,
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  } as const;

  switch (type) {
    case "golf-putt":
      return (
        <svg {...common}>
          <path className="motion-club" d="M7 5.5 11 16" />
          <path className="motion-ground" d="M6 18.5h12" />
          <circle className="motion-ball" cx="9" cy="18.5" r="1.4" />
          <path className="motion-target" d="M17.5 17.2v2.6" />
        </svg>
      );
    case "golf-flag":
      return (
        <svg {...common}>
          <path className="motion-pole" d="M10 5v14" />
          <path className="motion-flag" d="M10 5.3h7l-1.5 2.2L17 9.7h-7" />
          <path className="motion-ground" d="M7 19h10" />
          <circle className="motion-ball" cx="15.5" cy="18.8" r="1.1" />
        </svg>
      );
    case "tee-time-clock":
      return (
        <svg {...common}>
          <circle className="motion-clock" cx="12" cy="12" r="6.8" />
          <path className="motion-hand motion-hand-hour" d="M12 12V8.2" />
          <path className="motion-hand motion-hand-minute" d="M12 12h4.2" />
          <path className="motion-tee" d="M7 19h4m-2-3v3" />
        </svg>
      );
    case "trophy-glint":
      return (
        <svg {...common}>
          <path className="motion-trophy" d="M8 6h8v3.8c0 2.3-1.5 4.2-4 4.2s-4-1.9-4-4.2V6Z" />
          <path className="motion-trophy" d="M8 8H5.5c0 2.1 1.1 3.4 3.1 3.7M16 8h2.5c0 2.1-1.1 3.4-3.1 3.7M12 14v3M9.5 18.5h5" />
          <path className="motion-glint" d="M17.5 4.8 19 3.3M18.5 7h2.1M6 4.6 4.8 3.3" />
        </svg>
      );
    case "nascar-tire":
      return (
        <svg {...common}>
          <circle className="motion-tire" cx="12" cy="12" r="6.7" />
          <circle className="motion-hub" cx="12" cy="12" r="2.2" />
          <path className="motion-spokes" d="M12 5.5v13M5.5 12h13M7.4 7.4l9.2 9.2M16.6 7.4l-9.2 9.2" />
        </svg>
      );
    case "soccer-pass":
      return (
        <svg {...common}>
          <path className="motion-pass-line" d="M5.5 15.5c3.3-4.8 7.3-6.2 12.8-4.1" />
          <circle className="motion-ball" cx="7.2" cy="15.3" r="1.7" />
          <path className="motion-goal" d="M17 8.5h3v6" />
        </svg>
      );
    case "wrestling-ropes":
      return (
        <svg {...common}>
          <path className="motion-post" d="M6 6v12M18 6v12" />
          <path className="motion-rope motion-rope-top" d="M6 8h12" />
          <path className="motion-rope motion-rope-mid" d="M6 12h12" />
          <path className="motion-rope motion-rope-bottom" d="M6 16h12" />
        </svg>
      );
    case "golf-target-break":
      return (
        <svg {...common}>
          <circle className="motion-target-ring" cx="12" cy="12" r="6.5" />
          <circle className="motion-target-ring motion-target-ring-mid" cx="12" cy="12" r="3.4" />
          <circle className="motion-ball" cx="12" cy="12" r="1.2" />
          <path className="motion-break-line" d="M5 5.2 19 18.8" />
        </svg>
      );
    case "trick-shot":
      return (
        <svg {...common}>
          <path className="motion-arc" d="M5 17c4.3-8.2 9.1-8.2 14 0" />
          <circle className="motion-ball" cx="6" cy="16.7" r="1.3" />
          <path className="motion-cup" d="M17.5 16h3" />
        </svg>
      );
    case "vertical-crop":
      return (
        <svg {...common}>
          <rect className="motion-phone" x="8" y="4.5" width="8" height="15" rx="1.7" />
          <path className="motion-crop motion-crop-top" d="M10 8h4" />
          <path className="motion-crop motion-crop-bottom" d="M10 16h4" />
        </svg>
      );
    case "basketball-bounce":
      return (
        <svg {...common}>
          <circle className="motion-ball" cx="12" cy="10" r="4.6" />
          <path className="motion-ball-lines" d="M8.8 6.8c2.8 2 3.6 5.1 2.4 7.8M15.2 6.8c-2.8 2-3.6 5.1-2.4 7.8M7.6 10h8.8" />
          <path className="motion-ground" d="M7 18h10" />
        </svg>
      );
    case "volleyball-set":
      return (
        <svg {...common}>
          <circle className="motion-ball" cx="12" cy="9" r="3.9" />
          <path className="motion-ball-lines" d="M9.3 6.3c2.1 1.7 2.8 4 2 6M14.7 6.3c-2.1 1.7-2.8 4-2 6" />
          <path className="motion-hands" d="M7.8 17.5 10 14.8M16.2 17.5 14 14.8" />
        </svg>
      );
    case "scoreboard-flip":
      return (
        <svg {...common}>
          <rect className="motion-board" x="5" y="6.5" width="14" height="11" rx="1.6" />
          <path className="motion-flip motion-flip-left" d="M8 10h3.2v4H8z" />
          <path className="motion-flip motion-flip-right" d="M12.8 10H16v4h-3.2z" />
        </svg>
      );
    case "college-pennant":
      return (
        <svg {...common}>
          <path className="motion-pole" d="M7 5v14" />
          <path className="motion-pennant" d="M7 5.5 18.5 9.2 7 13V5.5Z" />
          <path className="motion-tail" d="M9.5 8.1h4.3" />
        </svg>
      );
  }
}

export function PropertyChip({
  label,
  shortLabel,
  logo,
  logoSrc,
  logoAlt,
  logoKey,
  mark,
  motionType,
  href,
  ariaLabel,
  className,
  monochrome = true,
}: PropertyChipProps) {
  const accessibleLabel = ariaLabel ?? logoAlt ?? label;
  const chipClassName = ["versant-property-chip", className]
    .filter(Boolean)
    .join(" ");
  const logoState = logoSrc || logo ? "asset" : mark ? "mark" : "text";
  const defaultVisual = logoSrc ? (
    <span className="versant-property-logo" aria-hidden="true">
      <img
        className="versant-property-logo-image"
        src={logoSrc}
        alt=""
        loading="lazy"
        decoding="async"
      />
    </span>
  ) : logo ? (
    <span className="versant-property-logo" aria-hidden="true">
      {logo}
    </span>
  ) : mark ? (
    <span className="versant-property-mark" aria-hidden="true">
      {mark}
    </span>
  ) : null;
  const content = (
    <>
      {(defaultVisual || motionType) && (
        <span
          className="versant-property-visual"
          aria-hidden="true"
          data-has-motion={motionType ? "true" : "false"}
        >
          {defaultVisual && (
            <span className="versant-property-default">
              {defaultVisual}
            </span>
          )}
          {motionType && <PropertyMotionIcon type={motionType} />}
        </span>
      )}
      <span className="versant-property-label">
        {shortLabel ?? label}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        className={chipClassName}
        href={href}
        aria-label={accessibleLabel}
        data-logo-key={logoKey}
        data-logo-state={logoState}
        data-motion-type={motionType}
        data-monochrome={monochrome ? "true" : "false"}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className={chipClassName}
      aria-label={accessibleLabel}
      data-logo-key={logoKey}
      data-logo-state={logoState}
      data-motion-type={motionType}
      data-monochrome={monochrome ? "true" : "false"}
    >
      {content}
    </span>
  );
}

export function PropertyChipGroup({
  properties,
  label,
  className,
}: {
  properties: readonly PropertyChipProps[];
  label: string;
  className?: string;
}) {
  return (
    <ul className={`versant-property-list ${className ?? ""}`} aria-label={label}>
      {properties.map((property) => (
        <li key={property.id ?? property.label}>
          <PropertyChip {...property} />
        </li>
      ))}
    </ul>
  );
}
