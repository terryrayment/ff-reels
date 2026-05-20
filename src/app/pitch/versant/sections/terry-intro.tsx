"use client";

import MuxPlayer from "@mux/mux-player-react";

/**
 * Terry's director-EP statement. 60-90s video (Mux playback ID) over a still
 * fallback when video is not yet recorded. The text below it is the same
 * argument, written, so the value lands even without playback.
 */
interface Props {
  /** Mux playback ID for Terry's recorded statement video (set when filmed). */
  videoPlaybackId?: string | null;
  /** Fallback still image URL while the video is in production. */
  fallbackImageUrl?: string | null;
}

export function TerryIntro({ videoPlaybackId, fallbackImageUrl }: Props) {
  return (
    <section className="border-b border-white/10 bg-[#111] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-6 text-xs uppercase tracking-[0.18em] text-white/40">
          A note from Terry Rayment — Founder &amp; Creative Director
        </p>

        <div className="mb-12 aspect-video w-full overflow-hidden rounded-md bg-black ring-1 ring-white/10">
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
            <div className="flex h-full w-full items-center justify-center text-white/30">
              <span className="font-serif text-3xl">
                Statement video — coming this week
              </span>
            </div>
          )}
        </div>

        <div className="space-y-5 font-serif text-xl leading-relaxed text-white/85">
          <p>
            I watched the Professor Chase brief twice the day it arrived. The
            ensemble-comedy-with-real-stakes register is exactly the register
            Friends &amp; Family was built for. Sixteen drivers, one celebrity
            Professor, a classroom that has to feel earned — that&apos;s a
            staging problem we&apos;ve solved before, just not for NASCAR.
          </p>
          <p>
            But this email isn&apos;t about Professor Chase. It&apos;s about
            Versant. You&apos;re six months into independence. The next twelve
            months decide who you call for the next decade of brand creative
            across USA Network, Golf Channel, CNBC, and the rest. We want to be
            on that short list — and we want to earn it on this brief.
          </p>
          <p>
            Professor Chase is our entry.{" "}
            <span className="text-white">Golf Channel is our home.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
