/**
 * Versant business intelligence section.
 *
 * The "we did the homework" moment. Numbers get a huge stat-block
 * treatment to break the page rhythm; prose stays tight and human.
 */

export function BusinessIntel() {
  return (
    <section className="border-b border-white/[0.06] bg-[#0a0a0a] px-6 py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex items-baseline justify-between gap-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            04 — We did the homework
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Public filings · investor day · LinkedIn stalking
          </p>
        </div>

        <h2 className="mb-14 text-[clamp(1.75rem,4vw,2.75rem)] font-light leading-[1.1] tracking-tight-2 text-white">
          A read on Versant from the cheap seats.
          <br />
          <span className="text-white/55">
            We promise we&apos;re paying attention.
          </span>
        </h2>

        {/* Three big stat blocks — the visually loud moment */}
        <div className="mb-14 grid gap-px overflow-hidden rounded-md border border-white/[0.08] bg-white/[0.04] sm:grid-cols-3">
          <StatBlock
            value="$6.69B"
            label="FY 2025 revenue"
            caption="$2.42B Adjusted EBITDA. Big, real, public company numbers."
          />
          <StatBlock
            value="2032"
            label="Rights horizon"
            caption="USGA / PGA media rights renewed. That&apos;s the planning window."
          />
          <StatBlock
            value="10,000+"
            label="Hours of sport in 2026"
            caption="USA Network · Golf Channel · CNBC. The umbrella is real."
          />
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          <Block
            kicker="The spinoff"
            heading="January 2, 2026"
            body={
              <>
                Versant spun out of Comcast at the start of the year. USA
                Network, Golf Channel, CNBC, MS NOW, Syfy, Oxygen, E!, plus
                Fandango, Rotten Tomatoes, GolfNow, SportsEngine — bundled
                on purpose. Mark Lazarus running point. A cable-and-rights
                pure play, on its own NASDAQ ticker (VSNT).
              </>
            }
          />
          <Block
            kicker="The posture"
            heading="Disciplined, not contracting"
            body={
              <>
                Q1 2026: revenue down 1%, EBITDA down 7%, Programming &amp;
                Production costs down 5%. A $1B buyback and a quarterly
                dividend. Translation: lean lines, no scope creep, transparent
                margins. We bid that way.
              </>
            }
          />
          <Block
            kicker="The umbrella"
            heading="USA Sports, all of it"
            body={
              <>
                Matt Hong on the new brand: &ldquo;the best of both worlds —
                a start-up mentality and $7 billion revenues.&rdquo; That
                start-up energy is exactly the kind of room we walk into
                well. We&apos;re a small shop. We move fast. We bring the
                grown-up craft when it&apos;s time.
              </>
            }
          />
        </div>

        <div className="mt-16 rounded-md border border-white/[0.06] bg-white/[0.02] p-10">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
            The point
          </p>
          <p className="text-[18px] font-light leading-relaxed tracking-tight text-white/85">
            Versant is six months old. The vendor list isn&apos;t set.
            We&apos;re raising our hand before the queue forms.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatBlock({
  value,
  label,
  caption,
}: {
  value: string;
  label: string;
  caption: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 bg-[#0a0a0a] p-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p className="text-[clamp(2rem,4vw,3rem)] font-light leading-none tabular-nums tracking-tight-2 text-white">
        {value}
      </p>
      <p className="text-[12px] leading-snug text-white/55">{caption}</p>
    </div>
  );
}

function Block({
  kicker,
  heading,
  body,
}: {
  kicker: string;
  heading: string;
  body: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
        {kicker}
      </p>
      <h3 className="text-[17px] font-light leading-tight tracking-tight text-white">
        {heading}
      </h3>
      <p className="text-[13px] leading-relaxed text-white/65">{body}</p>
    </div>
  );
}
