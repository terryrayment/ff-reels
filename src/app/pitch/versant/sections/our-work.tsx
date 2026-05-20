/**
 * "Our work" section — generic reel link, brief-agnostic.
 * Replaces the prior NASCAR-specific BriefAnswer card.
 *
 * Reels-platform design language: Inter sans, light weights, subtle borders.
 */

import Link from "next/link";
import { ArrowUpRight, Film } from "lucide-react";

interface Props {
  /** Token of the F&F company reel to deep-link viewers into. */
  reelScreeningToken?: string | null;
}

export function OurWork({ reelScreeningToken }: Props) {
  return (
    <section className="border-b border-white/[0.06] bg-[#0e0e0e] px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
          Our work
        </p>
        <h2 className="mb-10 text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-[1.15] tracking-tight-2 text-white">
          A reel built around how we&apos;d want you to hire us.{" "}
          <span className="text-white/60">
            Director-led, ensemble-comfortable, cinematic when it matters.
          </span>
        </h2>

        <p className="mb-10 text-[15px] leading-relaxed tracking-tight text-white/70">
          Friends &amp; Family is a small roster by design. The reel below is
          the cut we&apos;d hand a network that wanted to see range without
          losing point of view. Comedy with stakes. Cinematic talent
          direction. Sport, lifestyle, music, brand. Each piece carries a
          short note on why it&apos;s here.
        </p>

        <ReelCard
          href={reelScreeningToken ? `/s/${reelScreeningToken}` : null}
        />
      </div>
    </section>
  );
}

function ReelCard({ href }: { href: string | null }) {
  const inner = (
    <div className="group flex items-center justify-between gap-6 rounded-md border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-white/20 hover:bg-white/[0.05]">
      <div className="flex items-center gap-5">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-white/15 text-white/80 transition group-hover:border-white/40 group-hover:text-white">
          <Film className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Friends &amp; Family — for Versant
          </p>
          <p className="mt-1 text-[18px] font-light leading-snug tracking-tight text-white">
            Watch the reel
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-white/70 group-hover:text-white">
        {href ? "Open" : "Coming soon"}
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
