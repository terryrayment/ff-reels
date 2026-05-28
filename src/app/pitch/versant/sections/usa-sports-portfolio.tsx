import {
  CARD,
  CONTAINER,
  META_LABEL,
  META_TEXT,
  SECTION,
  SectionHeader,
  TagList,
} from "./system";

const SPORTS_GROUPS = [
  {
    group: "Golf",
    note: "Golf Channel, GolfNow, GolfPass, tours, majors, and social cutdowns.",
    tags: [
      "Golf Channel",
      "GolfNow",
      "GolfPass",
      "PGA Tour",
      "LPGA Tour",
      "U.S. Open",
      "U.S. Women's Open",
      "The Open Championship",
    ],
  },
  {
    group: "Live sport",
    note: "Fast-turn creative around rights windows and weekly viewing habits.",
    tags: ["NASCAR", "Premier League", "PGA Tour", "U.S. Open"],
  },
  {
    group: "Entertainment sport",
    note: "Character, format, performance, and audience tone.",
    tags: ["WWE", "Big Break", "Good Good", "Social cutdowns"],
  },
  {
    group: "Women and college",
    note: "League growth, athlete access, and local fan context.",
    tags: ["WNBA", "LOVB", "LPGA Tour", "U.S. Women's Open", "Atlantic 10", "Pac-12"],
  },
] as const;

export function UsaSportsPortfolio() {
  return (
    <section className={`${SECTION} versant-section-tight`}>
      <div className={CONTAINER}>
        <SectionHeader
          label="Sport"
          title="Selected Versant sports properties."
          intro="The work changes by property. The production system should stay legible."
        />

        <div className="grid gap-3 md:grid-cols-2">
          {SPORTS_GROUPS.map((item) => (
            <article key={item.group} className={`${CARD} p-5`}>
              <div className="mb-8 grid gap-4 sm:grid-cols-[0.34fr_1fr]">
                <p className={META_LABEL}>{item.group}</p>
                <p className={META_TEXT}>{item.note}</p>
              </div>
              <TagList tags={item.tags} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
