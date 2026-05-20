/**
 * Golf Channel section — the strategic lead.
 *
 * Visual treatment evokes a championship-golf program: deep navy, cream
 * type, soft gold accents, tournament-program serif wordmark and tabular
 * numerals. No reproduction of any specific brand mark or copy — only
 * the general visual language of major-tournament editorial.
 */

const USGA_NAVY = "#0a2856"; // deep navy, championship program palette
const USGA_GOLD = "#c9a961"; // warm trophy gold
const USGA_CREAM = "#f5f0e0";

export function GolfTab() {
  return (
    <section
      className="relative overflow-hidden border-y border-white/10 px-6 py-28"
      style={{ backgroundColor: USGA_NAVY, color: USGA_CREAM }}
    >
      {/* Faint vertical hash-marks evoking a flagstick / scorecard rail */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-px md:block"
        style={{ background: `linear-gradient(${USGA_GOLD}, transparent 60%)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-px md:block"
        style={{ background: `linear-gradient(${USGA_GOLD}, transparent 60%)` }}
      />

      <div className="relative mx-auto max-w-4xl">
        {/* Tournament-program header strip */}
        <div
          className="mb-12 flex items-center justify-between border-y py-4 text-[10px] uppercase tracking-[0.3em]"
          style={{ borderColor: `${USGA_GOLD}33`, color: `${USGA_CREAM}b3` }}
        >
          <span>02 — The Real Pitch</span>
          <span className="hidden sm:inline" style={{ color: USGA_GOLD }}>
            ★
          </span>
          <span>Golf Channel · 2026</span>
        </div>

        {/* Big serif "wordmark" treatment */}
        <p
          className="mb-3 text-[10px] uppercase tracking-[0.4em]"
          style={{ color: USGA_GOLD }}
        >
          On Golf
        </p>
        <h2 className="mb-2 font-serif text-[clamp(2.5rem,6vw,5rem)] font-normal uppercase leading-[0.95] tracking-tight-2 text-[var(--cream)]" style={{ ['--cream' as string]: USGA_CREAM }}>
          We love golf.
        </h2>
        <h3
          className="mb-12 font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-light uppercase italic leading-tight tracking-tight"
          style={{ color: `${USGA_CREAM}b3` }}
        >
          Probably a little too much.
        </h3>

        <div className="space-y-6 text-[15px] leading-relaxed tracking-tight" style={{ color: `${USGA_CREAM}cc` }}>
          <p>
            Sunday at Augusta. The Open in soft Scottish rain. Phil holed-out
            from off the green in 2004 and a small piece of every one of us
            died and was reborn. We have opinions about playoff formats. We
            have opinions about hat brims. We have a Slack channel called{" "}
            <span className="italic" style={{ color: USGA_GOLD }}>
              #fried-egg
            </span>{" "}
            and it&apos;s not about brunch.
          </p>

          <p>
            We&apos;re telling you this because most production companies
            pitching Versant aren&apos;t going to. Golf is the brand
            inside USA Sports that rewards a partner who actually watches it.
            The pacing, the silence, the way the camera holds on a putt
            three beats longer than feels natural — none of that is
            accidental. Someone has to love it enough to defend it in an
            edit room at 11&nbsp;p.m.
          </p>

          <p>That&apos;s us.</p>
        </div>

        {/* Quick "leaderboard" of why Golf is the opportunity */}
        <div
          className="mt-14 grid gap-4 border-y py-6 sm:grid-cols-4"
          style={{ borderColor: `${USGA_GOLD}33` }}
        >
          <Stat label="Rights horizon" value="2032" caption="USGA / PGA media rights" />
          <Stat label="Audience" value="Premium" caption="Index high on discretionary spend" />
          <Stat label="Brand voice" value="Open" caption="No defining film in USA Sports era" />
          <Stat label="Vendor crowd" value="Light" caption="Most shops chase NASCAR" />
        </div>

        <p
          className="mt-12 text-[15px] leading-relaxed tracking-tight"
          style={{ color: `${USGA_CREAM}cc` }}
        >
          We&apos;d like to be the people you call when Golf Channel needs
          the films that decide how the next decade of golf is told. The
          rest of the work is gravy. Important, beautiful gravy. But the
          gravy.
        </p>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  const USGA_GOLD = "#c9a961";
  const USGA_CREAM = "#f5f0e0";
  return (
    <div>
      <p
        className="mb-2 text-[9px] uppercase tracking-[0.25em]"
        style={{ color: `${USGA_CREAM}77` }}
      >
        {label}
      </p>
      <p
        className="font-serif text-[clamp(1.5rem,2.5vw,2.25rem)] font-light leading-none tabular-nums tracking-tight-2"
        style={{ color: USGA_GOLD }}
      >
        {value}
      </p>
      <p className="mt-2 text-[11px] leading-snug" style={{ color: `${USGA_CREAM}88` }}>
        {caption}
      </p>
    </div>
  );
}
