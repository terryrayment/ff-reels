"use client";

import MuxPlayer from "@mux/mux-player-react";

/**
 * Terry's director-EP statement — sounds like Terry actually wrote it.
 * Asymmetric layout (video full width on top, narrow text column below,
 * with a pulled quote at the side) for visual rhythm vs. neighbor sections.
 */
interface Props {
  videoPlaybackId?: string | null;
  fallbackImageUrl?: string | null;
}

export function TerryIntro({ videoPlaybackId, fallbackImageUrl }: Props) {
  return (
    <section className="border-b border-white/[0.06] bg-[#111] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-baseline justify-between gap-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            01 — A note from Terry
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Friends &amp; Family · Founder
          </p>
        </div>

        <div className="mb-12 aspect-video w-full overflow-hidden rounded-md bg-black ring-1 ring-white/[0.06]">
          {videoPlaybackId ? (
            <MuxPlayer
              playbackId={videoPlaybackId}
              metadata={{ video_title: "Terry Rayment — Versant Statement" }}
              accentColor="#ffffff"
              style={{ width: "100%", height: "100%" }}
            />
          ) : fallbackImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fallbackImageUrl}
              alt="Terry Rayment, Friends & Family"
              className="h-full w-full object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/25">
                Statement video — filming this week
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <aside className="text-[12px] uppercase tracking-[0.2em] text-white/35 md:border-r md:border-white/[0.08] md:pr-6">
            <p>
              The thing we want
              <br />
              <span className="text-white/70">is to be the one you call</span>
            </p>
          </aside>

          <div className="space-y-5 text-[15px] leading-relaxed tracking-tight text-white/75">
            <p>
              Friends &amp; Family is a small production company. We have a
              roster of directors we love, two great reps, and an obsession
              with making the kind of work that earns a second meeting. We&apos;ve
              spent the last few years building the company we&apos;d want to
              hire. Now we&apos;d like to be the one Versant hires.
            </p>
            <p>
              You&apos;re six months into independence. The vendor map you
              draw between now and the end of the year is the one you&apos;ll
              work from for a long time. We are politely raising our hand
              from the back of the room.
            </p>
            <p className="text-white">
              Watch the reel. Read the rest. Then let&apos;s steal thirty
              minutes and talk about what we&apos;d actually make together.
            </p>
            <p className="text-[12px] uppercase tracking-[0.18em] text-white/40">
              — Terry
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
