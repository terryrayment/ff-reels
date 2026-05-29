"use client";

import MuxPlayer from "@mux/mux-player-react";
import type { CSSProperties } from "react";
import {
  CONTAINER,
  META_LABEL,
  META_TEXT,
  PANEL,
  SECTION,
  SectionHeader,
  TagList,
} from "./system";

/** Callaway · Kyle :30 — distinct from Forefront used in TerryIntro. */
const CALLAWAY_SCOPE_PLAYBACK_ID =
  "bYcHyck9AcxSPDZSx4x4gRM2fDYN02D00Y9JLSLqpa6HU";
const CALLAWAY_SCOPE_POSTER = `https://image.mux.com/${CALLAWAY_SCOPE_PLAYBACK_ID}/thumbnail.webp?width=1920&time=8`;

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
    <section className={`${SECTION} versant-section-flush`}>
      <div className={CONTAINER}>
        <div className="relative overflow-hidden rounded-[4px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-72 [&_mux-player]:h-full [&_mux-player]:w-full"
            style={
              {
                "--controls": "none",
                "--media-object-fit": "cover",
              } as CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CALLAWAY_SCOPE_POSTER}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <MuxPlayer
              className="absolute inset-0"
              playbackId={CALLAWAY_SCOPE_PLAYBACK_ID}
              streamType="on-demand"
              autoPlay="muted"
              muted
              loop
              playsInline
              preload="auto"
              poster={CALLAWAY_SCOPE_POSTER}
              metadata={{ video_title: "Callaway Kyle scope background" }}
              nohotkeys
            />
          </div>
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
                  <span className="font-light">Start with Golf Channel.</span> Build
                  for USA Sports.
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

            <TagList tags={FIT_TAGS} className="mt-8" label="Scope metadata" />
          </div>
        </div>
      </div>
    </section>
  );
}
