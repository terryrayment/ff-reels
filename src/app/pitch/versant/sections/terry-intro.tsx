"use client";

import MuxPlayer from "@mux/mux-player-react";

/**
 * Terry's director-EP statement. 60-90s video over a still fallback when the
 * video isn't yet recorded. Inter sans, light weights, reels-platform palette.
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
          <p className="text-white">
            Professor Chase is our entry. Golf Channel is our home.
          </p>
        </div>
      </div>
    </section>
  );
}
