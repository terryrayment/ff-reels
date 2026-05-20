import { cn } from "@/lib/utils";

interface Props {
  recipientFirstName?: string | null;
}

const NAVY = "#0a2856";
const CREAM = "#f5f0e0";
const GOLD = "#c9a961";

/**
 * Tournament-program cover.
 *
 * Full-bleed navy. Single editorial wordmark. Marginalia in the gutters.
 * No CTAs. No cards. The hero earns its weight by sitting still.
 */
export function WelcomeSplash({ recipientFirstName }: Props) {
  return (
    <section
      className={cn(
        "relative flex min-h-[100vh] flex-col overflow-hidden",
        "border-b border-white/10 px-6 py-12",
      )}
      style={{ backgroundColor: NAVY, color: CREAM }}
    >
      {/* Top marginalia row */}
      <div
        className="mx-auto flex w-full max-w-6xl items-center justify-between text-[10px] uppercase tracking-[0.3em]"
        style={{ color: `${CREAM}80` }}
      >
        <span>Friends &amp; Family · 2026</span>
        <span>For Versant Media</span>
        <span className="hidden sm:inline">No. 01 of 07</span>
      </div>

      {/* Center stack */}
      <div className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-4xl">
          <p
            className="mb-10 text-[11px] uppercase tracking-[0.35em]"
            style={{ color: GOLD }}
          >
            A Production Case · Vol. I
          </p>

          <p
            className="mb-8 text-[12px] uppercase tracking-[0.22em]"
            style={{ color: `${CREAM}cc` }}
          >
            {recipientFirstName ? `Hi ${recipientFirstName}.` : "Hi Versant."}
          </p>

          <h1
            className="font-serif text-[clamp(3rem,9vw,7rem)] font-normal leading-[0.92] tracking-tight-2"
            style={{ color: CREAM }}
          >
            We brought
            <br />
            clubs.
          </h1>

          <div
            aria-hidden="true"
            className="my-10 h-px w-24"
            style={{ backgroundColor: GOLD }}
          />

          <p
            className="max-w-xl font-serif text-[clamp(1.25rem,2vw,1.6rem)] font-light italic leading-snug"
            style={{ color: `${CREAM}cc` }}
          >
            A case for Friends &amp; Family — for Golf Channel, then
            everything else.
          </p>
        </div>
      </div>

      {/* Bottom call-sheet strip */}
      <div
        className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.22em] sm:grid-cols-4"
        style={{ color: `${CREAM}80` }}
      >
        <div>
          <span style={{ color: `${CREAM}50` }}>Production Co.</span>
          <br />
          Friends &amp; Family
        </div>
        <div>
          <span style={{ color: `${CREAM}50` }}>Founder</span>
          <br />
          Terry Rayment
        </div>
        <div>
          <span style={{ color: `${CREAM}50` }}>For</span>
          <br />
          Versant Media · USA Sports
        </div>
        <div>
          <span style={{ color: `${CREAM}50` }}>Lead With</span>
          <br />
          <span style={{ color: GOLD }}>Golf Channel</span>
        </div>
      </div>
    </section>
  );
}
