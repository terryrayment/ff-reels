/**
 * "Our work" section — generic reel link, brief-agnostic.
 * Designed as a big hero CTA block to break the rhythm vs. the
 * text-heavy Golf section above.
 */

import Link from "next/link";
import { ArrowUpRight, Film } from "lucide-react";

interface Props {
  reelScreeningToken?: string | null;
}

export function OurWork({ reelScreeningToken }: Props) {
  return (
    <section className="border-b border-white/[0.06] bg-[#0e0e0e] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 flex items-baseline justify-between gap-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            03 — The Reel
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Approx. 4 minutes
          </p>
        </div>

        <h2 className="mb-8 text-[clamp(1.75rem,4vw,2.75rem)] font-light leading-[1.1] tracking-tight-2 text-white">
          The cut we&apos;d hand a network
          <br />
          <span className="text-white/55">
            that wanted to see what we&apos;re actually good at.
          </span>
        </h2>

        <p className="mb-12 max-w-2xl text-[15px] leading-relaxed tracking-tight text-white/65">
          Comedy with stakes. Cinematic talent direction. Sport, lifestyle,
          music, brand. Each piece carries a one-line note on why it&apos;s
          here. The reel is short because we believe the world has enough
          long things in it.
        </p>

        <ReelCard href={reelScreeningToken ? `/s/${reelScreeningToken}` : null} />
      </div>
    </section>
  );
}

function ReelCard({ href }: { href: string | null }) {
  const inner = (
    <div className="group relative overflow-hidden rounded-md border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-10 transition hover:border-white/25">
      {/* faint animated diagonal sheen on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent opacity-0 transition group-hover:translate-x-[300%] group-hover:opacity-100"
      />
      <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-white/15 text-white/80 transition group-hover:border-white/50 group-hover:text-white">
            <Film className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Friends &amp; Family — for Versant
            </p>
            <p className="mt-1 text-[20px] font-light leading-snug tracking-tight text-white">
              Watch the reel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/70 group-hover:text-white">
          {href ? "Press play" : "Loading shortly"}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
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
