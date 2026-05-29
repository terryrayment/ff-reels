"use client";

import MuxPlayer from "@mux/mux-player-react";
import { KICKER, PANEL, REVEAL, TITLE, TagList } from "./system";
import { VersantBackgroundMux } from "./versant-background-mux";

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
    <section className="relative overflow-hidden px-6 py-10 text-[var(--versant-ink)] sm:px-10 lg:px-14">
      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] gap-3 lg:grid-cols-12">
        <div
          className={`${REVEAL} relative overflow-hidden rounded-[4px] ${hasFounderMedia ? "lg:col-span-9" : "lg:col-span-12"}`}
        >
          <VersantBackgroundMux
            playbackId={CALLAWAY_BACKGROUND_PLAYBACK_ID}
            poster={CALLAWAY_BACKGROUND_POSTER}
            title="Jack Turits Callaway background"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(221,224,216,0.94)_0%,rgba(221,224,216,0.32)_24%,rgba(221,224,216,0.2)_54%,rgba(221,224,216,0.45)_78%,rgba(221,224,216,0.96)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(221,224,216,0.9)_0%,rgba(221,224,216,0.42)_32%,rgba(221,224,216,0.24)_64%,rgba(221,224,216,0.9)_100%)]"
          />
          <article
            className={`${PANEL} versant-studio-panel relative z-10 flex flex-wrap overflow-hidden bg-[rgba(251,247,237,0.72)] p-5 backdrop-blur-[2px] sm:p-7 lg:p-8`}
          >
            <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-7">
                <p className={`${KICKER} mb-5 text-black/45`}>
                  Studio
                </p>
                <h2 className={`${TITLE} max-w-3xl text-black`}>
                  Built for sports work with moving parts.
                </h2>
              </div>

              <div className="space-y-5 text-[clamp(17px,1.45vw,21px)] leading-[1.24] tracking-[-0.02em] text-black/58 lg:col-span-5">
                <p>
                  We keep the path simple: creative read, director, crew, edit,
                  motion, finish, versions, final files.
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
                    <dt className="versant-meta-label mb-2">{label}</dt>
                    <dd className="versant-meta-text">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        </div>

        {hasFounderMedia && (
          <aside className="versant-panel overflow-hidden bg-[var(--versant-black)] p-4 text-white lg:col-span-3">
            <div className="mb-4 px-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
              <span>Founder message</span>
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
