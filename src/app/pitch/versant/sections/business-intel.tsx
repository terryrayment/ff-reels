/**
 * Versant business intelligence section.
 *
 * The "savvy partner" proof: visible understanding of Versant's spinoff
 * dynamics, financial posture, and USA Sports strategy. Reels-platform design
 * language — Inter sans, light weights, subtle dividers.
 */

export function BusinessIntel() {
  return (
    <section className="border-b border-white/[0.06] bg-[#0e0e0e] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
          Why we sound like we&apos;ve done the homework
        </p>
        <h2 className="mb-12 text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-[1.15] tracking-tight-2 text-white">
          A read on Versant from the outside.
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          <Block
            heading="The spinoff"
            kicker="Jan 2, 2026"
            body={
              <>
                Versant launched as an independent NASDAQ company (VSNT) at the
                start of the year. One VSNT share per 25 Comcast shares. The
                asset bundle is intentional: USA Network, Golf Channel, CNBC,
                MS NOW, Syfy, Oxygen, E! — plus Fandango, Rotten Tomatoes,
                GolfNow, SportsEngine. A cable-and-sports-rights pure-play
                under Mark Lazarus.
              </>
            }
          />

          <Block
            heading="The financial posture"
            kicker="Disciplined, not contracting"
            body={
              <>
                FY 2025: <span className="text-white">$6.69B revenue, $2.42B
                Adjusted EBITDA</span>. Q1 2026: revenue −1.1%, EBITDA −7%,
                Programming &amp; Production costs $519M (−5%). A $1B share
                buyback plus a $0.375 quarterly dividend. Translation for
                vendors: tight line items, no scope creep, transparent
                margins. We bid that way.
              </>
            }
          />

          <Block
            heading="The USA Sports thesis"
            kicker="Nov 2025 announcement"
            body={
              <>
                10,000+ hours of live events, studio shows, and originals
                across USA Network, Golf Channel, and CNBC in 2026. NASCAR Cup
                Playoffs: 7 of 10 Chase races on USA, 3 on NBC/Peacock.
                USGA/PGA media rights through 2032. WNBA, WWE, EPL inside the
                portfolio. Matt Hong: &ldquo;the best of both worlds — a
                start-up mentality and $7 billion revenues.&rdquo;
              </>
            }
          />
        </div>

        <div className="mt-14 rounded-md border border-white/[0.06] bg-white/[0.02] p-8">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
            Where we fit
          </p>
          <p className="text-[16px] font-light leading-relaxed tracking-tight text-white/80">
            Versant is six months into independence. Vendor relationships are
            not yet entrenched. Professor Chase is exactly the kind of
            high-visibility, well-defined first job that proves a partner.
            Golf Channel is the longer-horizon opportunity. We&apos;re here
            for both.
          </p>
        </div>
      </div>
    </section>
  );
}

function Block({
  heading,
  kicker,
  body,
}: {
  heading: string;
  kicker: string;
  body: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">
        {kicker}
      </p>
      <h3 className="text-[18px] font-light leading-tight tracking-tight text-white">
        {heading}
      </h3>
      <p className="text-[13px] leading-relaxed text-white/65">{body}</p>
    </div>
  );
}
