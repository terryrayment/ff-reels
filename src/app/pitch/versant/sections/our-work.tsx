/**
 * "The Tape" — the reel turn.
 *
 * Styled as a broadcast-monitor frame with corner ticks, a timecode bar,
 * and a camera ID. The turn from pitch to proof.
 */

import Link from "next/link";
import { Film, ArrowUpRight } from "lucide-react";

interface Props {
  reelScreeningToken?: string | null;
}

export function OurWork({ reelScreeningToken }: Props) {
  const href = reelScreeningToken ? `/s/${reelScreeningToken}` : null;

  return (
    <section className="border-b border-white/[0.06] bg-[#0e0e0e] px-6 py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-baseline justify-between text-[10px] uppercase tracking-[0.3em] text-white/35">
          <span>04 — The Tape</span>
          <span className="font-mono normal-case tracking-normal text-white/25">
            BTV-1 · 00:00:00:00
          </span>
        </div>

        <div className="mb-12 grid items-end gap-4 md:grid-cols-[1.6fr_1fr]">
          <h2 className="font-serif text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[0.95] tracking-tight-2 text-white">
            Here&apos;s the tape.
            <br />
            <span className="text-white/55">Four minutes. Then call us.</span>
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            Director notes
            <br />
            in the screening-room cut.
          </p>
        </div>

        {/* Broadcast monitor */}
        <BroadcastFrame href={href} />

        {/* Watch-for notes */}
        <div className="mt-10 grid gap-5 text-[13px] leading-relaxed text-white/65 sm:grid-cols-3">
          <Cue
            tc="00:12"
            label="Tone"
            body="Comedy with stakes. Ensemble with point of view."
          />
          <Cue
            tc="01:36"
            label="Talent"
            body="How we hold a face. How we let a moment land."
          />
          <Cue
            tc="03:04"
            label="Craft"
            body="Format-agnostic but format-aware. The lighting earns the cut."
          />
        </div>
      </div>
    </section>
  );
}

function BroadcastFrame({ href }: { href: string | null }) {
  const inner = (
    <div className="group relative rounded-sm border border-white/15 bg-[#080808] p-4">
      {/* corner tick marks */}
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-[#111] via-[#0a0a0a] to-[#000]">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full border border-white/20 text-white/80 transition group-hover:border-white/50 group-hover:text-white">
            <Film className="h-6 w-6" />
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            Press play · 00:00:00 — 00:04:12
          </p>
          <p className="font-serif text-[1.5rem] font-light tracking-tight text-white">
            Watch the reel
          </p>
        </div>
      </div>

      {/* Bottom timecode bar */}
      <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
        <span>F&amp;F · for Versant</span>
        <span className="hidden sm:inline">SH 01 / 03 · Reel cut</span>
        <span className="inline-flex items-center gap-1.5 text-white/70 transition group-hover:text-white">
          {href ? "Open" : "Loading"}
          <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const map: Record<typeof pos, string> = {
    tl: "left-1 top-1 border-l border-t",
    tr: "right-1 top-1 border-r border-t",
    bl: "left-1 bottom-1 border-l border-b",
    br: "right-1 bottom-1 border-r border-b",
  };
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-3 w-3 border-white/35 ${map[pos]}`}
    />
  );
}

function Cue({
  tc,
  label,
  body,
}: {
  tc: string;
  label: string;
  body: string;
}) {
  return (
    <div className="rounded-sm border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a961]">
        {tc} · {label}
      </p>
      <p className="mt-2 text-white/70">{body}</p>
    </div>
  );
}
