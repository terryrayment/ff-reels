import {
  CARD,
  CONTAINER,
  revealStagger,
  META_LABEL,
  SECTION,
  SectionHeader,
} from "./system";
import { PropertyChipGroup } from "./property-chip";

const LOGO_ASSET_PATHS = {
  golfChannel: undefined,
  golfNow: undefined,
  golfPass: undefined,
  pgaTour: undefined,
  lpgaTour: undefined,
  usOpen: undefined,
  usWomensOpen: undefined,
  openChampionship: undefined,
  nascar: undefined,
  premierLeague: undefined,
  wwe: undefined,
  bigBreak: undefined,
  goodGood: undefined,
  wnba: undefined,
  lovb: undefined,
  atlantic10: undefined,
  pac12: undefined,
} satisfies Record<string, string | undefined>;

const PROPERTIES = {
  golfChannel: {
    id: "golf-channel",
    label: "Golf Channel",
    logoKey: "golf-channel",
    logoSrc: LOGO_ASSET_PATHS.golfChannel,
    mark: "GC",
    motionType: "golf-putt",
    category: "Golf",
  },
  golfNow: {
    id: "golf-now",
    label: "GolfNow",
    logoKey: "golf-now",
    logoSrc: LOGO_ASSET_PATHS.golfNow,
    mark: "NOW",
    motionType: "tee-time-clock",
    category: "Golf",
  },
  golfPass: {
    id: "golf-pass",
    label: "GolfPass",
    logoKey: "golf-pass",
    logoSrc: LOGO_ASSET_PATHS.golfPass,
    mark: "PASS",
    motionType: "golf-flag",
    category: "Golf",
  },
  pgaTour: {
    id: "pga-tour",
    label: "PGA Tour",
    logoKey: "pga-tour",
    logoSrc: LOGO_ASSET_PATHS.pgaTour,
    mark: "PGA",
    motionType: "golf-flag",
    category: "Golf",
  },
  lpgaTour: {
    id: "lpga-tour",
    label: "LPGA Tour",
    logoKey: "lpga-tour",
    logoSrc: LOGO_ASSET_PATHS.lpgaTour,
    mark: "LPGA",
    motionType: "golf-putt",
    category: "Golf",
  },
  usOpen: {
    id: "us-open",
    label: "U.S. Open",
    logoKey: "us-open",
    logoSrc: LOGO_ASSET_PATHS.usOpen,
    mark: "US",
    motionType: "trophy-glint",
    category: "Golf",
  },
  usWomensOpen: {
    id: "us-womens-open",
    label: "U.S. Women's Open",
    logoKey: "us-womens-open",
    logoSrc: LOGO_ASSET_PATHS.usWomensOpen,
    mark: "USW",
    motionType: "trophy-glint",
    category: "Golf",
  },
  openChampionship: {
    id: "the-open-championship",
    label: "The Open Championship",
    logoKey: "the-open-championship",
    logoSrc: LOGO_ASSET_PATHS.openChampionship,
    mark: "OPEN",
    motionType: "golf-flag",
    category: "Golf",
  },
  nascar: {
    id: "nascar",
    label: "NASCAR",
    logoKey: "nascar",
    logoSrc: LOGO_ASSET_PATHS.nascar,
    mark: "N",
    motionType: "nascar-tire",
    category: "Live sport",
  },
  premierLeague: {
    id: "premier-league",
    label: "Premier League",
    logoKey: "premier-league",
    logoSrc: LOGO_ASSET_PATHS.premierLeague,
    mark: "PL",
    motionType: "soccer-pass",
    category: "Live sport",
  },
  wwe: {
    id: "wwe",
    label: "WWE",
    logoKey: "wwe",
    logoSrc: LOGO_ASSET_PATHS.wwe,
    mark: "WWE",
    motionType: "wrestling-ropes",
    category: "Entertainment sport",
  },
  bigBreak: {
    id: "big-break",
    label: "Big Break",
    logoKey: "big-break",
    logoSrc: LOGO_ASSET_PATHS.bigBreak,
    mark: "BB",
    motionType: "golf-target-break",
    category: "Entertainment sport",
  },
  goodGood: {
    id: "good-good",
    label: "Good Good",
    logoKey: "good-good",
    logoSrc: LOGO_ASSET_PATHS.goodGood,
    mark: "GG",
    motionType: "trick-shot",
    category: "Entertainment sport",
  },
  wnba: {
    id: "wnba",
    label: "WNBA",
    logoKey: "wnba",
    logoSrc: LOGO_ASSET_PATHS.wnba,
    mark: "WNBA",
    motionType: "basketball-bounce",
    category: "Women and college",
  },
  lovb: {
    id: "lovb",
    label: "LOVB",
    logoKey: "lovb",
    logoSrc: LOGO_ASSET_PATHS.lovb,
    mark: "LOVB",
    motionType: "volleyball-set",
    category: "Women and college",
  },
  atlantic10: {
    id: "atlantic-10",
    label: "Atlantic 10",
    logoKey: "atlantic-10",
    logoSrc: LOGO_ASSET_PATHS.atlantic10,
    mark: "A10",
    motionType: "scoreboard-flip",
    category: "Women and college",
  },
  pac12: {
    id: "pac-12",
    label: "Pac-12",
    logoKey: "pac-12",
    logoSrc: LOGO_ASSET_PATHS.pac12,
    mark: "P12",
    motionType: "college-pennant",
    category: "Women and college",
  },
} as const;

