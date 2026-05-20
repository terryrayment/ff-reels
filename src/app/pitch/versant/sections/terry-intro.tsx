"use client";

import MuxPlayer from "@mux/mux-player-react";

/**
 * Founder's note — treatment-page styling. Sits on a warm-dark "manila"
 * tone, with editorial serif heading + sans body + monospace marginalia.
 * Asymmetric two-column layout for visual rhythm vs. the navy hero above.
 */
interface Props {
  videoPlaybackId?: string | null;
  fallbackImageUrl?: string | null;
}

export function TerryIntro({ videoPlaybackId, fallbackImageUrl }: Props) {
  return (
    <section className="border-b border-white/[0.06] bg-[#161513] px-6 py-28">
      <div className="mx-auto max-w-5xl">
        {/* Section gutter strip */}
        <div className="mb-10 flex items-baseline justify-between text-[10px] uppercase tracking-[0.3em] text-white/35">
          <span>02 — A note from Terry</span>
          <span className="font-mono normal-case tracking-normal text-white/25">
            shot 1 of 3
          </span>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.1fr_1.6fr]">
          {/* Left column — video + marginalia */}
          <div>
            <div className="mb-4 aspect-[4/5] w-full overflow-hidden rounded-sm bg-black ring-1 ring-white/[0.06]">
              {videoPlaybackId ? (
                <MuxPlayer
                  playbackId={videoPlaybackId}
                  metadata={{ video_title: "Terry Rayment — Versant" }}
                  accentColor="#ffffff"
                  style={{ width: "100%", height: "100%" }}
                />
              ) : fallbackImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fallbackImageUrl}
                  alt="Terry Rayment"
                  className="h-full w-full object-cover opacity-90"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a18] to-[#0e0e0e]">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                    Founder portrait · in cut
                  </span>
                </div>
              )}
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/35">
              FIG. 01 — Terry Rayment, founder
              <br />
              Friends &amp; Family · Los Angeles
            </p>
          </div>

          {/* Right column — letter */}
          <div className="space-y-5 text-[15.5px] leading-[1.7] tracking-tight text-white/80">
            <p className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] leading-[1.15] tracking-tight-2 text-white">
              We&apos;d like to be on the short list.
            </p>

            <p>
              We want to be on the short list for production work that matters
              at Versant. We think the first place to prove that is golf. Golf
              Channel has the rights, the talent, the events, the digital
              surface, and a fan base that knows when the work is fake. The
              independent Versant era needs the films that name that next
              chapter. We&apos;d like to make them.
            </p>

            <p>
              We&apos;re small enough to care about the material and
              experienced enough to deliver it at scale. We know the vendor map
              is being drawn right now. We&apos;d rather be on it before it
              hardens.
            </p>

            <p>
              Watch the reel. Read the holes. Call us before the next thing
              becomes urgent.
            </p>

            <div className="pt-4">
              <p className="font-serif text-[1.5rem] leading-none tracking-tight-2 text-white">
                — Terry
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                P.S. The reel is short. We didn&apos;t pad it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
