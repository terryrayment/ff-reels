"use client";

import {
  CONTAINER,
  META_LABEL,
  META_TEXT,
  PANEL,
  REVEAL,
  SECTION,
  SectionHeader,
  TagList,
} from "./system";
import { VersantBackgroundMux } from "./versant-background-mux";

/** Callaway · Kyle :30 — distinct from Forefront used in TerryIntro. */
const CALLAWAY_SCOPE_PLAYBACK_ID =
  "bYcHyck9AcxSPDZSx4x4gRM2fDYN02D00Y9JLSLqpa6HU";
const CALLAWAY_SCOPE_POSTER = `https://image.mux.com/${CALLAWAY_SCOPE_PLAYBACK_ID}/thumbnail.webp?width=1920&time=8`;

const VERSANT_GIVES = [
  ["Brief", "Live schedules, archive, sponsor rules"],
  ["Production", "Talent windows, field teams, usage needs"],
  ["Deliverables", "Social cutdowns, motion, versions, delivery"],
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
    <section className={`${SECTION} versant-section-flush`}>
      <div className={CONTAINER}>
        <div className={`${REVEAL} relative overflow-hidden rounded-[4px]`}>
          <VersantBackgroundMux
            playbackId={CALLAWAY_SCOPE_PLAYBACK_ID}
            poster={CALLAWAY_SCOPE_POSTER}
            title="Callaway Kyle scope background"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(221,224,216,0.94)_0%,rgba(221,224,216,0.32)_24%,rgba(221,224,216,0.2)_54%,rgba(221,224,216,0.45)_78%,rgba(221,224,216,0.96)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(221,224,216,0.9)_0%,rgba(221,224,216,0.42)_32%,rgba(221,224,216,0.24)_64%,rgba(221,224,216,0.9)_100%)]"
          />

          <div
            className={`${PANEL} relative z-10 overflow-hidden bg-[rgba(251,247,237,0.72)] p-5 backdrop-blur-[2px] sm:p-7 lg:p-8`}
          >
            <SectionHeader
              label="Scope"
              title={
                <>
                  <span className="font-light">Start with Golf Channel.</span>{" "}
                  <span className="text-[#2447FF]">Build for USA Sports.</span>
                </>
              }
              intro="Golf gives the first assignment a clear shape. The same system can cover Premier League, NASCAR, WWE, WNBA, LOVB, and college."
            />

            <div className="grid gap-3 border-t border-black/12 pt-5 md:grid-cols-4">
              {VERSANT_GIVES.map(([label, value]) => (
                <div
                  key={label}
                  className="border-t border-black/10 pt-3 md:border-t-0 md:pt-0"
                >
                  <p className={`${META_LABEL} mb-2`}>{label}</p>
                  <p className={META_TEXT}>{value}</p>
                </div>
              ))}
            </div>

            <TagList tags={FIT_TAGS} className="mt-7" label="Scope tags" />
          </div>
        </div>
      </div>
    </section>
  );
}
