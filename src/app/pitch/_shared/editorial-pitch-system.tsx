import type { ReactNode } from "react";

export type EditorialPitchClasses = {
  section: string;
  surfaceGrain: string;
  container: string;
  header: string;
  kicker: string;
  title: string;
  intro: string;
  reveal: string;
  card: string;
  panel: string;
  media: string;
  metaLabel: string;
  metaText: string;
  link: string;
  tagList: string;
  tag: string;
  tagDark: string;
};

export function createEditorialPitchClasses(namespace: string): EditorialPitchClasses {
  return {
    section: `${namespace}-section`,
    surfaceGrain: `${namespace}-surface-grain`,
    container: `${namespace}-container`,
    header: `${namespace}-header`,
    kicker: `${namespace}-kicker`,
    title: `${namespace}-title`,
    intro: `${namespace}-intro`,
    reveal: `${namespace}-reveal`,
    card: `${namespace}-card ${namespace}-reveal`,
    panel: `${namespace}-panel`,
    media: `${namespace}-media`,
    metaLabel: `${namespace}-meta-label`,
    metaText: `${namespace}-meta-text`,
    link: `${namespace}-link`,
    tagList: `${namespace}-tag-list`,
    tag: `${namespace}-tag`,
    tagDark: `${namespace}-tag-dark`,
  };
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function revealStagger(index: number, stepMs = 50) {
  return { animationDelay: `${index * stepMs}ms` };
}

export function createEditorialPitchComponents(classes: EditorialPitchClasses) {
  function TagList({
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
      <ul className={cx(classes.tagList, className)} aria-label={label}>
        {tags.map((tag) => (
          <li key={tag} className={cx(classes.tag, dark && classes.tagDark)}>
            {tag}
          </li>
        ))}
      </ul>
    );
  }

  function SectionHeader({
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
      <div className={classes.header}>
        {label ? (
          <p className={cx(classes.kicker, dark ? "text-white/45" : "text-black/42")}>
            {label}
          </p>
        ) : null}
        <h2 className={cx(classes.title, dark ? "text-white" : "text-black")}>
          {title}
        </h2>
        {intro ? (
          <p className={cx(classes.intro, dark && "text-white/62")}>{intro}</p>
        ) : null}
      </div>
    );
  }

  return { SectionHeader, TagList };
}
