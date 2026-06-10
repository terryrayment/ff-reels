import {
  CARD,
  CONTAINER,
  META_LABEL,
  META_TEXT,
  SECTION,
  SectionHeader,
  revealStagger,
} from "../../versant/sections/system";
import type { PitchCompanyConfig } from "@/lib/pitch/companies";

interface Props {
  noticed: PitchCompanyConfig["noticed"];
}

export function BrandNoticed({ noticed }: Props) {
  return (
    <section className={SECTION}>
      <div className={CONTAINER}>
        <SectionHeader
          label="What we noticed"
          title={noticed.title}
          intro={noticed.intro}
        />

        <div className="grid gap-3 md:grid-cols-3">
          {noticed.cards.map((card, index) => (
            <div
              key={card.label}
              className={`${CARD} p-5 sm:p-6`}
              style={revealStagger(index)}
            >
              <p className={`${META_LABEL} mb-3`}>{card.label}</p>
              <p className={`${META_TEXT} text-[15px] leading-[1.45]`}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
