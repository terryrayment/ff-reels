"use client";

import MuxPlayer from "@mux/mux-player-react";
import type { CSSProperties } from "react";
import { CONTAINER, KICKER, PANEL, TITLE, TagList } from "./system";

const CALLAWAY_BACKGROUND_PLAYBACK_ID =
  "fqMV3teH8SsrkMb4qAQsb701TwBVFhF3GQujxTbsolfQ";
const CALLAWAY_BACKGROUND_POSTER = `https://image.mux.com/${CALLAWAY_BACKGROUND_PLAYBACK_ID}/thumbnail.webp?width=1920&time=12`;

interface Props {
  videoPlaybackId?: string | null;
  fallbackImageUrl?: string | null;
}

export function TerryIntro({ videoPlaybackId, fallbackImageUrl }: Props) {
  const hasFounderMedia = Boolean(videoPlaybackId || fallbackImageUrl);

  return (
    <section className="versant-section relative overflow-hidden">
      <div className={`${CONTAINER} relative z-10 grid gap-3 lg:grid-cols-12`}>
        <div
          className={`relative overflow-hidden rounded-[4px] ${hasFounderMedia ? "lg:col-span-9" : "lg:col-span-10"}`}
        >
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
              src={CALLAWAY_BACKGROUND_POSTER}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
            <MuxPlayer
              className="absolute inset-0"
              playbackId={CALLAWAY_BACKGROUND_PLAYBACK_ID}
              streamType="on-demand"
              autoPlay="muted"
              muted
              loop
              playsInline
              preload="auto"
              poster={CALLAWAY_BACKGROUND_POSTER}
              metadata={{ video_title: "Jack Turits Callaway background" }}
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
          <article className={`${PANEL} relative z-10 overflow-hidden bg-[rgba(251,247,237,0.72)] p-5 backdrop-blur-[2px] sm:p-7 lg:p-8`}>
            <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-7">
                <p className={`${KICKER} mb-5 text-black/45`}>
                  Studio
                </p>
                <h2 className={`${TITLE} max-w-3xl text-black`}>
                  Built for live sports work.
                </h2>
              </div>

              <div className="space-y-5 text-[clamp(18px,1.55vw,22px)] leading-[1.2] tracking-[-0.025em] text-black/70 lg:col-span-5">
                <p>
                  We handle the parts that make sports work hard: live windows,
                  talent access, sponsor rules, late notes, platform versions,
                  and finish.
                </p>

                <TagList
                  tags={["Creative", "Production", "Edit", "Motion", "Versioning", "Delivery"]}
                  label="Studio capabilities"
                />
              </div>

              <dl className="grid gap-3 border-t border-black/12 pt-5 text-[13px] leading-[1.25] text-black/58 sm:grid-cols-4 lg:col-span-12">
                {[
                  ["Read", "References and creative direction"],
                  ["Build", "Director, crew, schedule"],
                  ["Finish", "Edit, motion, cleanup"],
                  ["Deliver", "Versions and final files"],
                ].map(([label, value]) => (
                  <div key={label} className="border-t border-black/10 pt-3 sm:border-t-0 sm:pt-0">
                    <dt className="versant-meta-label mb-2">
                      {label}
                    </dt>
                    <dd className="versant-meta-text">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        </div>

        {hasFounderMedia && (
          <aside className="versant-panel overflow-hidden bg-[var(--versant-black)] p-4 text-white lg:col-span-3">
            <div className="mb-4 flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
              <span>Founder message</span>
              <span>optional</span>
            </div>
            <div className="versant-media aspect-[4/5] bg-black">
              {videoPlaybackId ? (
                <MuxPlayer
                  playbackId={videoPlaybackId}
                  metadata={{ video_title: "Terry Rayment - Versant" }}
                  accentColor="#ff4b32"
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fallbackImageUrl ?? ""}
                  alt="Terry Rayment"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