const SPORTS_GROUPS = [
  {
    group: "Golf",
    note: "Golf Channel, GolfNow, GolfPass, tours, majors, and social cutdowns.",
    propertyIds: [
      "golfChannel",
      "golfNow",
      "golfPass",
      "pgaTour",
      "lpgaTour",
      "usOpen",
      "usWomensOpen",
      "openChampionship",
    ],
  },
  {
    group: "Live sport",
    note: "Fast-turn creative around rights windows and weekly viewing habits.",
    propertyIds: ["nascar", "premierLeague", "pgaTour", "usOpen"],
  },
  {
    group: "Entertainment sport",
    note: "Character, format, performance, and audience tone.",
    propertyIds: ["wwe", "bigBreak", "goodGood"],
  },
  {
    group: "Women and college",
    note: "League growth, athlete access, and local fan context.",
    propertyIds: ["wnba", "lovb", "lpgaTour", "usWomensOpen", "atlantic10", "pac12"],
  },
] as const;

export function UsaSportsPortfolio() {
  return (
    <section className={`${SECTION} versant-section-tight`}>
      <div className={CONTAINER}>
        <SectionHeader
          label="Sport"
          title={
            <span className="text-[#2447FF]">
              Selected properties. Different production problems.
            </span>
          }
          intro="Each property has its own production system."
        />

        <div className="versant-sport-index border-t border-[var(--versant-rule)]">
          <div className="hidden grid-cols-[11rem_minmax(0,0.85fr)_minmax(0,1.15fr)] gap-6 border-b border-[var(--versant-rule)] py-3 md:grid">
            <p className={META_LABEL}>Lane</p>
            <p className={META_LABEL}>Read</p>
            <p className={META_LABEL}>Properties</p>
          </div>
          {SPORTS_GROUPS.map((item, index) => (
            <article
              key={item.group}
              className={`${CARD} versant-sport-row grid gap-4 border-t-0 border-b border-[var(--versant-rule)] py-6 md:grid-cols-[11rem_minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-6 md:py-7`}
              style={revealStagger(index)}
            >
              <p className={`${META_LABEL} versant-sport-lane pt-1 text-[#2447FF]`}>
                {item.group}
              </p>
              <p className="versant-sport-read max-w-[34rem] text-[clamp(1.08rem,1.6vw,1.45rem)] leading-[1.16] tracking-[-0.035em] text-black/64">
                {item.note}
              </p>
              <PropertyChipGroup
                properties={item.propertyIds.map((id) => PROPERTIES[id])}
                className="versant-sport-tags max-w-[42rem] pt-1"
                label={`${item.group} properties`}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
