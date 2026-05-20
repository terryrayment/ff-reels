import { cn } from "@/lib/utils";

interface Props {
  recipientFirstName?: string | null;
}

/**
 * Personalized welcome splash. Big-picture partnership framing — no
 * brief-specific anchoring. Reels-platform design language.
 */
export function WelcomeSplash({ recipientFirstName }: Props) {
  return (
    <section
      className={cn(
        "relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden",
        "border-b border-white/[0.06] bg-[#0e0e0e] px-6 py-24 text-center",
      )}
    >
      {/* faint vertical type marker on the left edge, scoreboard-y */}
      <div
        aria-hidden="true"
        className="absolute left-6 top-1/2 hidden -translate-y-1/2 [writing-mode:vertical-rl] text-[10px] uppercase tracking-[0.4em] text-white/15 md:block"
      >
        Friends &amp; Family · 2026 · For Versant Media
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-12 flex items-center justify-center gap-5 text-[10px] uppercase tracking-[0.2em] text-white/35">
          <span>USA Sports</span>
          <span className="block h-px w-10 bg-white/15" aria-hidden="true" />
          <span>Friends &amp; Family</span>
        </div>

        <p className="mb-7 text-[10px] uppercase tracking-[0.2em] text-white/45">
          {recipientFirstName
            ? `Hi ${recipientFirstName}. Welcome in.`
            : "Hi Versant. Welcome in."}
        </p>

        <h1 className="mb-8 text-[clamp(2.25rem,5.5vw,4rem)] font-light leading-[1.05] tracking-tight-2 text-white">
          We made you a website.
          <br />
          <span className="text-white/55">
            Because an email wasn&apos;t going to do it.
          </span>
        </h1>

        <p className="mx-auto max-w-xl text-[14px] leading-relaxed text-white/55">
          Friends &amp; Family is a small production company that wants to be
          the one Versant calls for the work that actually matters. This is
          the loud version of that pitch.
        </p>

        <div className="mt-20 flex flex-col items-center text-[10px] uppercase tracking-[0.3em] text-white/25">
          <span className="mb-3">Keep scrolling</span>
          <span
            aria-hidden="true"
            className="block h-12 w-px animate-pulse bg-gradient-to-b from-white/35 to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
