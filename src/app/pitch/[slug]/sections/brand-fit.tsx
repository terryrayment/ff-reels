import {
  CONTAINER,
  META_LABEL,
  META_TEXT,
  PANEL,
  REVEAL,
  SECTION,
  SectionHeader,
  TagList,
} from "../../versant/sections/system";
import type { PitchCompanyConfig } from "@/lib/pitch/companies";

interface Props {
  fit: PitchCompanyConfig["fit"];
}

export function BrandFit({ fit }: Props) {
  return (
    <section className={SECTION}>
      <div className={CONTAINER}>
        <div className={`${REVEAL} relative overflow-hidden rounded-[4px]`}>
          <div className={`${PANEL} relative z-10 overflow-hidden p-5 sm:p-7 lg:p-8`}>
            <SectionHeader
              label="How we would start"
              title={
                <>
                  <span className="font-light">{fit.titlePlain}</span>{" "}
                  <span className="text-[var(--pitch-accent)]">{fit.titleAccent}</span>
                </>
              }
              intro={fit.intro}
            />

            <div className="grid gap-3 border-t border-black/12 pt-5 md:grid-cols-4">
              {fit.gives.map(([label, value]) => (
                <div
                  key={label}
                  className="border-t border-black/10 pt-3 md:border-t-0 md:pt-0"
                >
                  <p className={`${META_LABEL} mb-2`}>{label}</p>
                  <p className={META_TEXT}>{value}</p>
                </div>
              ))}
            </div>

            <TagList tags={fit.tags} className="mt-7" label="Scope tags" />
          </div>
        </div>
      </div>
    </section>
  );
}
