import { cn } from "@/lib/utils";

interface Props {
  recipientFirstName?: string | null;
}

/**
 * Personalized welcome splash. Two-logo (USA Sports + Friends & Family), one
 * sentence of intent. No CTA — the scroll-to-explore is the gesture.
 */
export function WelcomeSplash({ recipientFirstName }: Props) {
  return (
    <section
      className={cn(
        "relative flex min-h-[88vh] flex-col items-center justify-center",
        "border-b border-white/10 bg-[#0a0a0a] px-6 py-24 text-center",
      )}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center justify-center gap-6 text-[11px] uppercase tracking-[0.18em] text-white/40">
          <span>USA Sports</span>
          <span className="block h-px w-12 bg-white/20" aria-hidden="true" />
          <span>Friends &amp; Family</span>
        </div>

        {recipientFirstName ? (
          <p className="mb-6 text-sm uppercase tracking-[0.16em] text-white/50">
            {recipientFirstName} — built for you
          </p>
        ) : (
          <p className="mb-6 text-sm uppercase tracking-[0.16em] text-white/50">
            For Versant Media
          </p>
        )}

        <h1 className="mb-8 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] text-white">
          We&apos;re not pitching for one job.
          <br />
          We&apos;re pitching for the next ten years of USA Sports content.
        </h1>

        <p className="mx-auto max-w-xl text-balance text-base leading-relaxed text-white/60">
          Professor Chase is the entry. Golf Channel is the home. This is what
          Friends &amp; Family looks like as your long-term creative partner.
        </p>

        <div className="mt-16 flex flex-col items-center text-xs uppercase tracking-[0.2em] text-white/40">
          <span className="mb-3">Scroll</span>
          <span className="block h-12 w-px bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
