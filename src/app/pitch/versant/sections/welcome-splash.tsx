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
        "relative flex min-h-[88vh] flex-col items-center justify-center",
        "border-b border-white/[0.06] bg-[#0e0e0e] px-6 py-24 text-center",
      )}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 flex items-center justify-center gap-5 text-[10px] uppercase tracking-[0.2em] text-white/30">
          <span>USA Sports</span>
          <span className="block h-px w-10 bg-white/15" aria-hidden="true" />
          <span>Friends &amp; Family</span>
        </div>

        <p className="mb-8 text-[10px] uppercase tracking-[0.2em] text-white/40">
          {recipientFirstName
            ? `${recipientFirstName} — built for you`
            : "For Versant Media"}
        </p>

        <h1 className="mb-7 text-[clamp(2rem,4.5vw,3.5rem)] font-light leading-[1.1] tracking-tight-2 text-white">
          The vendor map you draw this year
          <br />
          <span className="text-white/60">
            is the one you&apos;ll work from until 2032.
          </span>
        </h1>

        <p className="mx-auto max-w-xl text-[13px] leading-relaxed text-white/50">
          A case for Friends &amp; Family as Versant&apos;s long-term creative
          partner across USA Network, Golf Channel, and the rest of the USA
          Sports portfolio.
        </p>

        <div className="mt-16 flex flex-col items-center text-[10px] uppercase tracking-[0.25em] text-white/25">
          <span className="mb-3">Scroll</span>
          <span className="block h-10 w-px bg-gradient-to-b from-white/25 to-transparent" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
