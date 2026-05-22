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
              We&apos;re a creative studio and production company built around good
              people making good work. We care about the taste call, the set,
              the edit, the version nobody remembered until Friday, and the
              small decisions that make a piece feel considered.
            </p>

            <p>
              Bring us a sketch, a deadline, a footage pull, a talent window,
              or a brief that is still finding its edges. We&apos;ll find the
              cleanest way to make it, keep the process light, and protect the
              work all the way through delivery.
            </p>

            <p>
              If we got to choose where to start, we&apos;d choose golf. Golf
              Channel has live pressure, real personalities, loyal fans, and a
              tone that has to be earned.
            </p>

            <p>
              Versant has real work already moving: films, opens, promos,
              sponsor pieces, talent windows, cutdowns, and the assignments
              that arrive with half the answers missing.
            </p>

            <p>
              We stay small and exact when that&apos;s the move. We scale, fast and
              calm, when the job calls for it. Either way you get the right
              director, the right crew, a clean post path, and a delivery plan
              — without the process ever getting heavier than the work.
            </p>

            <p>
              Send us the assignment. We&apos;ll come back with the director, the
              crew, the post path, and a clean way to make it.
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
