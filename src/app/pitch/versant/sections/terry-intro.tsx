"use client";

import MuxPlayer from "@mux/mux-player-react";

interface Props {
  videoPlaybackId?: string | null;
  fallbackImageUrl?: string | null;
}

export function TerryIntro({ videoPlaybackId, fallbackImageUrl }: Props) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-[1400px] gap-4 lg:grid-cols-12">
        <article className="relative overflow-hidden rounded-[42px] bg-[var(--versant-white)] p-7 shadow-[0_24px_80px_rgba(16,16,16,0.08)] sm:p-10 lg:col-span-9 lg:p-12 xl:rounded-[52px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-8 top-8 text-[clamp(120px,18vw,260px)] font-medium leading-none tracking-[-0.05em] text-black/[0.026]"
          >
            short list
          </span>

          <div className="relative z-10 max-w-[760px] space-y-5 text-[clamp(17px,1.55vw,22px)] leading-[1.35] tracking-[-0.025em] text-black/76">
            <h2 className="versant-display max-w-3xl text-[clamp(44px,7vw,104px)] font-medium tracking-[-0.04em] text-black">
              We&apos;d love to be your shortlist.
            </h2>

            <p>
              We&apos;re a creative studio and production company built around
              people who care about the work. The idea matters. So does the
              set, the edit, the late version, the quiet fix, and the person
              who has to approve it on Friday.
            </p>

            <p>
              Bring us a sketch, a deadline, a footage pull, or a short talent
              window. We&apos;ll find the cleanest way to make it, keep the process
              light, and protect the work all the way through delivery.
            </p>

            <p>
              We stay small and exact when that&apos;s the move. We scale when the
              job calls for it. Either way, the director, crew, post path, and
              delivery plan fit the assignment.
            </p>

            <p>
              Send us the assignment. We&apos;ll come back with a clean way to make
              it.
            </p>
          </div>
        </article>

        {(videoPlaybackId || fallbackImageUrl) && (
          <aside className="overflow-hidden rounded-[36px] bg-[var(--versant-black)] p-4 text-white lg:col-span-3 xl:rounded-[48px]">
            <div className="mb-4 flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
              <span>Founder message</span>
              <span>optional</span>
            </div>
            <div className="aspect-[4/5] overflow-hidden rounded-[28px] bg-black">
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
