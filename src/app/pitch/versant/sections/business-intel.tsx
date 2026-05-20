/**
 * Versant business intelligence section.
 *
 * This is the "savvy partner" proof: visible understanding of Versant's
 * spinoff dynamics, financial posture, and USA Sports strategy. Direct
 * quotes/numbers all source-able to the Q1 2026 8-K, the Nov 2025 USA
 * Sports launch press, and the Comcast spinoff Form 10. Keep it factual
 * — no flattery, no fluff. Executive-grade voice.
 */

export function BusinessIntel() {
  return (
    <section className="border-b border-white/10 bg-[#0a0a0a] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/40">
          Why we sound like we&apos;ve done the homework
        </p>
        <h2 className="mb-12 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-white">
          A read on Versant from the outside.
        </h2>

        <div className="grid gap-10 md:grid-cols-3">
          <Block
            heading="The spinoff"
            kicker="Jan 2, 2026"
            body={
              <>
                Versant launched as an independent NASDAQ company (ticker
                VSNT) at the start of the year. Comcast shareholders received
                one VSNT share for every 25 Comcast shares. The asset bundle
                is intentional: USA Network, Golf Channel, CNBC, MS NOW,
                Syfy, Oxygen, E! — plus Fandango, Rotten Tomatoes, GolfNow,
                SportsEngine. A cable-and-sports-rights pure-play under Mark
                Lazarus, formerly Chair of NBCUniversal Media Group.
              </>
            }
          />

          <Block
            heading="The financial posture"
            kicker="Disciplined, not contracting"
            body={
              <>
                FY 2025: <strong className="text-white">$6.69B revenue,
                $2.42B Adjusted EBITDA</strong>. Q1 2026: revenue down 1.1%,
                EBITDA down 7%, Programming &amp; Production costs $519M
                (down 5%). A $1B share buyback authorization plus a $0.375
                quarterly dividend. Translation for vendors: tight line
                items, no scope creep, transparent margins. We bid that way.
              </>
            }
          />

          <Block
            heading="The USA Sports thesis"
            kicker="Nov 2025 announcement"
            body={
              <>
                10,000+ hours of live events, studio shows, and originals
                across USA Network, Golf Channel, and CNBC in 2026. NASCAR
                Cup Playoffs: 7 of 10 Chase races on USA, 3 on NBC/Peacock.
                USGA/PGA media rights through 2032. WNBA, WWE, EPL inside
                the portfolio. Matt Hong: &ldquo;the best of both worlds —
                a start-up mentality and $7 billion revenues.&rdquo;
              </>
            }
          />
        </div>

        <div className="mt-16 rounded-md border border-white/10 bg-white/[0.02] p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/40">
            Where we fit
          </p>
          <p className="font-serif text-2xl leading-relaxed text-white/90">
            Versant is six months into independence. Vendor relationships
            are not yet entrenched. Professor Chase is exactly the kind of
            high-visibility, well-defined first job that proves a partner.
            Golf Channel is the longer-horizon opportunity. We&apos;re
            here for both.
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
      <p className="text-xs uppercase tracking-[0.14em] text-white/40">
        {kicker}
      </p>
      <h3 className="font-serif text-2xl leading-tight text-white">
        {heading}
      </h3>
      <p className="text-sm leading-relaxed text-white/70">{body}</p>
    </div>
  );
}
