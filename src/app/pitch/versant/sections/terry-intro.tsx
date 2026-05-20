"use client";

import MuxPlayer from "@mux/mux-player-react";

/**
 * Terry's director-EP statement. 60-90s video over a still fallback when the
 * video isn't yet recorded. Reels-platform design language.
 *
 * Intentionally brief-agnostic — this pitch is about a longer Versant
 * partnership, not any single project bid.
 */
interface Props {
  videoPlaybackId?: string | null;
  fallbackImageUrl?: string | null;
}

export function TerryIntro({ videoPlaybackId, fallbackImageUrl }: Props) {
  return (
    <section className="border-b border-white/[0.06] bg-[#111] px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 text-[10px] uppercase tracking-[0.2em] text-white/40">
          A note from Terry Rayment — Founder &amp; Creative Director
        </p>

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
                Statement video — coming this week
              </span>
            </div>
          )}
        </div>

        <div className="space-y-5 text-[15px] leading-relaxed tracking-tight text-white/75">
          <p>
            We built Friends &amp; Family to be the production company a
            network like Versant would call when the brief mattered. Not the
            volume vendor. Not the holding-company default. The director-led
            shop you trust with the films that set a tone for a decade.
          </p>
          <p>
            You&apos;re six months into independence. The next twelve months
            decide who you call for the next ten years of brand creative
            across USA Network, Golf Channel, CNBC, and the rest of the USA
            Sports portfolio. The vendor map you draw this year is the one
            you&apos;ll work from until 2032.
          </p>
          <p>
            This page is our argument for being on that map. Watch the reel.
            Read the rest. Then let&apos;s find thirty minutes to talk about
            what we&apos;d build together.
          </p>
        </div>
      </div>
    </section>
  );
}
