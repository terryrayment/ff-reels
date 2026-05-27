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
        <article className="relative overflow-hidden rounded-[21px] bg-[var(--versant-white)] p-7 shadow-[0_24px_80px_rgba(16,16,16,0.08)] sm:p-10 lg:col-span-9 lg:p-12 xl:rounded-[26px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-8 top-8 text-[clamp(120px,18vw,260px)] font-medium leading-none tracking-[-0.05em] text-black/[0.026]"
          >
            short list
          </span>

          <div className="relative z-10 max-w-[760px] space-y-5 text-[clamp(17px,1.55vw,22px)] leading-[1.35] tracking-[-0.025em] text-black/76">
            <h2 className="versant-display max-w-3xl text-[clamp(44px,7vw,104px)] font-medium tracking-[-0.04em] text-black">
              We&apos;d love to be{" "}
              <span className="relative inline-block">
                on
                <span
                  aria-hidden="true"
                  className="absolute left-[-0.08em] right-[-0.08em] top-[54%] h-[0.12em] -translate-y-1/2 -rotate-6 rounded-[2px] bg-[var(--versant-orange)]"
                />
              </span>{" "}
              your shortlist.
            </h2>

            <p>
              We are a creative studio and a production company stacked with
              people who lose their minds over a good idea. We chase it down
              the hallway. We knock over a chair. Somebody cries a little. Then
              the work shows up better than the brief had any right to expect.
            </p>

            <p>
              Throw it at us. A napkin sketch. A brutal deadline. A hard drive
              nobody labeled. A talent window cracking shut on Thursday at 4.
              We grab it, find the cleanest line to the finish, and keep the
              process so light you forget it is happening.
            </p>

            <p>
              Tiny and surgical or enormous and ridiculous, we shape to the
              job. Director, crew, post, delivery, all of it bent around the
              work like the work is the only thing in the building. Because to
              us it is.
            </p>

            <p>
              Send the assignment. We send back the sharpest way to make it.
            </p>
          </div>
        </article>

        {(videoPlaybackId || fallbackImageUrl) && (
          <aside className="overflow-hidden rounded-[18px] bg-[var(--versant-black)] p-4 text-white lg:col-span-3 xl:rounded-[24px]">
            <div className="mb-4 flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
              <span>Founder message</span>
              <span>optional</span>
            </div>
            <div className="aspect-[4/5] overflow-hidden rounded-[14px] bg-black">
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
