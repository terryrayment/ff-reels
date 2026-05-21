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
              We&apos;d love to be your shortlist.
            </h2>

            <p>
              We&apos;re a creative studio. A production company. A loose,
              slightly feral network of production people who do our best work
              with little or no plan. Hand us a napkin sketch. Hand us a
              deadline. Hand us a vague feeling and a Tuesday. We&apos;ll find the
              film inside it.
            </p>

            <p>
              We chase the good idea down the hall. We shoot the thing nobody
              storyboarded. We&apos;ve made tears, made laughs, made a grown man
              cry at a pickup truck. We are calm in the chaos and a little
              weird in the calm. This is the part where most companies say
              &quot;strategic partner.&quot; We&apos;d rather just make something great and
              let you take the credit.
            </p>

            <p>
              If you let us pick where to start, we&apos;d pick golf every time.
              Golf Channel has the pace, the talent, the live pressure, the
              audience that can smell a fake from the back of the gallery, and
              the room to actually show what we&apos;re good at. We&apos;d be honored to
              make something for it.
            </p>

            <p>
              We&apos;re not here to hand you a deck of concepts you didn&apos;t ask
              for. We&apos;re here to be genuinely useful inside the work already on
              the way — films, opens, promos, sponsor pieces, talent windows,
              cutdowns, whatever shape the brief shows up in.
            </p>

            <p>
              We stay small and exact when that&apos;s the move. We scale, fast and
              calm, when the job calls for it. Either way you get the right
              director, the right crew, a clean post path, and a delivery plan
              — without the process ever getting heavier than the work.
            </p>

            <p>
              So send us the shape of the thing. We&apos;ll show you — probably
              with too much enthusiasm — exactly how we&apos;d make it.
            </p>

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
