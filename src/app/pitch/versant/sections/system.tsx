import type { ReactNode } from "react";

export const SECTION = "versant-section";
export const CONTAINER = "versant-container";
export const HEADER = "versant-header";
export const KICKER = "versant-kicker";
export const TITLE = "versant-title";
export const INTRO = "versant-intro";
export const CARD = "versant-card";
export const PANEL = "versant-panel";
export const MEDIA = "versant-media";
export const META_LABEL = "versant-meta-label";
export const META_TEXT = "versant-meta-text";
export const LINK = "versant-link";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function TagList({
  tags,
  dark = false,
  className,
  label = "Metadata",
}: {
  tags: readonly string[];
  dark?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <ul className={cx("versant-tag-list", className)} aria-label={label}>
      {tags.map((tag) => (
        <li
          key={tag}
          className={cx("versant-tag", dark && "versant-tag-dark")}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

export function SectionHeader({
  label,
  title,
  intro,
  dark = false,
}: {
  label?: string;
  title: ReactNode;
  intro?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className={HEADER}>
      {label ? (
        <p className={cx(KICKER, dark ? "text-white/45" : "text-black/45")}>
          {label}
        </p>
      ) : null}
      <h2 className={cx(TITLE, dark ? "text-white" : "text-black")}>
        {title}
      </h2>
      {intro && (
        <p className={cx(INTRO, dark ? "text-white/62" : "text-black/62")}>
          {intro}
        </p>
      )}
    </div>
  );
}
