import {
  CONTAINER,
  META_LABEL,
  META_TEXT,
  PANEL,
  SECTION,
  SectionHeader,
  TagList,
} from "./system";

const VERSANT_GIVES = [
  ["Inputs", "Live schedules, archive, sponsor rules"],
  ["Production", "Talent windows, field teams, usage needs"],
  ["Output", "Social cutdowns, motion, versions, delivery"],
  ["Audience", "Fans who know when the tone is wrong"],
];

const FIT_TAGS = [
  "Golf Channel",
  "GolfNow",
  "Live windows",
  "Talent",
  "Sponsor rules",
  "Edit",
  "Motion",
  "Delivery",
];

export function VersantFit() {
  return (
    <section className={`${SECTION} versant-section-tight`}>
      <div className={CONTAINER}>
        <div className={`${PANEL} p-5 sm:p-7 lg:p-8`}>
          <SectionHeader
            label="Scope"
            title="Start with Golf Channel. Build for USA Sports."
            intro="Golf gives the first assignment a clear shape. The same system can cover Premier League, NASCAR, WWE, WNBA, LOVB, and college."
          />

          <div className="grid gap-3 border-t border-black/12 pt-5 md:grid-cols-4">
            {VERSANT_GIVES.map(([label, value]) => (
              <div key={label} className="border-t border-black/10 pt-3 md:border-t-0 md:pt-0">
                <p className={`${META_LABEL} mb-2`}>{label}</p>
                <p className={META_TEXT}>{value}</p>
              </div>
            ))}
          </div>

          <TagList tags={FIT_TAGS} className="mt-8" label="Scope metadata" />
        </div>
      </div>
    </section>
  );
}
