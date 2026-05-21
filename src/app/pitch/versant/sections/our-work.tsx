import Link from "next/link";
import { ArrowUpRight, Film } from "lucide-react";

interface Props {
  reelScreeningToken?: string | null;
}

const ROWS = [
  ["Runtime", "4:12"],
  ["Watch for", "faces / timing / restraint / color / finish / scale"],
  ["Send after watching", "format / deadline / assets / constraints"],
];

export function OurWork({ reelScreeningToken }: Props) {
  const href = reelScreeningToken ? `/s/${reelScreeningToken}` : null;

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid min-w-0 max-w-[1500px] gap-4 lg:grid-cols-12">
        <div className="min-w-0 rounded-[42px] bg-[var(--versant-black)] p-5 text-white shadow-[0_28px_90px_rgba(16,16,16,0.18)] sm:p-7 lg:col-span-8 lg:rounded-[52px]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
            <span>F&amp;F reel</span>
            <span>media player</span>
          </div>
          <ReelFrame href={href} />
        </div>

        <aside className="relative min-w-0 overflow-hidden rounded-[42px] bg-[var(--versant-white)] p-7 shadow-[0_24px_80px_rgba(16,16,16,0.08)] sm:p-8 lg:col-span-4 lg:rounded-[52px]">
          <span
            aria-hidden="true"
            className="absolute right-5 top-5 text-[clamp(58px,8vw,116px)] font-medium leading-none tracking-[-0.08em] text-[var(--versant-orange)]"
          >
            04:12
          </span>
          <div className="relative z-10 mb-8 flex items-start justify-between gap-5">
            <div>
              <p className="mb-4 rounded-full bg-[var(--versant-black)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white">
                Reel
              </p>
              <h2 className="max-w-[14rem] text-[clamp(44px,7vw,104px)] font-medium leading-[0.9] tracking-[-0.055em]">
                Watch for range.
              </h2>
            </div>
          </div>

          <p className="max-w-[48ch] border-l-4 border-[var(--versant-orange)] pl-5 text-[17px] leading-[1.35] tracking-[-0.025em] text-black/68">
            The reel is here to show how Friends &amp; Family moves between
            faces, timing, performance, comedy, polish, motion, and scale.
          </p>

          <div className="mt-10 space-y-3">
            {ROWS.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-2 border-t border-black/14 pt-3 text-[13px] sm:grid-cols-[8.5rem_1fr]"
              >
                <span className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                  {label}
                </span>
                <span className="min-w-0 break-words">{value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function ReelFrame({ href }: { href: string | null }) {
  const inner = (
    <div className="group relative min-w-0 overflow-hidden rounded-[32px] border border-white/12 bg-[#050505] lg:rounded-[42px]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-[10px] uppercase tracking-[0.18em] text-white/45">
        <span>F&amp;F reel</span>
        <span>Watch for range</span>
      </div>

      <div className="relative flex aspect-video min-h-[17rem] items-center justify-center bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_34%),#080808]">
        <span
          aria-hidden="true"
          className="absolute inset-5 rounded-[24px] border border-white/10"
        />
        <span
          aria-hidden="true"
          className="absolute left-6 top-6 h-8 w-8 border-l border-t border-white/36"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-6 right-6 h-8 w-8 border-b border-r border-white/36"
        />

        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-black transition group-hover:bg-[var(--versant-orange)]">
            <Film className="h-7 w-7" />
          </span>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/44">
            Press play · 00:00 to 04:12
          </p>
          <p className="text-[clamp(30px,4vw,64px)] font-medium leading-none tracking-[-0.055em]">
            Watch the reel
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4 text-[10px] uppercase tracking-[0.18em] text-white/45">
        <span>range cut</span>
        <span className="inline-flex items-center gap-2 text-white transition group-hover:text-[var(--versant-orange)]">
          {href ? "Open" : "Loading"}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );

  if (!href) return inner;

  return (
    <Link
      href={href}
      className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)]"
    >
      {inner}
    </Link>
  );
}
