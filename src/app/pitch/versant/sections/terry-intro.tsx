"use client";

import MuxPlayer from "@mux/mux-player-react";
import type { CSSProperties } from "react";

const CALLAWAY_BACKGROUND_PLAYBACK_ID =
  "fqMV3teH8SsrkMb4qAQsb701TwBVFhF3GQujxTbsolfQ";

interface Props {
  videoPlaybackId?: string | null;
  fallbackImageUrl?: string | null;
}

export function TerryIntro({ videoPlaybackId, fallbackImageUrl }: Props) {
  const hasFounderMedia = Boolean(videoPlaybackId || fallbackImageUrl);

  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-55 [&_mux-player]:h-full [&_mux-player]:w-full"
        style={
          {
            "--controls": "none",
            "--media-object-fit": "cover",
          } as CSSProperties
        }
      >
        <MuxPlayer
          playbackId={CALLAWAY_BACKGROUND_PLAYBACK_ID}
          streamType="on-demand"
          autoPlay="muted"
          muted
          loop
          playsInline
          preload="auto"
          poster={`https://image.mux.com/${CALLAWAY_BACKGROUND_PLAYBACK_ID}/thumbnail.webp?width=1920&time=12`}
          metadata={{ video_title: "Jack Turits Callaway background" }}
          nohotkeys
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--versant-paper)_0%,rgba(247,242,231,0.82)_14%,rgba(247,242,231,0.28)_42%,rgba(247,242,231,0.3)_58%,rgba(247,242,231,0.86)_86%,var(--versant-paper)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--versant-paper)_0%,rgba(247,242,231,0.18)_20%,rgba(247,242,231,0.12)_72%,var(--versant-paper)_100%)]"
      />

      <div className="relative z-10 mx-auto grid max-w-[1400px] gap-3 lg:grid-cols-12">
        <article className={`versant-mw-panel relative overflow-hidden rounded-[18px] border border-black/12 bg-[rgba(251,246,234,0.94)] p-6 shadow-[0_24px_80px_rgba(16,16,16,0.07)] backdrop-blur-[2px] sm:p-8 lg:p-10 xl:rounded-[22px] ${hasFounderMedia ? "lg:col-span-9" : "lg:col-span-10"}`}>
          <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <p className="mb-5 text-[12px] font-medium uppercase tracking-[0.14em] text-black/42">
                SHORTLIST ARGUMENT
              </p>
              <h2 className="versant-display max-w-3xl text-[clamp(42px,6.2vw,92px)] font-medium tracking-[-0.045em] text-black">
                Put us on the shortlist.
              </h2>
            </div>

            <div className="space-y-5 text-[clamp(18px,1.75vw,24px)] leading-[1.22] tracking-[-0.03em] text-black/74 lg:col-span-5">
              <p>
                We are a creative studio and production company built for
                ideas that need taste, speed, and a clean path to delivery,
                especially when the assignment comes with live windows, talent
                access, sponsor rules, platform versions, late notes, and
                finish that has to hold up everywhere.
              </p>

              <p>
                We scale to the assignment. Director, crew, edit, motion,
                finish, versioning, delivery.
              </p>
            </div>

            <dl className="grid gap-3 border-t border-black/12 pt-5 text-[13px] leading-[1.25] text-black/58 sm:grid-cols-3 lg:col-span-12">
              {[
                ["Start", "Creative read, references, production path"],
                ["Build", "Director fit, crew shape, post plan"],
                ["Deliver", "Cuts, motion, cleanup, versions, final files"],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-black/10 pt-3 sm:border-t-0 sm:pt-0">
                  <dt className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-black/38">
                    {label}
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>

        {hasFounderMedia && (
          <aside className="versant-mw-panel overflow-hidden rounded-[18px] bg-[var(--versant-black)] p-4 text-white lg:col-span-3 xl:rounded-[24px]">
            <div className="mb-4 flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
              <span>Founder message</span>
              <span>optional</span>
            </div>
            <div className="versant-mw-media aspect-[4/5] overflow-hidden rounded-[14px] bg-black">
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
