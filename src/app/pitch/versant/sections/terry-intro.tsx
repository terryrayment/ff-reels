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
            className="pointer-events-none absolute -left-8 top-8 text-[clamp(120px,18vw,260px)] font-medium leading-none tracking-[-0.08em] text-black/[0.035]"
          >
            short list
          </span>

          <div className="relative z-10 mb-10 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--versant-black)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white">
              Note from Terry
            </span>
          </div>

          <div className="relative z-10 max-w-[760px] space-y-5 text-[clamp(17px,1.55vw,22px)] leading-[1.35] tracking-[-0.025em] text-black/76">
            <h2 className="max-w-3xl pb-2 text-[clamp(44px,7vw,104px)] font-medium leading-[0.96] tracking-[-0.055em] text-black">
              We&apos;d like to be on the short list.
            </h2>

            <p>
              We&apos;re Friends &amp; Family. We care about the human part of
              the job: the taste call, the set, the edit, and the version
              nobody remembered until Friday.
            </p>

            <p>
              If we got to choose where to start, it&apos;d be golf. Golf Channel
              has the pace, talent, live pressure, loyal audience, and
              production surface to show what we do well.
            </p>

            <p>
              We are not here to sell Versant a stack of new concepts. We are
              here to be useful inside the work already coming: films, opens,
              promos, sponsor pieces, talent windows, cutdowns, and whatever
              shape the brief takes.
            </p>

            <p>
              We can stay small and exact. We can scale when the job needs it.
              We can bring the right director, crew, post path, and delivery
              plan without making the process heavier than it needs to be.
            </p>

            <p>Send us the assignment shape. We&apos;ll show you how we&apos;d make it.</p>

            <p className="pt-4 text-[clamp(26px,3vw,44px)] font-medium leading-none tracking-[-0.045em] text-black">
              Terry
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
